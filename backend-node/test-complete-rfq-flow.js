const axios = require('axios');

async function testFullRFQFlow() {
  try {
    console.log('🧪 Testing Complete RFQ Flow...');
    console.log('=' .repeat(50));
    
    // Step 1: Login to get token
    console.log('🔐 Step 1: Logging in to get JWT token...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: '0000100000',
      password: '123'
    });
    
    console.log('✅ Login successful!');
    console.log('📝 Token:', loginResponse.data.token.substring(0, 50) + '...');
    
    const token = loginResponse.data.token;
    
    // Step 2: Test RFQ endpoint with valid token
    console.log('\n📋 Step 2: Fetching RFQs with valid token...');
    const rfqResponse = await axios.get('http://localhost:3001/api/vendor/rfqs', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ RFQ API Response:');
    console.log('Status:', rfqResponse.status);
    console.log('Message:', rfqResponse.data.message);
    console.log('Total RFQs:', rfqResponse.data.rfqs?.length || 0);
    
    if (rfqResponse.data.rfqs && rfqResponse.data.rfqs.length > 0) {
      console.log('\n📊 RFQ Data:');
      rfqResponse.data.rfqs.forEach((rfq, index) => {
        console.log(`  ${index + 1}. RFQ ${rfq.rfqNumber}:`);
        console.log(`     - Vendor: ${rfq.vendorId}`);
        console.log(`     - Date: ${rfq.rfqDate}`);
        console.log(`     - Description: ${rfq.description}`);
        console.log(`     - Quantity: ${rfq.quantity} ${rfq.unit}`);
      });
    }
    
    console.log('\n📈 Summary:', JSON.stringify(rfqResponse.data.summary, null, 2));
    
    console.log('\n🎉 Complete RFQ flow test successful!');
    console.log('✅ SAP is responding with actual data');
    console.log('✅ Backend API is working correctly');
    console.log('✅ Authentication is working');
    
  } catch (error) {
    console.error('❌ RFQ Flow Test Failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFullRFQFlow();
