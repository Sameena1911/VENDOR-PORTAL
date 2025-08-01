const { fetchPurchaseOrders } = require('./services/purchaseOrderService');

async function validateFieldMapping() {
  console.log('🧪 VALIDATING PURCHASE ORDER FIELD MAPPING');
  console.log('📊 Expected from SAP Backend Table:');
  console.log('   - 12 Entries total');
  console.log('   - EDD: 20.05.2025, 02.06.2025, etc.');
  console.log('   - Currency: INR');
  console.log('   - PO Numbers: 4500000000, 4500000001, etc.');
  console.log('=' .repeat(70));
  
  try {
    const result = await fetchPurchaseOrders('100000');  // Test with vendor 100000
    
    console.log('📋 RESULT SUMMARY:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Total Records: ${result.total}`);
    console.log(`   Total Records (compat): ${result.totalRecords}`);
    console.log('');
    
    if (result.purchaseOrders && result.purchaseOrders.length > 0) {
      console.log('📊 PURCHASE ORDERS ANALYSIS:');
      console.log('');
      
      result.purchaseOrders.forEach((po, index) => {
        console.log(`📦 Order ${index + 1}:`);
        console.log(`   PO Number: "${po.poNumber}" ${po.poNumber ? '✅' : '❌ EMPTY'}`);
        console.log(`   Vendor ID: "${po.vendorId}" ${po.vendorId ? '✅' : '❌ EMPTY'}`);
        console.log(`   PO Date: "${po.poDate}" ${po.poDate ? '✅' : '❌ EMPTY'}`);
        console.log(`   EDD: "${po.edd}" ${po.edd ? '✅' : '❌ EMPTY'}`);
        console.log(`   Currency: "${po.currency}" ${po.currency === 'INR' ? '✅ INR' : '❌ NOT INR'}`);
        
        if (po._raw) {
          console.log('   📝 Raw SAP Fields:');
          Object.keys(po._raw).forEach(key => {
            console.log(`      ${key}: "${po._raw[key]}"`);
          });
        }
        console.log('   ' + '-'.repeat(50));
      });
      
      // Field validation summary
      const stats = {
        totalOrders: result.purchaseOrders.length,
        validPONumbers: result.purchaseOrders.filter(po => po.poNumber && po.poNumber.trim() !== '').length,
        validEDD: result.purchaseOrders.filter(po => po.edd && po.edd.trim() !== '').length,
        validCurrency: result.purchaseOrders.filter(po => po.currency === 'INR').length,
        validDates: result.purchaseOrders.filter(po => po.poDate && po.poDate.trim() !== '').length
      };
      
      console.log('📈 VALIDATION SUMMARY:');
      console.log(`   Total Orders: ${stats.totalOrders} ${stats.totalOrders === 12 ? '✅ MATCHES SAP' : '❌ NOT 12'}`);
      console.log(`   Valid PO Numbers: ${stats.validPONumbers}/${stats.totalOrders} ${stats.validPONumbers === stats.totalOrders ? '✅' : '❌'}`);
      console.log(`   Valid EDD Dates: ${stats.validEDD}/${stats.totalOrders} ${stats.validEDD === stats.totalOrders ? '✅' : '❌'}`);
      console.log(`   INR Currency: ${stats.validCurrency}/${stats.totalOrders} ${stats.validCurrency === stats.totalOrders ? '✅' : '❌'}`);
      console.log(`   Valid PO Dates: ${stats.validDates}/${stats.totalOrders} ${stats.validDates === stats.totalOrders ? '✅' : '❌'}`);
      
      if (stats.totalOrders === 12 && stats.validEDD === 12 && stats.validCurrency === 12) {
        console.log('');
        console.log('🎉 SUCCESS! All field mappings are working correctly!');
        console.log('✅ Your frontend should now show:');
        console.log('   - 12 purchase orders (not 5)');
        console.log('   - Proper EDD dates (not invalid dates)');
        console.log('   - INR currency (not USD)');
      } else {
        console.log('');
        console.log('⚠️  Some field mappings need fixing!');
      }
      
    } else {
      console.log('❌ No purchase orders found in response');
      console.log('🔍 Full result:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log('❌ ERROR occurred:');
    console.log(`   Message: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('');
      console.log('🚫 AUTHENTICATION ISSUE:');
      console.log('   The credentials k901705/Sameena@1911 still lack authorization');
      console.log('   for the Purchase Order service (ZVP_PO_SERVICE)');
      console.log('');
      console.log('💡 SOLUTION:');
      console.log('   Contact your SAP administrator to grant user k901705');
      console.log('   access to ZVP_PO_SERVICE transaction/service');
    }
    
    if (error.message.includes('timeout')) {
      console.log('⏰ Network timeout - SAP server may be slow');
    }
  }
  
  console.log('=' .repeat(70));
}

validateFieldMapping();
