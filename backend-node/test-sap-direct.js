const axios = require('axios');

async function testSAPCredentials() {
  console.log('🧪 Testing SAP Credentials Directly');
  console.log('📋 Using: k901705 / Sameena@1911');
  console.log('🎯 Testing Purchase Order Service');
  console.log('=' .repeat(50));
  
  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZVP_PO_FM>
      <IV_LIFNR>0000100000</IV_LIFNR>
    </urn:ZVP_PO_FM>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await axios.post(
      'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_po_service?sap-client=100',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '',
          'Authorization': `Basic ${Buffer.from('k901705:Sameena@1911').toString('base64')}`
        },
        timeout: 30000
      }
    );

    console.log('✅ SUCCESS! SAP responded with status:', response.status);
    console.log('📄 Response length:', response.data.length, 'characters');
    
    if (response.data.includes('ZVP_PO_FMResponse')) {
      console.log('🎉 SAP Purchase Order service is responding!');
      console.log('📊 Your updated service should now fetch ACTUAL data!');
      
      // Try to find ET_PO_DATA in response
      if (response.data.includes('ET_PO_DATA')) {
        console.log('📋 Purchase Order data found in response!');
        
        // Count occurrences of item tags to estimate record count
        const itemMatches = response.data.match(/<item>/g);
        if (itemMatches) {
          console.log(`📈 Estimated ${itemMatches.length} purchase order records found`);
          console.log('🎯 This should match your SAP backend count!');
        }
      }
    } else {
      console.log('⚠️  Unexpected response format');
    }
    
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('💬 Error:', error.message);
    
    if (error.response) {
      console.log('📄 Status:', error.response.status);
      
      if (error.response.status === 401) {
        console.log('🚫 AUTHENTICATION FAILED');
        console.log('💡 Credentials k901705/Sameena@1911 are still not authorized for Purchase Orders');
        console.log('📞 Contact SAP admin to grant ZVP_PO_SERVICE access to user k901705');
      }
      
      if (error.response.data && error.response.data.includes('Anmeldung fehlgeschlagen')) {
        console.log('🇩🇪 SAP says: "Anmeldung fehlgeschlagen" (Login failed)');
      }
    }
  }
  
  console.log('=' .repeat(50));
}

testSAPCredentials();
