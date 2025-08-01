const axios = require('axios');

// Test SAP RFQ Service Connection
async function testSAPConnection() {
  const SAP_CONFIG = {
    url: 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_rfq_service?sap-client=100',
    username: 'k901705',
    password: 'Sameena@1911'
  };

  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZVP_RFQ_FM>
      <IV_LIFNR>0000100000</IV_LIFNR>
    </urn:ZVP_RFQ_FM>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    console.log('🔍 Testing SAP RFQ Service Connection...');
    console.log('📡 URL:', SAP_CONFIG.url);
    console.log('👤 Username:', SAP_CONFIG.username);
    console.log('📤 SOAP Request:', soapEnvelope);

    const response = await axios.post(SAP_CONFIG.url, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Authorization': `Basic ${Buffer.from(`${SAP_CONFIG.username}:${SAP_CONFIG.password}`).toString('base64')}`
      },
      timeout: 30000
    });

    console.log('✅ SAP Connection Successful!');
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data (first 1000 chars):', response.data.substring(0, 1000));
    
    return true;
  } catch (error) {
    console.error('❌ SAP Connection Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    return false;
  }
}

// Run the test
testSAPConnection().then(success => {
  if (success) {
    console.log('🎉 SAP RFQ Service is responding correctly!');
  } else {
    console.log('💥 SAP RFQ Service connection failed!');
  }
  process.exit(success ? 0 : 1);
});
