const axios = require('axios');
const xml2js = require('xml2js');

// SAP connection details
const SAP_GR_SERVICE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_gr_service?sap-client=100';
const SAP_USERNAME = 'K901705';
const SAP_PASSWORD = 'Sameena@1911';

/**
 * Create SOAP envelope for goods receipt request
 */
function createGoodsReceiptSoapEnvelope(vendorId) {
	return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZVP_GR_FM>
         <IV_LIFNR>${vendorId}</IV_LIFNR>
      </urn:ZVP_GR_FM>
   </soapenv:Body>
</soapenv:Envelope>`;
}

/**
 * Parse SAP SOAP response for goods receipts
 */
async function parseGoodsReceiptResponse(responseXml) {
	const parser = new xml2js.Parser({
		explicitArray: false,
		ignoreAttrs: true,
		tagNameProcessors: [xml2js.processors.stripPrefix]
	});

	try {
		const result = await parser.parseStringPromise(responseXml);
		console.log('[GR Service] Parsed XML:', JSON.stringify(result, null, 2));
		
		const grResponse = result?.Envelope?.Body?.ZVP_GR_FMResponse;
		console.log('[GR Service] GR Response:', grResponse);
		
		if (!grResponse) {
			return { success: false, message: 'Invalid SAP response format', data: [] };
		}

		// Extract goods receipt data from response
		const grData = grResponse.ET_GOODS_RECEIPT?.item || [];
		console.log('[GR Service] GR Data:', grData);
		
		if (!grData || (Array.isArray(grData) && grData.length === 0)) {
			return { success: true, message: 'No goods receipts found', data: [] };
		}
		
		const grArray = Array.isArray(grData) ? grData : [grData];

		const goodsReceipts = grArray.map(gr => ({
			grNumber: gr.MBLNR || '',
			grYear: gr.MJAHR || '',
			grDate: gr.BUDAT || '',
			material: gr.MATNR || '',
			plant: gr.WERKS || '',
			companyCode: gr.BUKRS || ''
		}));

		return {
			success: true,
			message: 'Goods receipts retrieved successfully',
			data: goodsReceipts
		};
	} catch (error) {
		console.error('[GR Service] Error parsing response:', error);
		return { success: false, message: 'Failed to parse SAP response', data: [] };
	}
}

/**
 * Fetch Goods Receipts from SAP using ZVP_GR_FM
 */
async function fetchGoodsReceiptsFromSAP(vendorId) {
	try {
		console.log(`[GR Service] Fetching goods receipts for vendor: ${vendorId}`);
		
		const soapEnvelope = createGoodsReceiptSoapEnvelope(vendorId);
		console.log('[GR Service] SOAP Request:', soapEnvelope);
		
		const response = await axios.post(SAP_GR_SERVICE_URL, soapEnvelope, {
			headers: {
				'Content-Type': 'text/xml; charset=utf-8',
				'SOAPAction': '',
				'Authorization': `Basic ${Buffer.from(`${SAP_USERNAME}:${SAP_PASSWORD}`).toString('base64')}`
			},
			timeout: 30000
		});

		console.log('[GR Service] SAP Response Status:', response.status);
		console.log('[GR Service] SAP Response Data:', response.data);
		
		const result = await parseGoodsReceiptResponse(response.data);
		console.log('[GR Service] Parsed Result:', result);
		return result;
		
	} catch (error) {
		console.error('[GR Service] Error details:', {
			message: error.message,
			response: error.response?.data,
			status: error.response?.status
		});
		return {
			success: false,
			message: `SAP connection failed: ${error.message}`,
			data: []
		};
	}
}

module.exports = {
	fetchGoodsReceiptsFromSAP
};
