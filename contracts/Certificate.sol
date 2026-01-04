// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Certificate
 * @dev Blockchain-based certificate issuance system with signature-based authorization
 */
contract Certificate {
    // Struct to store certificate data in clear text
    struct CertificateData {
        string certificateId;
        string recipientName;
        string courseName;
        address issuedBy;
        uint256 issuedAt;
        bool exists;
    }

    // Admin address who can approve institutes
    address public admin;

    // Track which institutes are approved to issue certificates
    mapping(address => bool) public approvedInstitutes;

    // Nonce per institute to prevent replay attacks
    mapping(address => uint256) public nonces;

    // Store issued certificates with clear text data: certId => CertificateData
    mapping(string => CertificateData) public certificates;

    // Events for transparency
    event InstituteApproved(address indexed institute);
    event InstituteRevoked(address indexed institute);
    event CertificateIssued(
        string indexed certificateId,
        string recipientName,
        string courseName,
        address indexed institute,
        uint256 timestamp
    );

    /**
     * @dev Constructor sets the deployer as admin
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Only admin can call this function
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    /**
     * @dev Approve an institute to issue certificates
     * @param institute The address of the institute
     */
    function approveInstitute(address institute) external onlyAdmin {
        require(institute != address(0), "Invalid institute address");
        approvedInstitutes[institute] = true;
        emit InstituteApproved(institute);
    }

    /**
     * @dev Revoke an institute's approval
     * @param institute The address of the institute
     */
    function revokeInstitute(address institute) external onlyAdmin {
        approvedInstitutes[institute] = false;
        emit InstituteRevoked(institute);
    }

    /**
     * @dev Issue a certificate with signature-based authorization
     * Prevents replay attacks using nonce and signature verification
     *
     * @param certificateId Unique certificate ID
     * @param recipientName Name of the recipient
     * @param courseName Name of the course
     * @param institute Address of the approving institute
     * @param messageHash The hash of the plain-text message signed by institute
     * @param signature The signature from the institute's wallet
     */
    function issueWithSig(
        string memory certificateId,
        string memory recipientName,
        string memory courseName,
        address institute,
        bytes32 messageHash,
        bytes calldata signature
    ) external {
        // Verify institute is approved
        require(approvedInstitutes[institute], "Institute not approved");

        // Verify certificate not already issued
        require(!certificates[certificateId].exists, "Certificate already issued");

        // Recover signer from signature
        address signer = recoverSigner(messageHash, signature);

        // Verify the signer is the institute
        require(signer == institute, "Invalid signature");

        // Prevent replay attacks: increment nonce
        nonces[institute]++;

        // Store certificate with all data in clear text
        certificates[certificateId] = CertificateData({
            certificateId: certificateId,
            recipientName: recipientName,
            courseName: courseName,
            issuedBy: institute,
            issuedAt: block.timestamp,
            exists: true
        });

        // Emit event for transparency
        emit CertificateIssued(certificateId, recipientName, courseName, institute, block.timestamp);
    }

    /**
     * @dev Recover the signer of a message from its signature
     * Uses eth_sign format: keccak256("\x19Ethereum Signed Message:\n" + len(msg) + msg)
     * 
     * The signature should be 65 bytes: r (32) + s (32) + v (1)
     */
    function recoverSigner(bytes32 messageHash, bytes calldata signature)
        internal
        pure
        returns (address)
    {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        // Extract r, s, v from signature (0-32, 32-64, 64)
        assembly {
            r := calldataload(add(signature.offset, 0x00))
            s := calldataload(add(signature.offset, 0x20))
            v := byte(0, calldataload(add(signature.offset, 0x40)))
        }

        // v must be 27 or 28
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature v value");

        // Recover signer using ecrecover
        // ecrecover expects the hash, v, r, s
        address recovered = ecrecover(messageHash, v, r, s);
        require(recovered != address(0), "Invalid signature - recovery failed");

        return recovered;
    }

    /**
     * @dev Check if a certificate has been issued
     */
    function isCertificateIssued(string memory certificateId) external view returns (bool) {
        return certificates[certificateId].exists;
    }

    /**
     * @dev Get certificate details
     */
    function getCertificate(string memory certificateId) 
        external 
        view 
        returns (
            string memory,
            string memory,
            string memory,
            address,
            uint256
        ) 
    {
        CertificateData memory cert = certificates[certificateId];
        require(cert.exists, "Certificate does not exist");
        
        return (
            cert.certificateId,
            cert.recipientName,
            cert.courseName,
            cert.issuedBy,
            cert.issuedAt
        );
    }

    /**
     * @dev Get the current nonce for an institute
     */
    function getNonce(address institute) external view returns (uint256) {
        return nonces[institute];
    }
}
