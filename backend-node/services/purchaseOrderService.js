const axios = require('axios');
const xml2js = require('xml2js');

// SAP Configuration for Purchase Order Service
const SAP_PO_CONFIG = {
  url: process.env.SAP_PO_SERVICE_URL || 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_po_service?sap-client=100',
  username: process.env.SAP_USERNAME || 'k901705',
  password: process.env.SAP_PASSWORD || 'Sameena@1911',
  timeout: parseInt(process.env.SAP_TIMEOUT) || 30000
};

// Helper to create SOAP envelope for Purchase Order request
function createPurchaseOrderEnvelope(vendorId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZVP_PO_FM>
      <IV_LIFNR>${vendorId}</IV_LIFNR>
    </urn:ZVP_PO_FM>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// Helper to parse SAP SOAP response for PO
async function parsePurchaseOrderResponse(xml) {
  const parser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  });

  try {
    const result = await parser.parseStringPromise(xml);
    console.log('📊 Parsed SAP Response Structure:', JSON.stringify(result, null, 2));
    
    const response = result?.Envelope?.Body?.ZVP_PO_FMResponse;

    if (!response) {
      console.error('❌ No ZVP_PO_FMResponse found in SAP response');
      throw new Error('Invalid SAP PO response structure - no ZVP_PO_FMResponse');
    }

    if (!response.ET_PO_DATA) {
      console.error('❌ No ET_PO_DATA found in SAP response');
      console.log('Available response fields:', Object.keys(response));
      throw new Error('Invalid SAP PO response structure - no ET_PO_DATA');
    }

    const items = response.ET_PO_DATA.item || response.ET_PO_DATA || [];
    const itemsArray = Array.isArray(items) ? items : [items];
    
    console.log('📋 Found', itemsArray.length, 'purchase order items');
    if (itemsArray.length > 0) {
      console.log('🔍 First item structure:', JSON.stringify(itemsArray[0], null, 2));
    }
    
    return itemsArray;
  } catch (parseError) {
    console.error('❌ XML Parsing Error:', parseError.message);
    throw new Error(`Failed to parse SAP response: ${parseError.message}`);
  }
}

// Helper function to format SAP date
function formatSAPDate(sapDate) {
  if (!sapDate) return '';
  
  // SAP dates come as "20.05.2025" or "02.06.2025" format
  // Convert to standard format or keep as is
  return sapDate.toString().trim();
}

// Fetch Purchase Orders by Vendor ID
async function fetchPurchaseOrders(vendorId) {
  const paddedVendorId = vendorId.padStart(10, '0');
  const soapEnvelope = createPurchaseOrderEnvelope(paddedVendorId);

  try {
    const response = await axios.post(SAP_PO_CONFIG.url, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Authorization': `Basic ${Buffer.from(`${SAP_PO_CONFIG.username}:${SAP_PO_CONFIG.password}`).toString('base64')}`
      },
      timeout: SAP_PO_CONFIG.timeout
    });

    const poData = await parsePurchaseOrderResponse(response.data);

    return {
      success: true,
      vendorId: paddedVendorId,
      total: poData.length,
      totalRecords: poData.length,  // Add for server.js compatibility
      purchaseOrders: poData.map(po => ({
        poNumber: po.PO_NUMBER || '',
        vendorId: po.VENDOR_ID || paddedVendorId,
        matnr: po.MATNR || '',
        meins: po.MEINS || '',
        poDate: formatSAPDate(po.PO_DATE),
        edd: formatSAPDate(po.EDD),  // Format the EDD date properly
        currency: po.CURRE || 'INR',  // Ensure currency defaults to INR
        // Optional: Add debug logging to see raw SAP data
        _raw: po  // Remove this after debugging
      })),
      summary: {  // Add summary for server.js compatibility
        totalCount: poData.length,
        openCount: poData.length,
        dueSoonCount: 0,
        overdueCount: 0
      }
    };
  } catch (err) {
    console.error('SAP PO Fetch Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
    throw new Error(`Failed to fetch PO from SAP: ${err.message}`);
  }
}

module.exports = {
  fetchPurchaseOrders,
  fetchPurchaseOrdersFromSAP: fetchPurchaseOrders  // Alias for server.js compatibility
};
