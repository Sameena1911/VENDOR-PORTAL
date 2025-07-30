const { fetchPaymentAgingFromSAP } = require('./services/paymentAgingService');

async function quickTest() {
    console.log('🔍 Quick SAP Test for Vendor 0000100000');
    console.log('==========================================');
    
    try {
        console.log('📡 Connecting to SAP...');
        const result = await fetchPaymentAgingFromSAP('0000100000');
        
        console.log('✅ SAP Response Status:', result.success ? 'SUCCESS' : 'FAILED');
        console.log('📊 Total Records:', result.data?.length || 0);
        
        if (result.success && result.data?.length > 0) {
            console.log('💰 Summary:');
            console.log('  - Current:', result.summary?.current?.count || 0, 'records');
            console.log('  - Overdue:', result.summary?.overdue?.count || 0, 'records');
            console.log('  - Total Amount: ₹', result.summary?.total?.amount || 0);
            
            console.log('\n📋 First 3 Records:');
            result.data.slice(0, 3).forEach((record, index) => {
                console.log(`${index + 1}. Doc: ${record.documentNumber}, Amount: ₹${record.amount}, Aging: ${record.agingDays} days`);
            });
        } else {
            console.log('⚠️ No data found or error occurred');
            console.log('Message:', result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ SAP Connection Failed:', error.message);
    }
}

quickTest();
