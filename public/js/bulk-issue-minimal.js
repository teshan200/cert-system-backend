// Minimal bulk issue handler - for debugging
async function bulkIssueMinimal() {
  console.log('🚀 MINIMAL BULK ISSUE START');
  
  try {
    console.log('1️⃣ Checking connection...');
    if (!isConnected) {
      throw new Error('Not connected');
    }
    console.log('✓ Connected');

    console.log('2️⃣ Checking rows...');
    console.log('   bulkRows:', bulkRows);
    console.log('   bulkRows.length:', bulkRows?.length);
    if (!bulkRows || !bulkRows.length) {
      throw new Error('No rows');
    }
    console.log('✓ Have rows:', bulkRows.length);

    console.log('3️⃣ Getting token...');
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token');
    }
    console.log('✓ Have token');

    console.log('4️⃣ Fetching auth...');
    const authResp = await fetch('/api/university/certificate/bulk-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ certificate_count: bulkRows.length })
    });
    console.log('   Response status:', authResp.status);
    console.log('   Response ok:', authResp.ok);

    const authData = await authResp.json();
    console.log('   Auth data:', authData);

    if (!authResp.ok) {
      throw new Error(`HTTP ${authResp.status}`);
    }
    if (!authData.success) {
      throw new Error(authData.error);
    }

    const { auth_hash } = authData;
    console.log('✓ Auth hash:', auth_hash);

    console.log('5️⃣ Signing...');
    const sig = await metamask.signMessageHash(auth_hash);
    console.log('✓ Signature:', sig);

    showAlert('✅ SUCCESS!', 'success');

  } catch (error) {
    console.error('❌ MINIMAL ERROR:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    showAlert(`ERROR: ${error.message}`, 'error');
  }
}

// Attach to button for testing
if (window.btnBulkIssue) {
  window.btnBulkIssue.addEventListener('click', (e) => {
    e.preventDefault();
    bulkIssueMinimal();
  });
}
