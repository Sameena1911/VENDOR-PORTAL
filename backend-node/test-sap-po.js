const { fetchPurchaseOrdersFromSAP } = require('./services/purchaseOrderService');

async function testSAPConnection() {
  console.log('🧪 Testing SAP Connection with new credentials...');
  console.log('📋 Credentials: K901705 / Sameena@1911');
  console.log('🎯 Testing vendor ID: 0000100000');
  console.log('⏱️  Started at:', new Date().toISOString());
  console.log('=' .repeat(60));
  
  try {
    // Test with vendor ID 0000100000 (as seen in your SAP data)
    const vendorId = '0000100000';
    console.log(`Testing with Vendor ID: ${vendorId}`);
    
    const result = await fetchPurchaseOrdersFromSAP(vendorId);
    
    console.log('✅ SUCCESS! SAP connection established');
    console.log('📊 Purchase Orders Retrieved:', result.purchaseOrders?.length || 0);
    console.log('💰 Total Records:', result.totalRecords || 'N/A');
    console.log('📝 Message:', result.message || 'No message');
    
    if (result.purchaseOrders && result.purchaseOrders.length > 0) {
      console.log('\n📋 Purchase Orders Found:');
      console.log('=========================');
      result.purchaseOrders.forEach((po, index) => {
        console.log(`${index + 1}. PO: ${po.poNumber} | Vendor: ${po.vendorId} | Date: ${po.poDate} | EDD: ${po.edd} | Currency: ${po.currency}`);
      });
    } else {
      console.log('   No purchase orders found in response');
    }
    
    if (result.summary) {
      console.log('\n📈 Summary:');
      console.log('===========');
      console.log(`Total Count: ${result.summary.totalCount}`);
      console.log(`Open Count: ${result.summary.openCount}`);
      console.log(`Due Soon Count: ${result.summary.dueSoonCount}`);
      console.log(`Overdue Count: ${result.summary.overdueCount}`);
    }
    
    console.log('=' .repeat(60));
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.log('❌ FAILED! SAP connection error:');
    console.log('🔍 Error Type:', error.constructor.name);
    console.log('💬 Error Message:', error.message);
    
    // Check for specific authentication errors
    if (error.message && error.message.includes('401')) {
      console.log('🚫 Authentication Error: Credentials rejected by SAP');
      console.log('🔧 Possible solutions:');
      console.log('   - Verify username/password are correct');
      console.log('   - Check if user account is locked');
      console.log('   - Confirm user has proper SAP authorizations');
    } else if (error.message && error.message.includes('timeout')) {
      console.log('⏰ Network/Timeout Error: Connection timed out');
    } else if (error.message && error.message.includes('ENOTFOUND')) {
      console.log('🌐 Network Error: Cannot reach SAP server');
    }
    
    console.log('=' .repeat(60));
    console.log('❌ Test failed!');
  }
}

// Run the test
testSAPConnection();
