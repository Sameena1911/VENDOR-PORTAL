// Test script for vendor profile service
const { fetchVendorProfileFromSAP } = require('./services/vendorProfileService');

async function testVendorProfile() {
  console.log('Testing Vendor Profile Service...');
  
  try {
    const testVendorId = '1000000001';
    console.log(`Testing with vendor ID: ${testVendorId}`);
    
    const result = await fetchVendorProfileFromSAP(testVendorId);
    
    console.log('✅ Test successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.error('Error:', error.message);
  }
}

// Run the test
testVendorProfile();
