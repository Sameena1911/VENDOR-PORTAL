// Simple test script to check SAP Payment Aging connection and response
const { fetchPaymentAgingFromSAP } = require('./services/paymentAgingService');

async function testSAPPaymentAging() {
    console.log('🧪 Testing SAP Payment Aging Service...');
    console.log('=' .repeat(50));
    
    try {
        // Test with your actual LIFNR vendor ID and password
        const vendorId = '0000100000'; // Your actual SAP vendor ID
        const password = '123'; // Your actual password
        
        console.log(`📡 Fetching payment aging data for vendor: ${vendorId}`);
        console.log('⏳ Connecting to SAP...');
        
        const result = await fetchPaymentAgingFromSAP(vendorId);
        
        console.log('✅ SAP Connection Successful!');
        console.log('📊 Payment Aging Data Retrieved:');
        console.log('=' .repeat(50));
        
        if (result.success) {
            console.log(`📝 Total Records: ${result.totalRecords}`);
            console.log(`💾 Data Length: ${result.data.length}`);
            
            if (result.data.length > 0) {
                console.log('\n📋 Sample Records (first 3):');
                result.data.slice(0, 3).forEach((record, index) => {
                    console.log(`\n${index + 1}. Vendor: ${record.vendorId}`);
                    console.log(`   Document: ${record.documentNumber}`);
                    console.log(`   Amount: ${record.currency} ${record.amount}`);
                    console.log(`   Due Date: ${record.dueDate}`);
                    console.log(`   Aging: ${record.agingDays} days`);
                    console.log(`   Status: ${record.status}`);
                });
            }
            
            if (result.summary) {
                console.log('\n💰 Payment Summary:');
                console.log(`   Current: ${result.summary.current.count} records, Amount: ${result.summary.current.amount}`);
                console.log(`   1-30 Days: ${result.summary.days30.count} records, Amount: ${result.summary.days30.amount}`);
                console.log(`   31-60 Days: ${result.summary.days60.count} records, Amount: ${result.summary.days60.amount}`);
                console.log(`   61-90 Days: ${result.summary.days90.count} records, Amount: ${result.summary.days90.amount}`);
                console.log(`   90+ Days: ${result.summary.overdue.count} records, Amount: ${result.summary.overdue.amount}`);
                console.log(`   Total: ${result.summary.total.count} records, Amount: ${result.summary.total.amount}`);
            }
            
            console.log('\n🎉 Test Completed Successfully!');
            console.log('✅ Ready to display data in frontend');
            
        } else {
            console.log('⚠️  No data returned from SAP');
            console.log('Message:', result.message);
        }
        
    } catch (error) {
        console.error('❌ SAP Connection Failed:');
        console.error('Error:', error.message);
        console.error('\n🔧 Troubleshooting Tips:');
        console.error('1. Check if SAP server is accessible');
        console.error('2. Verify credentials and URL');
        console.error('3. Check network connectivity');
        console.error('4. Ensure SAP service is running');
    }
}

// Run the test
testSAPPaymentAging();

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
