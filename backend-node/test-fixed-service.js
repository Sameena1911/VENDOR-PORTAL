// Test the fixed vendor profile service
const { fetchVendorProfileFromSAP } = require('./services/vendorProfileService');

async function testFixedService() {
  console.log('🧪 Testing fixed vendor profile service...');
  
  try {
    const result = await fetchVendorProfileFromSAP('0000100001');
    console.log('✅ Success! Real SAP data retrieved:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testFixedService();
