// Debug version of vendor profile service
const axios = require('axios');
const xml2js = require('xml2js');

const SAP_CONFIG = {
  url: 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_profile_service?sap-client=100',
  username: 'k901705',
  password: 'Sameena@1911'
};

async function debugVendorProfile() {
  const vendorId = '0000100001'; // Test with first vendor from your LFA1 table
  
  console.log('🔍 Debug: Testing vendor profile fetch...');
  console.log('📋 Vendor ID:', vendorId);
  console.log('🌐 SAP URL:', SAP_CONFIG.url);
  
  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZVP_PROFILE_FM>
      <IV_LIFNR>${vendorId}</IV_LIFNR>
    </urn:ZVP_PROFILE_FM>
  </soapenv:Body>
</soapenv:Envelope>`;

  console.log('\n📤 SOAP Envelope:');
  console.log(soapEnvelope);
  
  try {
    console.log('\n🚀 Sending request to SAP...');
    
    const response = await axios.post(SAP_CONFIG.url, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Authorization': `Basic ${Buffer.from(`${SAP_CONFIG.username}:${SAP_CONFIG.password}`).toString('base64')}`
      },
      timeout: 30000
    });
    
    console.log('\n✅ SAP Response received!');
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', response.headers);
    console.log('\n📄 Full SAP Response:');
    console.log(response.data);
    
    // Try to parse the response
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
      tagNameProcessors: [xml2js.processors.stripPrefix]
    });
    
    const result = await parser.parseStringPromise(response.data);
    console.log('\n🔧 Parsed Response Structure:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('\n❌ Error occurred:');
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response headers:', error.response.headers);
      console.log('Response data:', error.response.data);
    }
    
    if (error.code) {
      console.log('Error code:', error.code);
    }
  }
}

debugVendorProfile();
