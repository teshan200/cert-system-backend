#!/usr/bin/env node
/**
 * Contact Form API Test Script
 * 
 * This script tests the contact form API endpoints
 * 
 * Usage: node test-contact-api.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testHealthCheck() {
  logSection('Test 1: Health Check');
  try {
    const response = await axios.get(`${BASE_URL}/contact/health`);
    log('✓ Health check passed', 'green');
    log(JSON.stringify(response.data, null, 2), 'blue');
    return true;
  } catch (error) {
    log('✗ Health check failed', 'red');
    log(error.response?.data || error.message, 'red');
    return false;
  }
}

async function testValidSubmission() {
  logSection('Test 2: Valid Contact Form Submission');
  try {
    const data = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Message from API Test Script',
      message: 'This is a test message to verify the contact form is working correctly. Please ignore this message.'
    };
    
    const response = await axios.post(`${BASE_URL}/contact/send-message`, data);
    log('✓ Valid submission accepted', 'green');
    log(JSON.stringify(response.data, null, 2), 'blue');
    return true;
  } catch (error) {
    log('✗ Valid submission failed', 'red');
    log(error.response?.data || error.message, 'red');
    return false;
  }
}

async function testInvalidEmail() {
  logSection('Test 3: Invalid Email Validation');
  try {
    const data = {
      name: 'Test User',
      email: 'invalid-email',
      subject: 'Test',
      message: 'This is a test message'
    };
    
    await axios.post(`${BASE_URL}/contact/send-message`, data);
    log('✗ Should have rejected invalid email', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      log('✓ Invalid email rejected correctly', 'green');
      log(JSON.stringify(error.response.data, null, 2), 'blue');
      return true;
    }
    log('✗ Unexpected error', 'red');
    log(error.response?.data || error.message, 'red');
    return false;
  }
}

async function testShortMessage() {
  logSection('Test 4: Message Too Short Validation');
  try {
    const data = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test',
      message: 'Short'
    };
    
    await axios.post(`${BASE_URL}/contact/send-message`, data);
    log('✗ Should have rejected short message', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      log('✓ Short message rejected correctly', 'green');
      log(JSON.stringify(error.response.data, null, 2), 'blue');
      return true;
    }
    log('✗ Unexpected error', 'red');
    log(error.response?.data || error.message, 'red');
    return false;
  }
}

async function testMissingFields() {
  logSection('Test 5: Missing Required Fields');
  try {
    const data = {
      name: 'Test User',
      email: 'test@example.com'
      // Missing subject and message
    };
    
    await axios.post(`${BASE_URL}/contact/send-message`, data);
    log('✗ Should have rejected missing fields', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      log('✓ Missing fields rejected correctly', 'green');
      log(JSON.stringify(error.response.data, null, 2), 'blue');
      return true;
    }
    log('✗ Unexpected error', 'red');
    log(error.response?.data || error.message, 'red');
    return false;
  }
}

async function testRateLimit() {
  logSection('Test 6: Rate Limiting (5 requests)');
  try {
    const data = {
      name: 'Rate Limit Test',
      email: 'ratelimit@test.com',
      subject: 'Rate Limit Test',
      message: 'Testing rate limiting functionality'
    };
    
    let successCount = 0;
    let rateLimited = false;
    
    for (let i = 1; i <= 6; i++) {
      try {
        await axios.post(`${BASE_URL}/contact/send-message`, data);
        successCount++;
        log(`  Request ${i}: ✓ Accepted`, 'green');
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimited = true;
          log(`  Request ${i}: ✓ Rate limited (as expected)`, 'yellow');
          log(`  ${error.response.data.error}`, 'yellow');
        } else {
          log(`  Request ${i}: ✗ Unexpected error`, 'red');
        }
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (successCount <= 5 && rateLimited) {
      log('✓ Rate limiting working correctly', 'green');
      return true;
    } else {
      log('✗ Rate limiting not working as expected', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Rate limit test failed', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🧪 Contact Form API Test Suite', 'cyan');
  log(`Testing API at: ${BASE_URL}`, 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Run tests
  const tests = [
    testHealthCheck,
    testValidSubmission,
    testInvalidEmail,
    testShortMessage,
    testMissingFields,
    testRateLimit
  ];
  
  for (const test of tests) {
    results.total++;
    const passed = await test();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  logSection('Test Summary');
  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'cyan');
  
  if (results.failed === 0) {
    log('\n✓ All tests passed!', 'green');
  } else {
    log('\n✗ Some tests failed', 'red');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log('\n✗ Test suite failed:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
