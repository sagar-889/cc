// API Test Utility for Frontend
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export const testAPIs = async () => {
  console.log('🔍 Testing Frontend API Connections...');
  console.log('API Base URL:', API_BASE);

  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE.replace('/api', '')}/api/health`,
      method: 'GET'
    },
    {
      name: 'Courses',
      url: `${API_BASE}/courses`,
      method: 'GET'
    },
    {
      name: 'Faculty',
      url: `${API_BASE}/faculty`,
      method: 'GET'
    },
    {
      name: 'Events',
      url: `${API_BASE}/events`,
      method: 'GET'
    },
    {
      name: 'Navigation',
      url: `${API_BASE}/navigation`,
      method: 'GET'
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      const result = {
        name: test.name,
        status: 'SUCCESS',
        code: response.status,
        data: response.data
      };
      
      console.log(`✅ ${test.name}: ${response.status}`);
      results.push(result);
    } catch (error) {
      const result = {
        name: test.name,
        status: 'ERROR',
        code: error.response?.status || 'NETWORK_ERROR',
        error: error.message
      };
      
      console.log(`❌ ${test.name}: ${error.response?.status || 'NETWORK_ERROR'} - ${error.message}`);
      results.push(result);
    }
  }

  return results;
};

export const testAuthenticatedAPIs = async () => {
  console.log('🔐 Testing Authenticated APIs...');
  
  const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const token = authData?.state?.token;
  
  if (!token) {
    console.log('❌ No authentication token found');
    return [];
  }

  const tests = [
    {
      name: 'Chatbot Chat',
      url: `${API_BASE}/chatbot/chat`,
      method: 'POST',
      data: { message: 'Hello, this is a test message' }
    },
    {
      name: 'Voice Chat',
      url: `${API_BASE}/voiceChat/message`,
      method: 'POST',
      data: { query: 'Hello, this is a voice test' }
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      const result = {
        name: test.name,
        status: 'SUCCESS',
        code: response.status,
        response: response.data.response || response.data.message
      };
      
      console.log(`✅ ${test.name}: ${response.status}`);
      console.log(`   Response: ${response.data.response || response.data.message || 'No response'}`);
      results.push(result);
    } catch (error) {
      const result = {
        name: test.name,
        status: 'ERROR',
        code: error.response?.status || 'NETWORK_ERROR',
        error: error.message
      };
      
      console.log(`❌ ${test.name}: ${error.response?.status || 'NETWORK_ERROR'} - ${error.message}`);
      results.push(result);
    }
  }

  return results;
};

// Add to window for easy testing in browser console
if (typeof window !== 'undefined') {
  window.testAPIs = testAPIs;
  window.testAuthenticatedAPIs = testAuthenticatedAPIs;
}
