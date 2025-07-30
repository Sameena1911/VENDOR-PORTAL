const axios = require('axios');

async function testCompleteFlow() {
    console.log('🧪 Testing Complete Authentication Flow');
    console.log('=========================================');
    
    try {
        // Step 1: Test login with your credentials
        console.log('Step 1: Testing login...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: '0000100000',  // Your vendor ID
            password: '123'       // Your password
        });
        
        console.log('✅ Login successful!');
        console.log('User data:', loginResponse.data.user);
        
        const token = loginResponse.data.token;
        console.log('Token received:', token.substring(0, 50) + '...');
        
        // Step 2: Test payment aging data retrieval
        console.log('\nStep 2: Testing payment aging data retrieval...');
        const paymentResponse = await axios.get('http://localhost:3001/api/vendor/payment-aging', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Payment aging data retrieved successfully!');
        console.log('Total records:', paymentResponse.data.totalRecords);
        console.log('Data length:', paymentResponse.data.data.length);
        
        if (paymentResponse.data.summary) {
            console.log('\n📊 Summary:');
            console.log('Current:', paymentResponse.data.summary.current.count, 'records, ₹', paymentResponse.data.summary.current.amount);
            console.log('Overdue:', paymentResponse.data.summary.overdue.count, 'records, ₹', paymentResponse.data.summary.overdue.amount);
            console.log('Total:', paymentResponse.data.summary.total.count, 'records, ₹', paymentResponse.data.summary.total.amount);
        }
        
        console.log('\n🎉 Complete flow test successful!');
        console.log('✅ Ready for frontend integration');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testCompleteFlow();
