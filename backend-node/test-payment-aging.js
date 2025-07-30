const { fetchPaymentAgingFromSAP } = require('./services/paymentAgingService');

async function testPaymentAging() {
    console.log('🧪 Testing Payment Aging Service...\n');
    
    try {
        // Test with vendor ID
        const vendorId = '0000100001';
        console.log(`📞 Calling SAP Payment Aging service for vendor: ${vendorId}`);
        
        const result = await fetchPaymentAgingFromSAP(vendorId);
        
        console.log('\n✅ Payment Aging Service Response:');
        console.log('Success:', result.success);
        console.log('Data Count:', result.data?.length || 0);
        console.log('Total Records:', result.totalRecords || 0);
        
        if (result.data && result.data.length > 0) {
            console.log('\n📊 First Payment Record:');
            console.log(JSON.stringify(result.data[0], null, 2));
            
            console.log('\n📈 Summary:');
            console.log(JSON.stringify(result.summary, null, 2));
        } else {
            console.log('\n📄 No payment data returned');
        }
        
    } catch (error) {
        console.error('\n❌ Error testing payment aging service:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testPaymentAging();
