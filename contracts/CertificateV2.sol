// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateVerificationBulk
 * @dev Bulk-friendly blockchain certificate system using meta-transactions
 */
contract CertificateVerificationBulk {
    /* ─────────────────── ADMIN & ISSUERS ─────────────────── */

    address public admin;
    mapping(address => bool) public issuers;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyIssuer(address signer) {
        require(issuers[signer], "Not approved issuer");
        _;
    }

    constructor() {
        admin = msg.sender;
        issuers[msg.sender] = true;
    }

    function addIssuer(address issuer) external onlyAdmin {
        require(issuer != address(0), "Invalid address");
        issuers[issuer] = true;
    }

    function removeIssuer(address issuer) external onlyAdmin {
        issuers[issuer] = false;
    }

    /* ─────────────────── CERTIFICATE DATA ─────────────────── */

    struct Certificate {
        string studentName;
        string courseName;
        string issueDate;
        string issuerName;
        address issuerWallet;
        bool isValid;
        bool exists;
    }

    mapping(string => Certificate) private certificates;
    string[] public certificateIds;

    /* ─────────────────── EVENTS ─────────────────── */

    event CertificateAdded(
        string indexed certId,
        string studentName,
        string courseName,
        address indexed issuerWallet
    );

    /* ─────────────────── BULK META-TX FUNCTION ─────────────────── */

    /**
     * @dev Add certificate using off-chain signature (bulk friendly)
     */
    function addCertificateWithSignature(
        string memory certId,
        string memory studentName,
        string memory courseName,
        string memory issueDate,
        string memory issuerName,
        address authorizedSigner,
        bytes32 messageHash,
        bytes calldata signature
    ) external onlyIssuer(authorizedSigner) {

        require(!certificates[certId].exists, "Certificate exists");

        address recovered = recoverSigner(messageHash, signature);
        require(recovered == authorizedSigner, "Invalid signature");

        certificates[certId] = Certificate({
            studentName: studentName,
            courseName: courseName,
            issueDate: issueDate,
            issuerName: issuerName,
            issuerWallet: authorizedSigner,
            isValid: true,
            exists: true
        });

        certificateIds.push(certId);

        emit CertificateAdded(certId, studentName, courseName, authorizedSigner);
    }

    /* ─────────────────── SIGNATURE RECOVERY ─────────────────── */

    function recoverSigner(
        bytes32 messageHash,
        bytes calldata signature
    ) internal pure returns (address) {

        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(add(signature.offset, 0x00))
            s := calldataload(add(signature.offset, 0x20))
            v := byte(0, calldataload(add(signature.offset, 0x40)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid v");

        address signer = ecrecover(messageHash, v, r, s);
        require(signer != address(0), "Invalid signer");

        return signer;
    }

    /* ─────────────────── READ FUNCTIONS ─────────────────── */

    function verifyCertificate(string memory certId)
        external
        view
        returns (
            string memory studentName,
            string memory courseName,
            string memory issueDate,
            string memory issuerName,
            address issuerWallet,
            bool isValid
        )
    {
        require(certificates[certId].exists, "Not found");
        Certificate memory cert = certificates[certId];
        return (
            cert.studentName,
            cert.courseName,
            cert.issueDate,
            cert.issuerName,
            cert.issuerWallet,
            cert.isValid
        );
    }

    function certificateExists(string memory certId)
        external
        view
        returns (bool)
    {
        return certificates[certId].exists;
    }

    function getCertificateCount() external view returns (uint256) {
        return certificateIds.length;
    }

    function getCertificateIdAt(uint256 index)
        external
        view
        returns (string memory)
    {
        require(index < certificateIds.length, "Out of bounds");
        return certificateIds[index];
    }
}
