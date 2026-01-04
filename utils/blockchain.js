// Blockchain Integration - Interact with CertificateVerificationBulk
const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI for CertificateVerificationNoNonce (deployed on Polygon Amoy)
const CONTRACT_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [], "name": "ECDSAInvalidSignature", "type": "error" },
  { "inputs": [ { "internalType": "uint256", "name": "length", "type": "uint256" } ], "name": "ECDSAInvalidSignatureLength", "type": "error" },
  { "inputs": [ { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "ECDSAInvalidSignatureS", "type": "error" },
  { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" },
  { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "university", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "BalanceWithdrawn", "type": "event" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "string", "name": "certId", "type": "string" }, { "indexed": false, "internalType": "string", "name": "studentName", "type": "string" }, { "indexed": false, "internalType": "string", "name": "courseName", "type": "string" }, { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }, { "indexed": false, "internalType": "string", "name": "issueDate", "type": "string" } ], "name": "CertificateIssued", "type": "event" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "university", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "GasFundDeposited", "type": "event" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" } ], "name": "IssuerAdded", "type": "event" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" } ], "name": "IssuerRemoved", "type": "event" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferStarted", "type": "event" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
  { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "string", "name": "certId", "type": "string" }, { "internalType": "string", "name": "studentName", "type": "string" }, { "internalType": "string", "name": "courseName", "type": "string" }, { "internalType": "string", "name": "issueDate", "type": "string" }, { "internalType": "string", "name": "issuerName", "type": "string" }, { "internalType": "address", "name": "authorizedSigner", "type": "address" }, { "internalType": "bytes32", "name": "messageHash", "type": "bytes32" }, { "internalType": "bytes", "name": "signature", "type": "bytes" } ], "name": "addCertificateWithSignature", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "string", "name": "certId", "type": "string" }, { "internalType": "string", "name": "studentName", "type": "string" }, { "internalType": "string", "name": "courseName", "type": "string" }, { "internalType": "string", "name": "issueDate", "type": "string" }, { "internalType": "string", "name": "issuerName", "type": "string" }, { "internalType": "address", "name": "authorizedSigner", "type": "address" }, { "internalType": "bytes32", "name": "authHash", "type": "bytes32" }, { "internalType": "bytes", "name": "authSignature", "type": "bytes" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "certificateCount", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" } ], "name": "addCertificateWithAuth", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "issuer", "type": "address" } ], "name": "addIssuer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "relayer", "type": "address" } ], "name": "addRelayer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "name": "bulkUsed", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "depositGasFund", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "gasLimitPerCertificate", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "gasPriceForCertificate", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "string", "name": "certId", "type": "string" } ], "name": "getCertificate", "outputs": [ { "components": [ { "internalType": "string", "name": "studentName", "type": "string" }, { "internalType": "string", "name": "courseName", "type": "string" }, { "internalType": "string", "name": "issueDate", "type": "string" }, { "internalType": "string", "name": "issuerName", "type": "string" }, { "internalType": "address", "name": "issuer", "type": "address" }, { "internalType": "bool", "name": "exists", "type": "bool" } ], "internalType": "struct CertificateVerificationNoNonce.Certificate", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getNativeBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "issuers", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "pendingOwner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "issuer", "type": "address" } ], "name": "removeIssuer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "relayer", "type": "address" } ], "name": "removeRelayer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "relayers", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "universityBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "_gasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "_gasPrice", "type": "uint256" } ], "name": "updateGasParameters", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "string", "name": "certId", "type": "string" } ], "name": "verifyCertificate", "outputs": [ { "internalType": "bool", "name": "exists", "type": "bool" }, { "internalType": "string", "name": "studentName", "type": "string" }, { "internalType": "string", "name": "courseName", "type": "string" }, { "internalType": "string", "name": "issueDate", "type": "string" }, { "internalType": "string", "name": "issuerName", "type": "string" }, { "internalType": "address", "name": "issuer", "type": "address" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "withdrawAllNative", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "withdrawBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "withdrawNative", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "stateMutability": "payable", "type": "receive" }
];

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.wallet
    );
  }

  /**
   * Convert wei to POL for readability
   */
  formatWeiToPol(valueWei) {
    return Number(ethers.utils.formatEther(valueWei));
  }

  /**
   * Fetch on-chain gas cost configured for a single certificate
   */
  async getGasCostWei() {
    const [limit, price] = await Promise.all([
      this.contract.gasLimitPerCertificate(),
      this.contract.gasPriceForCertificate()
    ]);
    return ethers.BigNumber.from(limit).mul(price);
  }

  /**
   * Get a university's on-chain prepaid balance
   */
  async getUniversityBalance(address) {
    const bal = await this.contract.universityBalance(address);
    return ethers.BigNumber.from(bal);
  }

  /**
   * Get total gas spent for a university
   */
  async getUniversityGasSpent(address) {
    // Current contract does not track gas spent separately; return zero for display
    return ethers.BigNumber.from(0);
  }

  /**
   * Issue certificate on blockchain using meta-transaction signature
   * @param {string} certId - Certificate ID
   * @param {string} studentName - Student name
   * @param {string} courseName - Course name
   * @param {string} issueDate - Issue date (YYYY-MM-DD)
   * @param {string} issuerName - Issuer/University name
   * @returns {object} Transaction hash and details
   */
  async issueCertificate(certId, studentName, courseName, issueDate, issuerName) {
    try {
      console.log(`📝 Issuing certificate on blockchain: ${certId}`);

      // Use relayer as authorized signer (must be approved issuer with balance)
      const relayerAddress = this.wallet.address;
      console.log(`✅ Relayer address: ${relayerAddress}`);

      // Create the message hash (no nonce)
      const { messageHash } = await this.computeCertificateHash(
        { certId, studentName, courseName, issueDate, issuerName },
        relayerAddress
      );
      console.log(`✅ Message hash created: ${messageHash}`);

      // Sign using EIP-191 prefix to match contract's toEthSignedMessageHash
      const signature = await this.wallet.signMessage(ethers.utils.arrayify(messageHash));
      console.log(`✅ Signature created with prefix: ${signature}`);

      // Step 5: Preflight with callStatic to capture revert reason
      console.log(`🔍 Preflight callStatic.addCertificateWithSignature(...)`);
      await this.contract.callStatic.addCertificateWithSignature(
        certId,
        studentName,
        courseName,
        issueDate,
        issuerName,
        relayerAddress,
        messageHash,
        signature
      );

      // Step 6: Send transaction
      console.log(`📢 Calling contract.addCertificateWithSignature(...)`);
      const feeOverrides = {
        maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
        maxFeePerGas: ethers.utils.parseUnits('60', 'gwei')
      };
      const tx = await this.contract.addCertificateWithSignature(
        certId,
        studentName,
        courseName,
        issueDate,
        issuerName,
        relayerAddress,       // authorizedSigner
        messageHash,          // bytes32 messageHash
        signature,            // bytes signature (65 bytes: r + s + v)
        feeOverrides
      );

      console.log(`⏳ Waiting for transaction: ${tx.hash}`);
      const receipt = await tx.wait();

      if (receipt && receipt.status === 1) {
        console.log(`✅ ✅ ✅ CERTIFICATE ISSUED SUCCESSFULLY! ✅ ✅ ✅`);
        console.log(`✅ Block number: ${receipt.blockNumber}`);
        console.log(`✅ Gas used: ${receipt.gasUsed.toString()}`);
        return {
          success: true,
          // receipt.transactionHash is the canonical hash; fall back to tx.hash just in case
          transactionHash: receipt.transactionHash || tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          from: receipt.from,
          certificateId: certId
        };
      } else if (receipt && receipt.status === 0) {
        console.error('❌ Contract rejected the transaction (status=0)');
        console.error('The signature verification likely failed in the contract');
        console.error('This could mean:');
        console.error('1. Relayer wallet is not registered as an issuer');
        console.error('2. Contract has a bug in signature verification');
        console.error('3. Message hash computation differs from contract');
        return {
          success: false,
          error: 'Contract rejected the transaction - signature verification failed',
          transactionHash: receipt?.transactionHash || tx.hash,
          status: receipt.status
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed - no receipt',
          transactionHash: tx.hash
        };
      }
    } catch (error) {
      const reason = error?.error?.message || error?.data?.message || error?.reason || error?.message;
      const code = error?.code || error?.error?.code || 'unknown';
      console.error('❌ Blockchain error:', reason);
      console.error('Code:', code, 'Data:', error?.data);

      return {
        success: false,
        error: reason || 'Unknown blockchain error'
      };
    }
  }

  /**
   * Build the deterministic message hash used for signing and verification
   */
  buildMessageHash(certData, signerAddress) {
    const { certId, studentName, courseName, issueDate, issuerName } = certData;
    return ethers.utils.solidityKeccak256(
      ['string', 'string', 'string', 'string', 'string', 'address'],
      [certId, studentName, courseName, issueDate, issuerName, signerAddress]
    );
  }

  /**
   * Compute certificate hash locally (no nonce - allows sign-once-bulk)
   */
  async computeCertificateHash(certData, signerAddress) {
    const { certId, studentName, courseName, issueDate, issuerName } = certData;
    const messageHash = ethers.utils.solidityKeccak256(
      ['string', 'string', 'string', 'string', 'string', 'address'],
      [certId, studentName, courseName, issueDate, issuerName, signerAddress]
    );
    return { messageHash };
  }

  /**
   * Verify certificate on blockchain
   * @param {string} certId - Certificate ID
   * @returns {object} Verification details
   */
  async verifyCertificate(certId) {
    try {
      console.log(`🔍 Verifying certificate on blockchain: ${certId}`);

      // Check if certificate exists on blockchain
      const exists = await this.contract.certificateExists(certId);

      if (!exists) {
        return {
          exists: false,
          verified: false,
          message: 'Certificate not found on blockchain'
        };
      }

      // Get certificate details from contract
      // Returns: (studentName, courseName, issueDate, issuerName, issuerWallet, isValid)
      const result = await this.contract.verifyCertificate(certId);

      return {
        exists: true,
        verified: result[5], // isValid boolean
        data: {
          certificateId: certId,
          studentName: result[0],
          courseName: result[1],
          issueDate: result[2],
          issuerName: result[3],
          issuerWallet: result[4]
        }
      };
    } catch (error) {
      console.error('❌ Verification error:', error.message);
      return {
        exists: false,
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Get certificate from blockchain
   * @param {string} certId - Certificate ID
   * @returns {object} Certificate data
   */
  async getCertificateData(certId) {
    try {
      const exists = await this.contract.certificateExists(certId);
      if (!exists) {
        return null;
      }

      const result = await this.contract.verifyCertificate(certId);
      return {
        certificateId: certId,
        studentName: result[0],
        courseName: result[1],
        issueDate: result[2],
        issuerName: result[3],
        issuerWallet: result[4],
        isValid: result[5]
      };
    } catch (error) {
      console.error('❌ Get certificate error:', error.message);
      return null;
    }
  }

  /**
   * Compare blockchain vs database data
   * @param {object} dbCert - Certificate from database
   * @param {object} blockchainCert - Certificate from blockchain
   * @returns {object} Comparison result
   */
  compareData(dbCert, blockchainCert) {
    if (!blockchainCert) {
      return {
        match: false,
        differences: ['Certificate not found on blockchain']
      };
    }

    const differences = [];

    if (dbCert.certificate_id !== blockchainCert.certificateId) {
      differences.push('Certificate ID mismatch');
    }
    if (dbCert.student_name !== blockchainCert.studentName) {
      differences.push('Student name mismatch');
    }
    if (dbCert.course !== blockchainCert.courseName) {
      differences.push('Course name mismatch');
    }

    return {
      match: differences.length === 0,
      differences: differences.length > 0 ? differences : null,
      verified: true
    };
  }

  /**
   * Issue certificate using MetaMask signature
   * The signature was created on the frontend by MetaMask
   * @param {object} certData - Certificate data
   * @param {string} messageHash - The hash that was signed
   * @param {string} signature - MetaMask signature
   * @param {string} signerAddress - The MetaMask wallet address
   * @returns {object} Transaction result
   */
  async issueWithMetaMaskSignature(certData, messageHash, signature, signerAddress) {
    try {
      console.log('📝 Issuing certificate with MetaMask signature (relayer submit)...');
      console.log('   Signer:', signerAddress);
      console.log('   Message Hash (raw):', messageHash);

      // Recompute the hash to ensure it matches
      const { messageHash: contractHash } = await this.computeCertificateHash(certData, signerAddress);
      if (contractHash.toLowerCase() !== messageHash.toLowerCase()) {
        throw new Error('Message hash mismatch with computed hash');
      }

      // Verify the signature recovers to the correct address (signMessage adds prefix internally)
      const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature);
      console.log('   Recovered address:', recoveredAddress);

      if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error('Signature verification failed - recovered address does not match signer');
      }

      // Optional: ensure signer is an authorized issuer
      const isIssuer = await this.isIssuer(signerAddress);
      if (!isIssuer) {
        throw new Error('Signer is not an authorized issuer on-chain');
      }

      // Ensure on-chain prepaid balance covers the gas debit
      const [balanceWei, gasCostWei] = await Promise.all([
        this.getUniversityBalance(signerAddress),
        this.getGasCostWei()
      ]);

      if (balanceWei.lt(gasCostWei)) {
        const shortfall = gasCostWei.sub(balanceWei);
        throw new Error(`Insufficient on-chain balance. Need ${ethers.utils.formatEther(shortfall)} more POL`);
      }

      console.log('🔍 Preflight callStatic.addCertificateWithSignature(...)');
      await this.contract.callStatic.addCertificateWithSignature(
        certData.certId,
        certData.studentName,
        certData.courseName,
        certData.issueDate,
        certData.issuerName,
        signerAddress,
        messageHash,
        signature
      );

      console.log('📤 Submitting transaction with relayer...');
      const tx = await this.contract.addCertificateWithSignature(
        certData.certId,
        certData.studentName,
        certData.courseName,
        certData.issueDate,
        certData.issuerName,
        signerAddress,
        messageHash,
        signature,
        {
          maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
          maxFeePerGas: ethers.utils.parseUnits('60', 'gwei')
        }
      );

      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();

      console.log('✅ Certificate issued successfully!');
      console.log('   Transaction Hash:', receipt.transactionHash);
      console.log('   Block Number:', receipt.blockNumber);
      console.log('   Gas Used:', receipt.gasUsed.toString());
      console.log('   Status:', receipt.status);

      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      };

    } catch (error) {
      console.error('❌ Error issuing certificate with MetaMask signature:', error.message);
      throw error;
    }
  }

  /**
   * Issue certificate using a provided messageHash/signature without recomputing (for legacy/bulk "sign once" flows)
   * WARNING: This relies entirely on the caller to bind the hash to the intended certificates.
   */
  async issueWithExternalSignature(certData, messageHash, signature, signerAddress) {
    try {
      console.log('📝 Issuing certificate with external signature (no recompute)...');
      console.log('   Signer:', signerAddress);
      console.log('   Message Hash (client provided):', messageHash);

      // Basic signature check only
      const recoveredAddress = ethers.utils.recoverAddress(messageHash, signature);
      if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error('Signature verification failed - recovered address does not match signer');
      }

      // Preflight callStatic to capture revert reasons
      await this.contract.callStatic.addCertificateWithSignature(
        certData.certId,
        certData.studentName,
        certData.courseName,
        certData.issueDate,
        certData.issuerName,
        signerAddress,
        messageHash,
        signature
      );

      const tx = await this.contract.addCertificateWithSignature(
        certData.certId,
        certData.studentName,
        certData.courseName,
        certData.issueDate,
        certData.issuerName,
        signerAddress,
        messageHash,
        signature,
        {
          maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
          maxFeePerGas: ethers.utils.parseUnits('60', 'gwei')
        }
      );

      const receipt = await tx.wait();

      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      };
    } catch (error) {
      console.error('❌ Error issuing certificate with external signature:', error.message);
      throw error;
    }
  }

  /**
   * Issue certificate using bulk authorization signature (one sig reused)
   */
  async issueWithBulkAuth(certData, authHash, authSignature, signerAddress, batchId, certificateCount, expiry) {
    try {
      console.log('📝 Issuing certificate with bulk auth...');
      console.log('   Cert Data:', JSON.stringify(certData));
      console.log('   Signer:', signerAddress, typeof signerAddress);
      console.log('   Auth Hash:', authHash, typeof authHash);
      console.log('   Auth Signature:', authSignature, typeof authSignature);
      console.log('   Batch ID:', batchId, typeof batchId);
      console.log('   Certificate Count:', certificateCount, typeof certificateCount);
      console.log('   Expiry:', expiry, typeof expiry);

      // Validate all parameters
      if (!certData || !certData.certId) {
        throw new Error('Invalid certData: certId is missing');
      }
      if (!signerAddress || typeof signerAddress !== 'string' || !signerAddress.startsWith('0x')) {
        throw new Error(`Invalid signerAddress: ${signerAddress}`);
      }
      if (!authHash || typeof authHash !== 'string' || !authHash.startsWith('0x')) {
        throw new Error(`Invalid authHash: ${authHash}`);
      }
      if (!authSignature || typeof authSignature !== 'string' || !authSignature.startsWith('0x')) {
        throw new Error(`Invalid authSignature: ${authSignature}`);
      }
      if (typeof batchId !== 'number' || batchId < 0) {
        throw new Error(`Invalid batchId: ${batchId}`);
      }
      if (typeof certificateCount !== 'number' || certificateCount < 0) {
        throw new Error(`Invalid certificateCount: ${certificateCount}`);
      }
      if (typeof expiry !== 'number' || expiry < 0) {
        throw new Error(`Invalid expiry: ${expiry}`);
      }

      // Preflight callStatic to capture revert reasons
      await this.contract.callStatic.addCertificateWithAuth(
        certData.certId,
        certData.studentName,
        certData.courseName,
        certData.issueDate,
        certData.issuerName,
        signerAddress,
        authHash,
        authSignature,
        batchId,
        certificateCount,
        expiry
      );

      const tx = await this.contract.addCertificateWithAuth(
        certData.certId,
        certData.studentName,
        certData.courseName,
        certData.issueDate,
        certData.issuerName,
        signerAddress,
        authHash,
        authSignature,
        batchId,
        certificateCount,
        expiry,
        {
          maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
          maxFeePerGas: ethers.utils.parseUnits('60', 'gwei')
        }
      );

      const receipt = await tx.wait();

      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      };
    } catch (error) {
      console.error('❌ Error issuing certificate with bulk auth:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Issue certificate using Option 3 prepaid on-chain balance
   */
  async issueWithPayment(certData, messageHash, signature, signerAddress) {
    return this.issueWithMetaMaskSignature(certData, messageHash, signature, signerAddress);
  }

  /**
   * Bulk issuance helper for Option 3 (sequential to preserve per-cert receipts)
   */
  async issueBulkWithPayment(entries, signerAddress) {
    const results = [];
    for (const entry of entries) {
      const { certData, messageHash, signature } = entry;
      const result = await this.issueWithPayment(certData, messageHash, signature, signerAddress);
      results.push({ certId: certData.certId, ...result });
    }
    return results;
  }

  /**
   * Add an issuer (admin only; uses current wallet signer)
   */
  async addIssuer(issuerAddress) {
    const tx = await this.contract.addIssuer(issuerAddress, { gasLimit: 120000 });
    const receipt = await tx.wait();
    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    };
  }

  /**
   * Remove an issuer (admin only)
   */
  async removeIssuer(issuerAddress) {
    const tx = await this.contract.removeIssuer(issuerAddress, { gasLimit: 120000 });
    const receipt = await tx.wait();
    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    };
  }

  /**
   * Check if address is an issuer
   */
  async isIssuer(address) {
    return this.contract.issuers(address);
  }

  /**
   * Check contract balance (for gas)
   * @returns {string} Balance in ETH
   */
  async checkBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Balance check error:', error.message);
      return null;
    }
  }

  /**
   * Get network information
   * @returns {object} Network details
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const balance = await this.checkBalance();

      return {
        network: network.name,
        chainId: network.chainId,
        rpcUrl: process.env.RPC_URL,
        contractAddress: process.env.CONTRACT_ADDRESS,
        relayerAddress: this.wallet.address,
        relayerBalance: balance + ' ETH'
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }
}

module.exports = new BlockchainService();
