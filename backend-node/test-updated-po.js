const { fetchPurchaseOrders } = require('./services/purchaseOrderService');

async function testUpdatedPOService() {
  console.log('🧪 Testing Updated Purchase Order Service');
  console.log('📋 Credentials: k901705 / Sameena@1911');
  console.log('🎯 Testing vendor ID: 0000100000');
  console.log('=' .repeat(50));
  
  try {
    const result = await fetchPurchaseOrders('0000100000');
    
    console.log('✅ SUCCESS! Data retrieved from SAP');
    console.log('📊 Total Purchase Orders:', result.total);
    console.log('📝 Success Status:', result.success);
    console.log('🔢 Vendor ID:', result.vendorId);
    
    if (result.purchaseOrders && result.purchaseOrders.length > 0) {
      console.log('\n📋 Purchase Orders Found:');
      console.log('=========================');
      result.purchaseOrders.forEach((po, index) => {
        console.log(`${index + 1}. PO: ${po.poNumber} | Vendor: ${po.vendorId} | Currency: ${po.currency} | Date: ${po.poDate}`);
      });
      
      console.log('\n🎉 SUCCESS! Your updated service is fetching ACTUAL SAP data!');
      console.log(`📈 Total records: ${result.purchaseOrders.length} (should match your SAP backend)`);
    } else {
      console.log('⚠️  No purchase orders found in response');
    }
    
  } catch (error) {
    console.log('❌ FAILED! Error occurred:');
    console.log('💬 Error Message:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('🚫 Still getting authentication errors');
      console.log('💡 The credentials k901705/Sameena@1911 may need additional SAP authorizations');
    }
  }
  
  console.log('=' .repeat(50));
}

testUpdatedPOService();
