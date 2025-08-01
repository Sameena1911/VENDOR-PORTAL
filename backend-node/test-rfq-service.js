const { fetchRFQsFromSAP } = require('./services/rfqService');

async function testRFQService() {
  try {
    console.log('🧪 Testing RFQ Service with Vendor ID: 0000100000');
    console.log('=' .repeat(50));
    
    const result = await fetchRFQsFromSAP('0000100000');
    
    console.log('📊 RFQ Service Test Results:');
    console.log('Success:', result.success);
    console.log('Total RFQs:', result.total);
    console.log('Vendor ID:', result.vendorId);
    
    if (result.success) {
      console.log('✅ SAP Connection Successful!');
      console.log('📋 RFQ Data:');
      result.rfqs.forEach((rfq, index) => {
        console.log(`  ${index + 1}. RFQ ${rfq.rfqNumber}:`);
        console.log(`     - Vendor: ${rfq.vendorId}`);
        console.log(`     - Date: ${rfq.rfqDate}`);
        console.log(`     - Description: ${rfq.description}`);
        console.log(`     - Quantity: ${rfq.quantity} ${rfq.unit}`);
      });
    } else {
      console.log('⚠️ Using fallback data due to SAP error:', result.error);
      console.log('📋 Fallback RFQ Data:');
      result.rfqs.forEach((rfq, index) => {
        console.log(`  ${index + 1}. RFQ ${rfq.rfqNumber}:`);
        console.log(`     - Description: ${rfq.description}`);
        console.log(`     - Quantity: ${rfq.quantity} ${rfq.unit}`);
      });
    }
    
    console.log('📈 Summary:', JSON.stringify(result.summary, null, 2));
    
  } catch (error) {
    console.error('❌ RFQ Service Test Failed:', error.message);
  }
}

// Run the test
testRFQService();
