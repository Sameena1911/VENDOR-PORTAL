
const axios = require('axios');
const xml2js = require('xml2js');

// SAP Configuration for Vendor Profile Service
const SAP_PROFILE_CONFIG = {
  url: process.env.SAP_PROFILE_SERVICE_URL || 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_profile_service?sap-client=100',
  username: process.env.SAP_USERNAME || 'k901705',
  password: process.env.SAP_PASSWORD || 'Sameena@1911',
  timeout: parseInt(process.env.SAP_TIMEOUT) || 30000
};

// Helper function to create SOAP envelope for vendor profile fetch
function createProfileSoapEnvelope(vendorId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZVP_PROFILE_FM>
      <IV_LIFNR>${vendorId}</IV_LIFNR>
    </urn:ZVP_PROFILE_FM>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// Helper function to parse SAP SOAP response for vendor profile
async function parseProfileSoapResponse(responseXml) {
  const parser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  });
  
  try {
    console.log('Raw SAP Response:', responseXml);
    const result = await parser.parseStringPromise(responseXml);
    console.log('Parsed XML Result:', JSON.stringify(result, null, 2));
    
    const profileResponse = result?.Envelope?.Body?.ZVP_PROFILE_FMResponse;
    
    if (!profileResponse) {
      console.error('No ZVP_PROFILE_FMResponse found in SAP response');
      
      // Check for SOAP fault
      const fault = result?.Envelope?.Body?.Fault;
      if (fault) {
        throw new Error(`SAP SOAP Fault: ${fault.faultstring || fault.detail || 'Unknown SOAP error'}`);
      }
      
      throw new Error('Invalid response structure from SAP - No ZVP_PROFILE_FMResponse found');
    }

    // Extract vendor data from the response based on actual SAP fields
    const vendorData = {
      lifnr: profileResponse.EV_LIFNR || profileResponse.IV_LIFNR || '',
      name1: profileResponse.EV_NAME1 || '',
      land1: profileResponse.EV_LAND1 || '',
      ort01: profileResponse.EV_ORT01 || '',
      message: profileResponse.MESSAGE || 'Profile retrieved successfully',
      success: profileResponse.MESSAGE || profileResponse.EV_NAME1 ? true : false // If we have data, it's successful
    };

    console.log('Extracted vendor data:', vendorData);
    return vendorData;
  } catch (error) {
    console.error('Error parsing vendor profile SOAP response:', error);
    throw error;
  }
}

// Function to fetch vendor profile from SAP
async function fetchVendorProfileFromSAP(vendorId) {
  try {
    // Convert vendor ID to internal format (with leading zeros)
    const paddedVendorId = vendorId.padStart(10, '0');
    const soapEnvelope = createProfileSoapEnvelope(paddedVendorId);
    
    console.log(`Fetching vendor profile for: ${vendorId} (padded: ${paddedVendorId})`);
    console.log('SOAP Envelope:', soapEnvelope);
    
    const response = await axios.post(SAP_PROFILE_CONFIG.url, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Authorization': `Basic ${Buffer.from(`${SAP_PROFILE_CONFIG.username}:${SAP_PROFILE_CONFIG.password}`).toString('base64')}`
      },
      timeout: SAP_PROFILE_CONFIG.timeout
    });

    console.log('SAP Response Status:', response.status);
    const vendorData = await parseProfileSoapResponse(response.data);
    
    if (!vendorData.success) {
      throw new Error(vendorData.message || 'SAP returned unsuccessful response');
    }

    // Return formatted vendor profile data
    return {
      success: true,
      data: {
        vendorId: vendorData.lifnr || paddedVendorId,
        vendorName: vendorData.name1 || 'Unknown Vendor',
        country: vendorData.land1 || 'Unknown',
        city: vendorData.ort01 || 'Unknown',
        status: vendorData.message || 'Active',
        lastUpdated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('SAP Vendor Profile Fetch Error:', error.message);
    
    if (error.response) {
      console.error('SAP Response Status:', error.response.status);
      console.error('SAP Response Headers:', error.response.headers);
      console.error('SAP Response Data:', error.response.data);
    }
    
    // Re-throw the error instead of returning mock data
    throw new Error(`Failed to fetch vendor profile from SAP: ${error.message}`);
  }
}

module.exports = {
  fetchVendorProfileFromSAP,
  SAP_PROFILE_CONFIG
};
