const axios = require('axios');
const xml2js = require('xml2js');

const SAP_SERVICE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_payage_service?sap-client=100';
const SAP_USERNAME = 'k901705';
const SAP_PASSWORD = 'Sameena@1911';

// Create SOAP envelope for Payment and Aging
function createPaymentAgingSoapEnvelope(vendorId) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
        <urn:ZVP_PAYAGE_FM>
            <IV_LIFNR>${vendorId}</IV_LIFNR>
        </urn:ZVP_PAYAGE_FM>
    </soapenv:Body>
</soapenv:Envelope>`;
}

// Parse SOAP response for Payment and Aging
async function parsePaymentAgingSoapResponse(xmlResponse) {
    try {
        const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
        const result = await parser.parseStringPromise(xmlResponse);
        
        console.log('Full SOAP Response:', JSON.stringify(result, null, 2));
        
        const soapBody = result['soap-env:Envelope']['soap-env:Body'];
        const response = soapBody['n0:ZVP_PAYAGE_FMResponse'];
        
        if (response && response.EV_PAYAGE) {
            let paymentData = response.EV_PAYAGE;
            
            // Handle the structure - it might be an array of items or single item
            let dataArray = [];
            
            if (Array.isArray(paymentData)) {
                dataArray = paymentData;
            } else if (paymentData.item) {
                // If there's an item property, it could be array or single
                dataArray = Array.isArray(paymentData.item) ? paymentData.item : [paymentData.item];
            } else if (typeof paymentData === 'object' && paymentData.LIFNR) {
                // Single record directly
                dataArray = [paymentData];
            } else {
                console.log('Unexpected payment data structure:', paymentData);
                dataArray = [];
            }
            
            console.log('Processed data array length:', dataArray.length);
            
            // Process and format the payment aging data
            const formattedData = dataArray.map(item => {
                const record = {
                    vendorId: item.LIFNR || '',
                    documentNumber: item.BELNR || '',
                    postingDate: formatSAPDate(item.BUDAT || ''),
                    documentDate: formatSAPDate(item.BLDAT || ''),
                    currency: item.WAERS || 'INR',
                    taxCode: item.MWSKZ || '',
                    amount: parseFloat(item.WRBTR || 0),
                    baselineDate: formatSAPDate(item.ZFBDT || ''),
                    paymentTerms: item.ZTERM || '',
                    dueDate: formatSAPDate(item.DUE_DATE || ''),
                    agingDays: parseInt(item.AGING || 0),
                    status: getPaymentStatus(parseInt(item.AGING || 0))
                };
                
                console.log('Formatted record:', record);
                return record;
            }).filter(item => item.vendorId); // Filter out empty records
            
            console.log('Final formatted data count:', formattedData.length);
            
            return {
                success: true,
                data: formattedData,
                totalRecords: formattedData.length,
                summary: calculatePaymentSummary(formattedData)
            };
        } else {
            console.log('No payment data found in SAP response');
            return {
                success: false,
                message: 'No payment aging data found for this vendor',
                data: []
            };
        }
    } catch (error) {
        console.error('Error parsing Payment Aging SOAP response:', error);
        throw new Error('Failed to parse SAP payment aging response');
    }
}

// Format SAP date (YYYYMMDD or YYYY-MM-DD) to readable format
function formatSAPDate(sapDate) {
    if (!sapDate) return '';
    
    // Handle different date formats
    let dateStr = sapDate.toString();
    
    // If it's in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (dateStr.includes('-') && dateStr.length === 10) {
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    // If it's in YYYYMMDD format
    if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${day}/${month}/${year}`;
    }
    
    // If it's a 4-digit year only, use current date
    if (dateStr.length === 4) {
        const currentDate = new Date();
        return `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${dateStr}`;
    }
    
    return '';
}

// Get payment status based on aging days
function getPaymentStatus(agingDays) {
    if (agingDays <= 0) return 'Current';
    if (agingDays <= 30) return '1-30 Days';
    if (agingDays <= 60) return '31-60 Days';
    if (agingDays <= 90) return '61-90 Days';
    return '90+ Days Overdue';
}

// Calculate payment summary
function calculatePaymentSummary(data) {
    const summary = {
        current: { count: 0, amount: 0 },
        days30: { count: 0, amount: 0 },
        days60: { count: 0, amount: 0 },
        days90: { count: 0, amount: 0 },
        overdue: { count: 0, amount: 0 },
        total: { count: data.length, amount: 0 }
    };
    
    data.forEach(item => {
        const aging = item.agingDays;
        const amount = item.amount;
        
        summary.total.amount += amount;
        
        if (aging <= 0) {
            summary.current.count++;
            summary.current.amount += amount;
        } else if (aging <= 30) {
            summary.days30.count++;
            summary.days30.amount += amount;
        } else if (aging <= 60) {
            summary.days60.count++;
            summary.days60.amount += amount;
        } else if (aging <= 90) {
            summary.days90.count++;
            summary.days90.amount += amount;
        } else {
            summary.overdue.count++;
            summary.overdue.amount += amount;
        }
    });
    
    return summary;
}

// Main function to fetch payment aging data from SAP
async function fetchPaymentAgingFromSAP(vendorId) {
    try {
        console.log(`Fetching payment aging data for vendor: ${vendorId}`);
        
        const soapEnvelope = createPaymentAgingSoapEnvelope(vendorId);
        console.log('SOAP Request:', soapEnvelope);
        
        const response = await axios.post(SAP_SERVICE_URL, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': '',
                'Authorization': 'Basic ' + Buffer.from(`${SAP_USERNAME}:${SAP_PASSWORD}`).toString('base64')
            },
            timeout: 30000
        });
        
        console.log('SAP Response Status:', response.status);
        console.log('SAP Response Data:', response.data);
        
        if (response.status === 200) {
            return await parsePaymentAgingSoapResponse(response.data);
        } else {
            throw new Error(`SAP service returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error fetching payment aging data from SAP:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Unable to connect to SAP system. Please check if SAP is accessible.');
        } else if (error.code === 'ETIMEDOUT') {
            throw new Error('Request to SAP system timed out. Please try again.');
        } else if (error.response) {
            console.error('SAP Error Response:', error.response.status, error.response.data);
            throw new Error(`SAP system error: ${error.response.status}`);
        } else {
            throw new Error('Failed to fetch payment aging data from SAP');
        }
    }
}

module.exports = {
    fetchPaymentAgingFromSAP
};
