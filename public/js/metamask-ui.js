// UI Logic for MetaMask Certificate Issuance
// This handles the UI interactions and form submission
console.log('🟣 metamask-ui.js loaded');

let metamask; // Initialize later to avoid timing issues
let isConnected = false;

// DOM Elements - will be cached in DOMContentLoaded
let btnConnect;
let certificateForm;
let btnSubmit;
let loading;
let walletAddress;
let statusBadge;
let balanceInfo;
let contractBalanceInfo;
let gasCostInfo;
let alertContainer;
let transactionDetails;
let depositAmount;
let btnDeposit;
let btnRefresh;
let bulkFile;
let bulkTableBody;
let bulkCount;
let btnBulkIssue;
let btnClearBulk;

let bulkRows = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOMContentLoaded event fired');
  
  try {
    // Initialize metamask integration
    console.log('📍 Creating MetaMaskIntegration instance...');
    metamask = new MetaMaskIntegration();
    console.log('✓ metamask initialized');
    
    // Cache DOM elements
    console.log('📍 Caching DOM elements...');
    btnConnect = document.getElementById('btnConnect');
    certificateForm = document.getElementById('certificateForm');
    btnSubmit = document.getElementById('btnSubmit');
    loading = document.getElementById('loading');
    walletAddress = document.getElementById('walletAddress');
    statusBadge = document.getElementById('statusBadge');
    balanceInfo = document.getElementById('balanceInfo');
    contractBalanceInfo = document.getElementById('contractBalanceInfo');
    gasCostInfo = document.getElementById('gasCostInfo');
    alertContainer = document.getElementById('alertContainer');
    transactionDetails = document.getElementById('transactionDetails');
    depositAmount = document.getElementById('depositAmount');
    btnDeposit = document.getElementById('btnDeposit');
    btnRefresh = document.getElementById('btnRefresh');
    bulkFile = document.getElementById('bulkFile');
    bulkTableBody = document.getElementById('bulkTableBody');
    bulkCount = document.getElementById('bulkCount');
    btnBulkIssue = document.getElementById('btnBulkIssue');
    btnClearBulk = document.getElementById('btnClearBulk');
    console.log('✓ DOM elements cached');
    
    try {
      // Global error handler to catch silent errors
      window.addEventListener('error', (event) => {
        console.error('🔴 GLOBAL ERROR:', event.error);
        console.error('   Message:', event.message);
        console.error('   Filename:', event.filename);
        console.error('   Line:', event.lineno);
        console.error('   Column:', event.colno);
        console.error('   Stack:', event.error?.stack);
        showAlert(`Global error: ${event.message}\n${event.error?.stack?.split('\n').slice(0,3).join('\n') || ''}`, 'error');
      });
    
      window.addEventListener('unhandledrejection', (event) => {
        console.error('🔴 UNHANDLED PROMISE REJECTION:', event.reason);
        console.error('   Stack:', event.reason?.stack);
        showAlert(`Unhandled rejection: ${event.reason}\n${event.reason?.stack?.split('\n').slice(0,3).join('\n') || ''}`, 'error');
      });
      
      console.log('✓ Error handlers attached');
      
      // Check if MetaMask is installed
      if (!MetaMaskIntegration.isMetaMaskInstalled()) {
        showAlert('MetaMask is not installed. Please install MetaMask extension.', 'error');
        btnConnect.disabled = true;
      }
      
      console.log('✓ MetaMask check done');

      // Check if already connected
      checkMetaMaskConnection();
      
      console.log('✓ Connection check done');

      // Event Listeners
      console.log('✓ Adding event listeners...');
      btnConnect.addEventListener('click', connectMetaMask);
      certificateForm.addEventListener('submit', handleFormSubmit);
      btnDeposit.addEventListener('click', handleDeposit);
      btnRefresh.addEventListener('click', refreshContractData);
      bulkFile.addEventListener('change', handleBulkFile);
      console.log('   bulkFile listener added');
      btnClearBulk.addEventListener('click', clearBulk);
      btnBulkIssue.addEventListener('click', handleBulkIssue);
      console.log('   btnBulkIssue listener added');

      // Listen for account/network changes
      window.addEventListener('metamask:accountChanged', () => {
        walletAddress.textContent = metamask.getAddress();
        refreshContractData();
      });
      
      console.log('✓ DOMContentLoaded initialization complete!');
    } catch (err) {
      console.error('🔴 DOMContentLoaded error:', err);
      console.error('   Message:', err.message);
      console.error('   Stack:', err.stack);
    }
  } catch (err) {
    console.error('🔴 Top-level DOMContentLoaded error:', err);
    console.error('   Message:', err.message);
    console.error('   Stack:', err.stack);
  }
});

/**
 * Check if MetaMask is already connected
 */
async function checkMetaMaskConnection() {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });

    if (accounts.length > 0) {
      await connectMetaMask();
    }
  } catch (error) {
    console.error('Connection check error:', error);
  }
}

/**
 * Connect to MetaMask
 */
async function connectMetaMask() {
  try {
    showAlert('Connecting to MetaMask...', 'info');
    const address = await metamask.connect();

    isConnected = true;
    walletAddress.textContent = address;
    statusBadge.textContent = 'Connected';
    statusBadge.className = 'status-badge connected';
    btnConnect.textContent = 'Connected ✓';
    btnConnect.disabled = true;
    btnSubmit.disabled = false;

    await refreshContractData();

    showAlert(`Connected: ${address}`, 'success');
  } catch (error) {
    showAlert(`Connection failed: ${error.message}`, 'error');
    isConnected = false;
    updateUIDisconnected();
  }
}

/**
 * Update wallet balance
 */
async function updateBalance() {
  try {
    const balance = await metamask.getBalance();
    balanceInfo.innerHTML = `<strong>Balance:</strong> ${balance.toFixed(4)} POL`;
  } catch (error) {
    console.error('Balance update error:', error);
  }
}

async function updateContractBalance() {
  try {
    const balance = await metamask.getContractBalance();
    contractBalanceInfo.innerHTML = `<strong>Prepaid Balance (Contract):</strong> ${balance.pol.toFixed(4)} POL`;
  } catch (error) {
    console.error('Contract balance error:', error);
  }
}

async function updateGasCost() {
  try {
    const gas = await metamask.getGasCost();
    gasCostInfo.innerHTML = `<strong>Gas per certificate:</strong> ${gas.pol.toFixed(6)} POL`;
  } catch (error) {
    console.error('Gas cost error:', error);
  }
}

async function refreshContractData() {
  await updateBalance();
  await updateContractBalance();
  await updateGasCost();
}

function clearBulk() {
  bulkRows = [];
  renderBulkTable();
  btnBulkIssue.disabled = true;
  bulkFile.value = '';
}

function renderBulkTable() {
  bulkCount.textContent = `${bulkRows.length} records`;
  if (!bulkRows.length) {
    bulkTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">No rows loaded</td></tr>';
    return;
  }

  bulkTableBody.innerHTML = bulkRows.map((row, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${row.certId || ''}</td>
      <td>${row.studentName || ''}</td>
      <td>${row.courseName || ''}</td>
      <td>${row.issueDate || ''}</td>
      <td>${row.issuerName || ''}</td>
    </tr>
  `).join('');
}

function normalizeRow(row) {
  return {
    certId: (row.certId || row.certificate_id || '').trim(),
    studentName: (row.studentName || row.student_name || '').trim(),
    courseName: (row.courseName || row.course_name || '').trim(),
    issueDate: (row.issueDate || row.issued_date || new Date().toISOString().split('T')[0]).trim(),
    issuerName: (row.issuerName || row.issuer_name || 'Unknown').trim(),
    studentId: (row.student_id || '').trim(),
    grade: (row.grade || 'N/A').trim()
  };
}

function validateRow(row) {
  // Require either certId or student_id + course_name
  const hasCertId = row.certId && row.studentName && row.courseName && row.issueDate && row.issuerName;
  const hasStudentFields = row.studentId && row.courseName && row.grade;
  return hasCertId || hasStudentFields;
}

function handleBulkFile(e) {
  console.log('📂 handleBulkFile called');
  try {
    const file = e.target.files[0];
    if (!file) {
      console.log('   No file selected');
      return;
    }

    console.log('   File:', file.name, 'Size:', file.size);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('✓ CSV parsed, rows:', results.data?.length);
          console.log('   Raw data:', JSON.stringify(results.data?.slice(0, 2)));
          
          const normalized = (results.data || []).map(normalizeRow);
          console.log('   Normalized:', JSON.stringify(normalized.slice(0, 2)));
          
          const rows = normalized.filter(validateRow);
          console.log('   After filter:', rows.length);
          
          bulkRows = rows;
          renderBulkTable();
          btnBulkIssue.disabled = rows.length === 0;
          if (!rows.length) {
            showAlert('No valid rows found. Ensure headers: certId, studentName, courseName, issueDate, issuerName', 'warning');
          } else {
            showAlert(`Loaded ${rows.length} rows from CSV`, 'success');
          }
        } catch (completeErr) {
          console.error('❌ Error in Papa.parse complete callback:', completeErr);
          console.error('   Message:', completeErr.message);
          console.error('   Stack:', completeErr.stack);
          showAlert('Error processing CSV: ' + completeErr.message, 'error');
        }
      },
      error: (err) => {
        console.error('❌ CSV parse error:', err);
        showAlert('Failed to parse CSV: ' + err.message, 'error');
      }
    });
  } catch (err) {
    console.error('❌ handleBulkFile error:', err);
    console.error('   Message:', err.message);
    console.error('   Stack:', err.stack);
    showAlert('Error loading CSV: ' + err.message, 'error');
  }
}

async function handleDeposit(e) {
  e.preventDefault();
  if (!isConnected) {
    showAlert('Connect MetaMask before depositing', 'warning');
    return;
  }

  const amount = parseFloat(depositAmount.value || '0');
  if (!amount || amount <= 0) {
    showAlert('Enter a valid amount in POL', 'warning');
    return;
  }

  try {
    showAlert('Submitting deposit...', 'info');
    btnDeposit.disabled = true;
    const txHash = await metamask.depositGasFunds(amount);
    showAlert(`Deposit sent. Tx: ${txHash}`, 'success');
    await refreshContractData();
    depositAmount.value = '';
  } catch (error) {
    showAlert(`Deposit failed: ${error.message}`, 'error');
  } finally {
    btnDeposit.disabled = false;
  }
}

/**
 * Update UI when disconnected
 */
function updateUIDisconnected() {
  walletAddress.textContent = 'Not connected';
  statusBadge.textContent = 'Disconnected';
  statusBadge.className = 'status-badge disconnected';
  btnConnect.textContent = 'Connect MetaMask';
  btnConnect.disabled = false;
  btnSubmit.disabled = true;
  balanceInfo.innerHTML = '';
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!isConnected) {
    showAlert('Please connect MetaMask first', 'warning');
    return;
  }

  try {
    loading.style.display = 'block';
    transactionDetails.classList.remove('show');
    showAlert('', 'info'); // Clear alerts

    // Get form data
    const certData = {
      certId: document.getElementById('certId').value.trim(),
      studentName: document.getElementById('studentName').value.trim(),
      courseName: document.getElementById('courseName').value.trim(),
      issueDate: document.getElementById('issueDate').value,
      issuerName: document.getElementById('issuerName').value.trim()
    };

    showAlert('Creating message hash...', 'info');

    // Sign and get signature
    const signedData = await metamask.signAndIssueCertificate(certData);

    showAlert('Sending certificate to blockchain...', 'info');

    // Submit to backend
    const result = await metamask.sendIssuanceTransaction(signedData);

    if (result.success) {
      showAlert(`✅ Certificate issued successfully!`, 'success');
      displayTransactionDetails(result.data);
      certificateForm.reset();
      await refreshContractData();
    } else {
      showAlert(`❌ Error: ${result.error}`, 'error');
    }

  } catch (error) {
    console.error('Submission error:', error);
    showAlert(`Error: ${error.message}`, 'error');
  } finally {
    loading.style.display = 'none';
  }
}

/**
 * Handle bulk issuance via CSV
 */
async function handleBulkIssue() {
  if (!isConnected) {
    showAlert('Please connect MetaMask first', 'warning');
    return;
  }

  if (!bulkRows.length) {
    showAlert('Load a CSV with at least one row', 'warning');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    showAlert('Please login (token missing) before bulk issuing', 'error');
    return;
  }

  try {
    console.log('========== BULK ISSUE START ==========');
    showAlert('Preparing bulk authorization (one MetaMask signature)...', 'info');
    btnBulkIssue.disabled = true;

    console.log('📍 Step 1: Get signer address');
    const signer = metamask.getAddress();
    console.log('   Signer:', signer);

    if (!signer) {
      throw new Error('MetaMask wallet not connected. Please click Connect MetaMask first.');
    }

    console.log('📍 Step 2: Fetch auth from backend');
    console.log('   URL: /api/university/certificate/bulk-auth');
    console.log('   Body: { certificate_count:', bulkRows.length, '}');
    
    // Step 1: get bulk auth params from backend
    const authResp = await fetch('/api/university/certificate/bulk-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ certificate_count: bulkRows.length })
    });

    console.log('   Response status:', authResp.status);
    console.log('   Response OK:', authResp.ok);

    const authData = await authResp.json();
    console.log('📋 Full auth response:');
    console.log('   Success:', authData?.success);
    console.log('   auth_hash:', authData?.auth_hash);
    console.log('   batch_id:', authData?.batch_id);
    console.log('   certificate_count:', authData?.certificate_count);
    console.log('   expiry:', authData?.expiry);
    
    if (!authResp.ok) {
      console.error('❌ HTTP error:', authResp.status, authResp.statusText);
      throw new Error(`HTTP ${authResp.status}: ${authData?.error || 'Unknown error'}`);
    }
    
    if (!authData || !authData.success) {
      console.error('❌ Response not successful:', authData);
      throw new Error(authData?.error || 'Failed to get bulk authorization hash');
    }

    console.log('📍 Step 3: Extract and validate auth_hash');
    const { auth_hash, batch_id, certificate_count, expiry } = authData;
    
    console.log('   auth_hash type:', typeof auth_hash);
    console.log('   auth_hash value:', auth_hash);
    console.log('   auth_hash length:', auth_hash?.length);
    console.log('   auth_hash starts with 0x:', auth_hash?.startsWith?.('0x'));

    // Validate auth_hash
    if (auth_hash === null) {
      throw new Error('auth_hash is NULL');
    }
    if (auth_hash === undefined) {
      throw new Error('auth_hash is UNDEFINED');
    }
    if (typeof auth_hash !== 'string') {
      throw new Error(`auth_hash is not string, got: ${typeof auth_hash}`);
    }
    if (!auth_hash.startsWith('0x')) {
      throw new Error(`auth_hash does not start with 0x: ${auth_hash.substring(0, 20)}`);
    }
    if (auth_hash.length !== 66) {
      throw new Error(`auth_hash length is ${auth_hash.length}, expected 66`);
    }
    if (!/^0x[0-9a-fA-F]+$/.test(auth_hash)) {
      throw new Error(`Invalid hex characters in auth_hash`);
    }
    
    console.log('✓ auth_hash is valid');

    // Step 2: sign the auth hash once (EIP-191 eth_sign on the hash)
    console.log('📍 Step 4: Sign auth_hash with MetaMask');
    console.log('   auth_hash to sign:', auth_hash);
    
    let authSignature;
    try {
      console.log('   Calling metamask.signMessageHash()...');
      authSignature = await metamask.signMessageHash(auth_hash);
      console.log('✓ Signature received:', authSignature.substring(0, 50) + '...');
    } catch (sigError) {
      console.error('❌ Signature error in signMessageHash:', sigError);
      console.error('   Error message:', sigError?.message);
      console.error('   Error stack:', sigError?.stack);
      throw new Error(`Failed to sign: ${sigError.message}`);
    }

    // Step 3: build certificate payloads for backend
    const certPayloads = bulkRows.map((row) => ({
      certificate_id: row.certId || `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      student_id: row.studentId || null,
      course_name: row.courseName,
      grade: row.grade || 'N/A',
      issued_date: row.issueDate,
      student_name: row.studentName
    }));

    // Step 4: submit to bulk-issue endpoint
    showAlert('Submitting bulk to relayer...', 'info');

    const response = await fetch('/api/university/certificate/bulk-issue-signed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        certificates: certPayloads,
        auth_hash,
        auth_signature: authSignature,
        signer_address: signer,
        batch_id,
        certificate_count,
        expiry
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Bulk issuance failed');
    }

    showAlert(`Bulk issuance complete. Submitted ${certPayloads.length} certificates.`, 'success');
    clearBulk();
    await refreshContractData();
  } catch (error) {
    const stack = error?.stack || 'no stack';
    console.error('Bulk issue error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', stack);
    showAlert(`Bulk error: ${error.message}\n${stack.split('\n').slice(0,3).join('\n')}`, 'error');
  } finally {
    btnBulkIssue.disabled = false;
  }
}

/**
 * Display transaction details
 */
function displayTransactionDetails(data) {
  const { transactionHash, blockNumber, gasUsed } = data;

  document.getElementById('txHashLink').textContent = transactionHash;
  document.getElementById('txHashLink').href =
    `https://amoy.polygonscan.com/tx/${transactionHash}`;

  document.getElementById('blockNumber').textContent = blockNumber;
  document.getElementById('gasUsed').textContent = gasUsed;
  document.getElementById('certIdDisplay').textContent =
    document.getElementById('certId').value;

  transactionDetails.classList.add('show');
  window.scrollTo({ top: transactionDetails.offsetTop - 100, behavior: 'smooth' });
}

/**
 * Show alert message
 */
function showAlert(message, type) {
  if (!message) {
    alertContainer.innerHTML = '';
    return;
  }

  alertContainer.innerHTML = `
    <div class="alert alert-${type}">
      ${message}
    </div>
  `;

  // Auto-dismiss after 5 seconds for non-error alerts
  if (type !== 'error') {
    setTimeout(() => {
      if (alertContainer.innerHTML.includes(message)) {
        alertContainer.innerHTML = '';
      }
    }, 5000);
  }
}

/**
 * Format error message for display
 */
function formatErrorMessage(error) {
  if (error.message.includes('User denied')) {
    return 'Transaction was rejected in MetaMask';
  }
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for gas. Please add POL tokens.';
  }
  return error.message;
}
