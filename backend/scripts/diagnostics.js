const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test all major endpoints
async function runDiagnostics() {
  console.log('🔍 Running CampusCompanion Diagnostics...\n');

  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${BASE_URL.replace('/api', '')}/api/health`,
      requiresAuth: false
    },
    {
      name: 'Courses API',
      method: 'GET',
      url: `${BASE_URL}/courses`,
      requiresAuth: false
    },
    {
      name: 'Faculty API',
      method: 'GET',
      url: `${BASE_URL}/faculty`,
      requiresAuth: false
    },
    {
      name: 'Events API',
      method: 'GET',
      url: `${BASE_URL}/events`,
      requiresAuth: false
    },
    {
      name: 'Navigation API',
      method: 'GET',
      url: `${BASE_URL}/navigation`,
      requiresAuth: false
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: ${response.status} - ${response.statusText}`);
      if (response.data && response.data.count !== undefined) {
        console.log(`   📊 Data count: ${response.data.count}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.response?.status || 'NETWORK_ERROR'} - ${error.message}`);
      if (error.response?.data) {
        console.log(`   📝 Error details: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  // Test chatbot endpoint (requires auth)
  console.log('🤖 Testing Chatbot Endpoints (these require authentication)...\n');
  
  const chatbotTests = [
    {
      name: 'Chatbot Chat',
      method: 'POST',
      url: `${BASE_URL}/chatbot/chat`,
      data: { message: 'hello' }
    },
    {
      name: 'Voice Chat Message',
      method: 'POST',
      url: `${BASE_URL}/voiceChat/message`,
      data: { query: 'hello' }
    }
  ];

  for (const test of chatbotTests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: ${response.status} - ${response.statusText}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`🔐 ${test.name}: 401 - Authentication required (this is expected)`);
      } else {
        console.log(`❌ ${test.name}: ${error.response?.status || 'NETWORK_ERROR'} - ${error.message}`);
        if (error.response?.data) {
          console.log(`   📝 Error details: ${JSON.stringify(error.response.data)}`);
        }
      }
    }
    console.log('');
  }

  console.log('🏁 Diagnostics completed!');
}

runDiagnostics().catch(console.error);
