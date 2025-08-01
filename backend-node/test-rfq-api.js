const axios = require('axios');

async function testRFQAPI() {
  try {
    console.log('🧪 Testing RFQ API Endpoint...');
    console.log('📡 URL: http://localhost:3001/api/vendor/rfqs');
    
    // First, test if server is responding
    const healthCheck = await axios.get('http://localhost:3001/api/health', {
      timeout: 5000
    }).catch(() => null);
    
    if (!healthCheck) {
      console.error('❌ Backend server is not running on port 3001');
      console.log('💡 Please start the server with: node server.js');
      return;
    }
    
    console.log('✅ Backend server is running');
    
    // Create a mock token for testing
    const mockToken = 'test-token';
    
    const response = await axios.get('http://localhost:3001/api/vendor/rfqs', {
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ RFQ API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ RFQ API Test Failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testRFQAPI();
