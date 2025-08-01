const { fetchPurchaseOrders } = require('./services/purchaseOrderService');

async function testFieldMapping() {
  console.log('🧪 Testing Purchase Order Field Mapping');
  console.log('🎯 Expected: 12 entries with proper EDD dates and INR currency');
  console.log('=' .repeat(60));
  
  try {
    const result = await fetchPurchaseOrders('0000100000');
    
    if (result.success && result.purchaseOrders.length > 0) {
      console.log('✅ SUCCESS! Retrieved', result.total, 'purchase orders');
      console.log('');
      
      result.purchaseOrders.forEach((po, index) => {
        console.log(`📋 Order ${index + 1}:`);
        console.log(`   PO Number: ${po.poNumber}`);
        console.log(`   Vendor ID: ${po.vendorId}`);
        console.log(`   PO Date: ${po.poDate}`);
        console.log(`   EDD: ${po.edd} ${po.edd ? '✅' : '❌ MISSING'}`);
        console.log(`   Currency: ${po.currency} ${po.currency === 'INR' ? '✅' : '❌ NOT INR'}`);
        
        if (po._raw) {
          console.log(`   Raw SAP Data:`, JSON.stringify(po._raw, null, 4));
        }
        console.log('   ---');
      });
      
      // Summary
      const validEDD = result.purchaseOrders.filter(po => po.edd && po.edd !== '').length;
      const validCurrency = result.purchaseOrders.filter(po => po.currency === 'INR').length;
      
      console.log('📊 SUMMARY:');
      console.log(`   Total Orders: ${result.total}`);
      console.log(`   Valid EDD: ${validEDD}/${result.total} ${validEDD === result.total ? '✅' : '❌'}`);
      console.log(`   INR Currency: ${validCurrency}/${result.total} ${validCurrency === result.total ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ No purchase orders retrieved');
      console.log('Result:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    
    if (error.message.includes('401')) {
      console.log('🚫 Still getting authentication errors');
      console.log('💡 User k901705 needs SAP authorization for ZVP_PO_SERVICE');
    }
  }
  
  console.log('=' .repeat(60));
}

testFieldMapping();
