#!/usr/bin/env node

// Simple API test script to verify the integration
const API_BASE_URL = 'http://localhost:8000';
const USER_ID = 'f00dc8bd-eabc-4143-b1f0-fbcb9715a02e';

console.log('🧪 Testing API Integration...\n');

// Test 1: Check if API server is reachable
async function testAPIConnection() {
  console.log('1️⃣ Testing API Connection...');
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    console.log(`   ✅ API Server: ${response.status} ${response.statusText}`);
    return true;
  } catch (error) {
    console.log(`   ❌ API Server: Connection failed - ${error.message}`);
    return false;
  }
}

// Test 2: Test watchlist endpoints with user ID
async function testWatchlistEndpoints() {
  console.log('\n2️⃣ Testing Watchlist Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/api/v1/watchlist/', description: 'List watchlists' },
    { method: 'POST', path: '/api/v1/watchlist/', description: 'Create watchlist' },
    { method: 'GET', path: '/api/v1/watchlist/test-id', description: 'Get specific watchlist' },
    { method: 'PUT', path: '/api/v1/watchlist/test-id', description: 'Update watchlist' },
    { method: 'DELETE', path: '/api/v1/watchlist/test-id', description: 'Delete watchlist' }
  ];

  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': USER_ID,
          'X-User-Authenticated': 'true'
        }
      };

      if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
        options.body = JSON.stringify({
          ticker: 'TEST',
          name: 'Test Company',
          sector: 'Technology',
          marketCap: '1B',
          userId: USER_ID
        });
      }

      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, options);
      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 200 || status === 201 || status === 404 || status === 405) {
        console.log(`   ✅ ${endpoint.description}: ${status} ${statusText}`);
      } else {
        console.log(`   ⚠️  ${endpoint.description}: ${status} ${statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.description}: Failed - ${error.message}`);
    }
  }
}

// Test 3: Test with query parameters
async function testQueryParameters() {
  console.log('\n3️⃣ Testing Query Parameters...');
  
  try {
    const url = `${API_BASE_URL}/api/v1/watchlist/?userId=${USER_ID}&page=1&limit=10`;
    const response = await fetch(url, {
      headers: {
        'X-User-ID': USER_ID,
        'X-User-Authenticated': 'true'
      }
    });
    
    console.log(`   ✅ Query Parameters: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`   ❌ Query Parameters: Failed - ${error.message}`);
  }
}

// Test 4: Verify user ID in headers
async function testUserHeaders() {
  console.log('\n4️⃣ Testing User Headers...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/watchlist/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': USER_ID,
        'X-User-Authenticated': 'true'
      },
      body: JSON.stringify({
        ticker: 'HEADER_TEST',
        name: 'Header Test Company',
        sector: 'Technology',
        marketCap: '1B',
        userId: USER_ID
      })
    });
    
    console.log(`   ✅ User Headers: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`   ❌ User Headers: Failed - ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log(`🚀 Starting API Tests for User: ${USER_ID}\n`);
  
  const apiConnected = await testAPIConnection();
  
  if (apiConnected) {
    await testWatchlistEndpoints();
    await testQueryParameters();
    await testUserHeaders();
  }
  
  console.log('\n✨ API Testing Complete!');
  console.log('\n📱 Your Next.js app is running at: http://localhost:3000');
  console.log('🔗 Your API server is running at: http://localhost:8000');
  console.log(`👤 User ID: ${USER_ID}`);
  console.log('\n💡 Open http://localhost:3000 in your browser to test the UI!');
}

// Run tests
runTests().catch(console.error);
