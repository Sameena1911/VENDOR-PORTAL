// Simple test script to check SAP connection and response
const axios = require('axios');

const SAP_CONFIG = {
  url: 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_profile_service?sap-client=100',
  username: 'k901705',
  password: 'Sameena@1911'
};

// Test 1: Check if the service endpoint is reachable
async function testSAPEndpoint() {
  console.log('🔍 Testing SAP endpoint connectivity...');
  
  try {
    const response = await axios.get(SAP_CONFIG.url + '?wsdl', {
      auth: {
        username: SAP_CONFIG.username,
        password: SAP_CONFIG.password
      },
      timeout: 10000
    });
    
    console.log('✅ SAP endpoint is reachable');
    console.log('📋 WSDL Response Status:', response.status);
    
    // Look for function module in WSDL
    if (response.data.includes('ZVP_PROFILE_FM')) {
      console.log('✅ ZVP_PROFILE_FM found in WSDL');
    } else {
      console.log('❌ ZVP_PROFILE_FM NOT found in WSDL');
      console.log('Available functions in WSDL:');
      const matches = response.data.match(/operation name="[^"]+"/g);
      if (matches) {
        matches.forEach(match => console.log('  -', match));
      }
    }
    
  } catch (error) {
    console.log('❌ SAP endpoint test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

// Test 2: Try different SOAP envelope formats
async function testSOAPFormats() {
  console.log('\n🧪 Testing different SOAP envelope formats...');
  
  const testVendorId = '0000100001';
  
  // Format 1: Original working login format
  const soap1 = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZVP_PROFILE_FM>
      <IV_LIFNR>${testVendorId}</IV_LIFNR>
    </urn:ZVP_PROFILE_FM>
  </soapenv:Body>
</soapenv:Envelope>`;

  // Format 2: Alternative parameter name
  const soap2 = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZVP_PROFILE_FM>
      <VENDOR_ID>${testVendorId}</VENDOR_ID>
    </urn:ZVP_PROFILE_FM>
  </soapenv:Body>
</soapenv:Envelope>`;

  const formats = [
    { name: 'Format 1 (IV_LIFNR)', soap: soap1 },
    { name: 'Format 2 (VENDOR_ID)', soap: soap2 }
  ];

  for (const format of formats) {
    console.log(`\n📤 Testing ${format.name}...`);
    
    try {
      const response = await axios.post(SAP_CONFIG.url, format.soap, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '',
          'Authorization': `Basic ${Buffer.from(`${SAP_CONFIG.username}:${SAP_CONFIG.password}`).toString('base64')}`
        },
        timeout: 30000
      });
      
      console.log(`✅ ${format.name} - Status:`, response.status);
      console.log('📄 Response preview:', response.data.substring(0, 500) + '...');
      
      // Check for success indicators
      if (response.data.includes('SUCCESS') || response.data.includes('NAME1')) {
        console.log('🎉 This format seems to work!');
      }
      
    } catch (error) {
      console.log(`❌ ${format.name} failed:`, error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Response:', error.response.data?.substring(0, 200) + '...');
      }
    }
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting SAP Integration Tests...\n');
  
  await testSAPEndpoint();
  await testSOAPFormats();
  
  console.log('\n✅ Tests completed!');
}

runAllTests().catch(console.error);
