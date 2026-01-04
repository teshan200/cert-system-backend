// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateVerificationWithPayment
 * @dev Certificate issuance with on-chain prepaid balances and gas deduction per certificate.
 */
contract CertificateVerificationWithPayment {
    /* ─────────────────── STATE GUARDS ─────────────────── */

    bool public paused;
    /* ─────────────────── ADMIN & ISSUERS ─────────────────── */

    address public admin;
    address public pendingAdmin;
    mapping(address => bool) public issuers;
    mapping(address => uint256) public issuerNonces;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Not paused");
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

    /* ─────────────────── ADMIN OPERATIONS ─────────────────── */

    function pause() external onlyAdmin {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyAdmin {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function initiateOwnershipTransfer(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        pendingAdmin = newAdmin;
        emit OwnershipTransferInitiated(admin, newAdmin);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingAdmin, "Not pending admin");
        address old = admin;
        admin = pendingAdmin;
        pendingAdmin = address(0);
        emit OwnershipTransferred(old, admin);
    }

    function addIssuer(address issuer) external onlyAdmin {
        require(issuer != address(0), "Invalid address");
        issuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    function removeIssuer(address issuer) external onlyAdmin {
        issuers[issuer] = false;
        emit IssuerRemoved(issuer);
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

    /* ─────────────────── GAS & PAYMENT ─────────────────── */

    uint256 public gasLimitPerCertificate = 180000; // adjustable by admin
    uint256 public gasPriceGwei = 100; // adjustable by admin

    mapping(address => uint256) public universityBalance;
    mapping(address => uint256) public universityGasSpent;
    mapping(address => uint256) public universityLastDeposit;

    /* ─────────────────── EVENTS ─────────────────── */

    event CertificateAdded(
        string indexed certId,
        string studentName,
        string courseName,
        address indexed issuerWallet
    );

    event BalanceDeposited(
        address indexed university,
        uint256 amount,
        uint256 newBalance
    );

    event GasDebited(
        address indexed university,
        uint256 gasAmount,
        uint256 newBalance
    );

    event BalanceWithdrawn(
        address indexed university,
        uint256 amount,
        uint256 newBalance
    );

    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event Paused(address indexed account);
    event Unpaused(address indexed account);
    event OwnershipTransferInitiated(address indexed oldAdmin, address indexed newAdmin);
    event OwnershipTransferred(address indexed oldAdmin, address indexed newAdmin);
    event NonceConsumed(address indexed issuer, uint256 nonce);

    /* ─────────────────── PAYMENT FUNCTIONS ─────────────────── */

    function depositGasFund() external payable whenNotPaused {
        require(msg.value > 0, "Amount must be > 0");
        universityBalance[msg.sender] += msg.value;
        universityLastDeposit[msg.sender] = block.timestamp;
        emit BalanceDeposited(msg.sender, msg.value, universityBalance[msg.sender]);
    }

    function withdrawBalance(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(universityBalance[msg.sender] >= amount, "Insufficient balance");

        universityBalance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        emit BalanceWithdrawn(msg.sender, amount, universityBalance[msg.sender]);
    }

    function checkBalance(address university) external view returns (uint256) {
        return universityBalance[university];
    }

    function getGasSpent(address university) external view returns (uint256) {
        return universityGasSpent[university];
    }

    function calculateGasCost() public view returns (uint256) {
        return gasLimitPerCertificate * gasPriceGwei * 1 gwei;
    }

    function setGasConfig(uint256 gasLimit, uint256 gasPriceInGwei) external onlyAdmin {
        require(gasLimit >= 100000, "Gas limit too low");
        require(gasPriceInGwei > 0, "Gas price must be > 0");
        gasLimitPerCertificate = gasLimit;
        gasPriceGwei = gasPriceInGwei;
    }

    /* ─────────────────── BULK-FRIENDLY ISSUE ─────────────────── */

    function addCertificateWithSignature(
        string memory certId,
        string memory studentName,
        string memory courseName,
        string memory issueDate,
        string memory issuerName,
        address authorizedSigner,
        bytes32 messageHash,
        bytes calldata signature
    ) external onlyIssuer(authorizedSigner) whenNotPaused {
        require(!certificates[certId].exists, "Certificate exists");

        // Ensure the message hash is bound to the certificate payload, signer, nonce, contract, and chain
        bytes32 expectedHash = computeCertificateHash(
            certId,
            studentName,
            courseName,
            issueDate,
            issuerName,
            authorizedSigner,
            issuerNonces[authorizedSigner]
        );
        require(messageHash == expectedHash, "Message hash mismatch");

        // Verify signature with EIP-191 prefixed hash (compatible with signMessage)
        bytes32 digest = toEthSignedMessageHash(messageHash);
        address recovered = recoverSigner(digest, signature);
        require(recovered == authorizedSigner, "Invalid signature");

        uint256 gasCost = calculateGasCost();
        require(universityBalance[authorizedSigner] >= gasCost, "Insufficient balance");

        // Deduct and record gas spend
        universityBalance[authorizedSigner] -= gasCost;
        universityGasSpent[authorizedSigner] += gasCost;

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

        // increment nonce after successful processing to prevent replay
        issuerNonces[authorizedSigner] += 1;
        emit NonceConsumed(authorizedSigner, issuerNonces[authorizedSigner] - 1);

        emit GasDebited(authorizedSigner, gasCost, universityBalance[authorizedSigner]);
        emit CertificateAdded(certId, studentName, courseName, authorizedSigner);
    }

    /* ─────────────────── SIGNATURE RECOVERY ─────────────────── */

    function recoverSigner(
        bytes32 digest,
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

        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "Invalid signer");

        return signer;
    }

    function computeCertificateHash(
        string memory certId,
        string memory studentName,
        string memory courseName,
        string memory issueDate,
        string memory issuerName,
        address authorizedSigner,
        uint256 nonce
    ) public view returns (bytes32) {
        return keccak256(
            abi.encode(
                address(this),
                block.chainid,
                authorizedSigner,
                nonce,
                certId,
                studentName,
                courseName,
                issueDate,
                issuerName
            )
        );
    }

    function toEthSignedMessageHash(bytes32 hash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
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

    function certificateExists(string memory certId) external view returns (bool) {
        return certificates[certId].exists;
    }

    function getCertificateCount() external view returns (uint256) {
        return certificateIds.length;
    }

    function getCertificateIdAt(uint256 index) external view returns (string memory) {
        require(index < certificateIds.length, "Out of bounds");
        return certificateIds[index];
    }
}
