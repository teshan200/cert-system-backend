// MetaMask Integration for Certificate Issuance (Option 3 on-chain payment)
// Handles MetaMask connection, signing, deposit, and issuance helper calls.
console.log('🟣 metamask-integration.js loaded');

class MetaMaskIntegration {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.userAddress = null;
    this.chainId = null;
    this.CONTRACT_ADDRESS = '0x13660206fF34b48b07422a6658BfD93242b6a126';
    this.CHAIN_ID = 80002; // Polygon Amoy
    this.RPC_URL = 'https://rpc-amoy.polygon.technology';
    this.CONTRACT_ABI = [
      { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
      { inputs: [], name: 'ECDSAInvalidSignature', type: 'error' },
      { inputs: [ { internalType: 'uint256', name: 'length', type: 'uint256' } ], name: 'ECDSAInvalidSignatureLength', type: 'error' },
      { inputs: [ { internalType: 'bytes32', name: 's', type: 'bytes32' } ], name: 'ECDSAInvalidSignatureS', type: 'error' },
      { inputs: [ { internalType: 'address', name: 'owner', type: 'address' } ], name: 'OwnableInvalidOwner', type: 'error' },
      { inputs: [ { internalType: 'address', name: 'account', type: 'address' } ], name: 'OwnableUnauthorizedAccount', type: 'error' },
      { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'university', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' } ], name: 'BalanceWithdrawn', type: 'event' },
      { anonymous: false, inputs: [ { indexed: true, internalType: 'string', name: 'certId', type: 'string' }, { indexed: false, internalType: 'string', name: 'studentName', type: 'string' }, { indexed: false, internalType: 'string', name: 'courseName', type: 'string' }, { indexed: true, internalType: 'address', name: 'issuer', type: 'address' }, { indexed: false, internalType: 'string', name: 'issueDate', type: 'string' } ], name: 'CertificateIssued', type: 'event' },
      { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'university', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' } ], name: 'GasFundDeposited', type: 'event' },
      { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'issuer', type: 'address' } ], name: 'IssuerAdded', type: 'event' },
      { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'issuer', type: 'address' } ], name: 'IssuerRemoved', type: 'event' },
      { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' }, { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' } ], name: 'OwnershipTransferStarted', type: 'event' },
      { anonymous: false, inputs: [ { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' }, { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' } ], name: 'OwnershipTransferred', type: 'event' },
      { inputs: [], name: 'acceptOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'string', name: 'certId', type: 'string' }, { internalType: 'string', name: 'studentName', type: 'string' }, { internalType: 'string', name: 'courseName', type: 'string' }, { internalType: 'string', name: 'issueDate', type: 'string' }, { internalType: 'string', name: 'issuerName', type: 'string' }, { internalType: 'address', name: 'authorizedSigner', type: 'address' }, { internalType: 'bytes32', name: 'messageHash', type: 'bytes32' }, { internalType: 'bytes', name: 'signature', type: 'bytes' } ], name: 'addCertificateWithSignature', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'string', name: 'certId', type: 'string' }, { internalType: 'string', name: 'studentName', type: 'string' }, { internalType: 'string', name: 'courseName', type: 'string' }, { internalType: 'string', name: 'issueDate', type: 'string' }, { internalType: 'string', name: 'issuerName', type: 'string' }, { internalType: 'address', name: 'authorizedSigner', type: 'address' }, { internalType: 'bytes32', name: 'authHash', type: 'bytes32' }, { internalType: 'bytes', name: 'authSignature', type: 'bytes' }, { internalType: 'uint256', name: 'batchId', type: 'uint256' }, { internalType: 'uint256', name: 'certificateCount', type: 'uint256' }, { internalType: 'uint256', name: 'expiry', type: 'uint256' } ], name: 'addCertificateWithAuth', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'address', name: 'issuer', type: 'address' } ], name: 'addIssuer', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'address', name: 'relayer', type: 'address' } ], name: 'addRelayer', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'bytes32', name: '', type: 'bytes32' } ], name: 'bulkUsed', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'depositGasFund', outputs: [], stateMutability: 'payable', type: 'function' },
      { inputs: [], name: 'gasLimitPerCertificate', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'gasPriceForCertificate', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function' },
      { inputs: [ { internalType: 'string', name: 'certId', type: 'string' } ], name: 'getCertificate', outputs: [ { components: [ { internalType: 'string', name: 'studentName', type: 'string' }, { internalType: 'string', name: 'courseName', type: 'string' }, { internalType: 'string', name: 'issueDate', type: 'string' }, { internalType: 'string', name: 'issuerName', type: 'string' }, { internalType: 'address', name: 'issuer', type: 'address' }, { internalType: 'bool', name: 'exists', type: 'bool' } ], internalType: 'struct CertificateVerificationNoNonce.Certificate', name: '', type: 'tuple' } ], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'getNativeBalance', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function' },
      { inputs: [ { internalType: 'address', name: '', type: 'address' } ], name: 'issuers', outputs: [ { internalType: 'bool', name: '', type: 'bool' } ], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'owner', outputs: [ { internalType: 'address', name: '', type: 'address' } ], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'pendingOwner', outputs: [ { internalType: 'address', name: '', type: 'address' } ], stateMutability: 'view', type: 'function' },
      { inputs: [ { internalType: 'address', name: 'issuer', type: 'address' } ], name: 'removeIssuer', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'address', name: 'relayer', type: 'address' } ], name: 'removeRelayer', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'address', name: 'newOwner', type: 'address' } ], name: 'transferOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'address', name: '', type: 'address' } ], name: 'relayers', outputs: [ { internalType: 'bool', name: '', type: 'bool' } ], stateMutability: 'view', type: 'function' },
      { inputs: [ { internalType: 'address', name: '', type: 'address' } ], name: 'universityBalance', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function' },
      { inputs: [ { internalType: 'uint256', name: '_gasLimit', type: 'uint256' }, { internalType: 'uint256', name: '_gasPrice', type: 'uint256' } ], name: 'updateGasParameters', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'string', name: 'certId', type: 'string' } ], name: 'verifyCertificate', outputs: [ { internalType: 'bool', name: 'exists', type: 'bool' }, { internalType: 'string', name: 'studentName', type: 'string' }, { internalType: 'string', name: 'courseName', type: 'string' }, { internalType: 'string', name: 'issueDate', type: 'string' }, { internalType: 'string', name: 'issuerName', type: 'string' }, { internalType: 'address', name: 'issuer', type: 'address' } ], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'withdrawAllNative', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'uint256', name: 'amount', type: 'uint256' } ], name: 'withdrawBalance', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [ { internalType: 'uint256', name: 'amount', type: 'uint256' } ], name: 'withdrawNative', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { stateMutability: 'payable', type: 'receive' }
    ];
  }

  /** Check if MetaMask is installed */
  static isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  }

  /** Connect MetaMask wallet */
  async connect() {
    if (!MetaMaskIntegration.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.signer = this.provider.getSigner();
    this.userAddress = accounts[0];

    await this.switchToPolygonAmoy();
    this.setupEventListeners();
    return this.userAddress;
  }

  /** Switch to Polygon Amoy network */
  async switchToPolygonAmoy() {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const amoyChainId = '0x' + this.CHAIN_ID.toString(16);

    if (currentChainId !== amoyChainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: amoyChainId }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await this.addPolygonAmoyNetwork();
        } else {
          throw switchError;
        }
      }
    }

    this.chainId = this.CHAIN_ID;
  }

  /** Add Polygon Amoy network */
  async addPolygonAmoyNetwork() {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x' + this.CHAIN_ID.toString(16),
          chainName: 'Polygon Amoy',
          rpcUrls: [this.RPC_URL],
          nativeCurrency: { name: 'Polygon', symbol: 'POL', decimals: 18 },
          blockExplorerUrls: ['https://amoy.polygonscan.com/']
        }
      ]
    });
  }

  /** Setup MetaMask event listeners */
  setupEventListeners() {
    window.ethereum.on('accountsChanged', (accounts) => {
      this.userAddress = accounts[0];
      this.signer = this.provider.getSigner();
      window.dispatchEvent(new CustomEvent('metamask:accountChanged', { detail: accounts[0] }));
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }

  /** Build message hash matching the contract */
  createMessageHash(certId, studentName, courseName, issueDate, issuerName, signerAddress) {
    return ethers.utils.solidityKeccak256(
      ['string', 'string', 'string', 'string', 'string', 'address'],
      [certId, studentName, courseName, issueDate, issuerName, signerAddress]
    );
  }

  /** Sign a 32-byte hash using personal_sign directly - NO ETHERS UTILITIES */
  async signMessageHash(messageHash) {
    console.log('🔑 signMessageHash START');
    
    // Simple validation without using ethers utilities
    if (!messageHash) {
      throw new Error('messageHash is empty');
    }
    if (typeof messageHash !== 'string') {
      throw new Error('messageHash must be string, got: ' + typeof messageHash);
    }
    if (messageHash.length < 66) {
      throw new Error('messageHash too short: ' + messageHash.length);
    }

    // Ensure wallet address exists
    if (!this.userAddress) {
      throw new Error('Wallet not connected (userAddress missing). Please Connect MetaMask.');
    }
    
    console.log('   Hash:', messageHash.substring(0, 20) + '...');
    console.log('   Type:', typeof messageHash);
    console.log('   User:', this.userAddress);
    
    try {
      // Use window.ethereum directly - no ethers utilities involved
      console.log('   Calling personal_sign...');
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageHash, this.userAddress]
      });
      
      console.log('   ✓ Signature received:', signature.substring(0, 20) + '...');
      return signature;
    } catch (err) {
      console.error('   ❌ personal_sign failed:', err.message);
      console.error('   Stack:', err.stack);
      throw err;
    }
  }

  /** Sign certificate payload and return signed envelope */
  async signAndIssueCertificate(certData) {
    if (!this.userAddress) throw new Error('Wallet not connected');

    const messageHash = this.createMessageHash(
      certData.certId,
      certData.studentName,
      certData.courseName,
      certData.issueDate,
      certData.issuerName,
      this.userAddress
    );

    const signature = await this.signMessageHash(messageHash);
    return { messageHash, signature, signerAddress: this.userAddress, certData };
  }

  /** Contract instance with MetaMask signer */
  getContractWithSigner() {
    if (!this.signer) throw new Error('Signer not ready');
    return new ethers.Contract(this.CONTRACT_ADDRESS, this.CONTRACT_ABI, this.signer);
  }

  /** Deposit POL into the contract as prepaid gas */
  async depositGasFunds(amountPol) {
    if (!amountPol || Number(amountPol) <= 0) throw new Error('Enter amount > 0');
    const contract = this.getContractWithSigner();
    const tx = await contract.depositGasFund({
      value: ethers.utils.parseEther(String(amountPol)),
      gasLimit: 120000
    });
    await tx.wait();
    return tx.hash;
  }

  /** Get on-chain prepaid balance */
  async getContractBalance(address = this.userAddress) {
    const contract = this.getContractWithSigner();
    const bal = await contract.universityBalance(address);
    return {
      wei: bal.toString(),
      pol: Number(ethers.utils.formatEther(bal))
    };
  }

  /** Get configured gas cost from contract */
  async getGasCost() {
    const contract = this.getContractWithSigner();
    const [limit, price] = await Promise.all([
      contract.gasLimitPerCertificate(),
      contract.gasPriceForCertificate()
    ]);
    const cost = ethers.BigNumber.from(limit).mul(price);
    return {
      wei: cost.toString(),
      pol: Number(ethers.utils.formatEther(cost))
    };
  }

  /** Submit issuance via backend relayer (payment-aware) */
  async sendIssuanceTransaction(signedData) {
    if (!this.userAddress) throw new Error('Wallet not connected');

    const response = await fetch('/api/payment/issue-with-metamask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...signedData.certData,
        messageHash: signedData.messageHash,
        signature: signedData.signature,
        signerAddress: signedData.signerAddress
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /** Native wallet balance */
  async getBalance() {
    if (!this.provider || !this.userAddress) throw new Error('Wallet not connected');
    const balWei = await this.provider.getBalance(this.userAddress);
    return Number(ethers.utils.formatEther(balWei));
  }

  getAddress() {
    return this.userAddress;
  }

  disconnect() {
    this.userAddress = null;
    this.provider = null;
    this.signer = null;
  }

  isConnected() {
    return !!this.userAddress;
  }
}

window.MetaMaskIntegration = MetaMaskIntegration;
