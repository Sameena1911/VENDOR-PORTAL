const axios = require('axios');
const xml2js = require('xml2js');

const SAP_SERVICE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zservice_vp_memo?sap-client=100';
const SAP_USERNAME = 'k901705';
const SAP_PASSWORD = 'Sameena@1911';

// Create SOAP envelope for Credit and Debit Memo
function createMemoSoapEnvelope(vendorId) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
        <urn:ZVP_MEMO_FM>
            <IV_LIFNR>${vendorId}</IV_LIFNR>
        </urn:ZVP_MEMO_FM>
    </soapenv:Body>
</soapenv:Envelope>`;
}

// Parse SOAP response for Credit and Debit Memo
async function parseMemoSoapResponse(xmlResponse) {
    try {
        const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
        const result = await parser.parseStringPromise(xmlResponse);
        
        console.log('Full Memo SOAP Response:', JSON.stringify(result, null, 2));
        
        const soapBody = result['soap-env:Envelope']['soap-env:Body'];
        const response = soapBody['n0:ZVP_MEMO_FMResponse'];
        
        let debitMemos = [];
        let creditMemos = [];
        
        if (response) {
            // Process Debit Memos
            if (response.ET_DEBIT_MEMO) {
                let debitData = response.ET_DEBIT_MEMO;
                
                if (Array.isArray(debitData)) {
                    debitMemos = debitData;
                } else if (debitData.item) {
                    debitMemos = Array.isArray(debitData.item) ? debitData.item : [debitData.item];
                } else if (typeof debitData === 'object' && debitData.LIFNR) {
                    debitMemos = [debitData];
                }
                
                debitMemos = debitMemos.map(item => formatMemoRecord(item, 'DEBIT')).filter(item => item.vendorId);
            }
            
            // Process Credit Memos
            if (response.ET_CREDIT_MEMO) {
                let creditData = response.ET_CREDIT_MEMO;
                
                if (Array.isArray(creditData)) {
                    creditMemos = creditData;
                } else if (creditData.item) {
                    creditMemos = Array.isArray(creditData.item) ? creditData.item : [creditData.item];
                } else if (typeof creditData === 'object' && creditData.LIFNR) {
                    creditMemos = [creditData];
                }
                
                creditMemos = creditMemos.map(item => formatMemoRecord(item, 'CREDIT')).filter(item => item.vendorId);
            }
        }
        
        console.log('Processed Debit Memos:', debitMemos.length);
        console.log('Processed Credit Memos:', creditMemos.length);
        
        return {
            success: true,
            debitMemos: debitMemos,
            creditMemos: creditMemos,
            totalRecords: debitMemos.length + creditMemos.length,
            summary: calculateMemoSummary(debitMemos, creditMemos)
        };
        
    } catch (error) {
        console.error('Error parsing Memo SOAP response:', error);
        throw new Error('Failed to parse SAP memo response');
    }
}

// Format memo record
function formatMemoRecord(item, type) {
    return {
        vendorId: item.LIFNR || '',
        documentNumber: item.BELNR || '',
        fiscalYear: item.GJAHR || '',
        lineItem: item.BUZEI || '',
        documentType: item.H_BLART || '',
        postingDate: formatSAPDate(item.H_BUDAT || ''),
        documentDate: formatSAPDate(item.H_BLDAT || ''),
        amount: parseFloat(item.DMBTR || 0),
        currency: item.H_WAERS || 'INR',
        quantity: parseFloat(item.MENGE || 0),
        unit: item.MEINS || '',
        material: item.MATNR || '',
        glAccount: item.HKONT || '',
        debitCreditIndicator: item.SHKZG || '',
        postingKey: item.BSCHL || '',
        type: type,
        status: getMemoStatus(item.H_BLART || ''),
        description: getMemoDescription(item.H_BLART || '', type)
    };
}

// Format SAP date (YYYYMMDD or YYYY-MM-DD) to readable format
function formatSAPDate(sapDate) {
    if (!sapDate) return '';
    
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
    
    return '';
}

// Get memo status based on document type
function getMemoStatus(documentType) {
    switch (documentType) {
        case 'WE':
            return 'Goods Receipt';
        case 'RE':
            return 'Invoice Receipt';
        case 'KG':
            return 'Vendor Credit Memo';
        case 'KR':
            return 'Vendor Invoice';
        default:
            return 'Other';
    }
}

// Get memo description
function getMemoDescription(documentType, type) {
    if (type === 'DEBIT') {
        switch (documentType) {
            case 'WE':
                return 'Goods Receipt - Debit Entry';
            case 'RE':
                return 'Invoice Receipt - Debit Entry';
            case 'KG':
                return 'Vendor Credit Memo - Debit Entry';
            default:
                return 'Debit Memo Entry';
        }
    } else {
        switch (documentType) {
            case 'WE':
                return 'Goods Receipt - Credit Entry';
            case 'RE':
                return 'Invoice Receipt - Credit Entry';
            case 'KG':
                return 'Vendor Credit Memo - Credit Entry';
            default:
                return 'Credit Memo Entry';
        }
    }
}

// Calculate memo summary
function calculateMemoSummary(debitMemos, creditMemos) {
    const summary = {
        debit: {
            count: debitMemos.length,
            totalAmount: debitMemos.reduce((sum, memo) => sum + memo.amount, 0),
            byType: {}
        },
        credit: {
            count: creditMemos.length,
            totalAmount: creditMemos.reduce((sum, memo) => sum + memo.amount, 0),
            byType: {}
        },
        netAmount: 0,
        total: {
            count: debitMemos.length + creditMemos.length,
            totalAmount: 0
        }
    };
    
    // Group debit memos by type
    debitMemos.forEach(memo => {
        const type = memo.status;
        if (!summary.debit.byType[type]) {
            summary.debit.byType[type] = { count: 0, amount: 0 };
        }
        summary.debit.byType[type].count++;
        summary.debit.byType[type].amount += memo.amount;
    });
    
    // Group credit memos by type
    creditMemos.forEach(memo => {
        const type = memo.status;
        if (!summary.credit.byType[type]) {
            summary.credit.byType[type] = { count: 0, amount: 0 };
        }
        summary.credit.byType[type].count++;
        summary.credit.byType[type].amount += memo.amount;
    });
    
    // Calculate net amount (Credit - Debit)
    summary.netAmount = summary.credit.totalAmount - summary.debit.totalAmount;
    summary.total.totalAmount = summary.debit.totalAmount + summary.credit.totalAmount;
    
    return summary;
}

// Main function to fetch credit and debit memo data from SAP
async function fetchCreditDebitMemoFromSAP(vendorId) {
    try {
        console.log(`Fetching credit and debit memo data for vendor: ${vendorId}`);
        
        const soapEnvelope = createMemoSoapEnvelope(vendorId);
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
            return await parseMemoSoapResponse(response.data);
        } else {
            throw new Error(`SAP service returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error fetching credit and debit memo data from SAP:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Unable to connect to SAP system. Please check if SAP is accessible.');
        } else if (error.code === 'ETIMEDOUT') {
            throw new Error('Request to SAP system timed out. Please try again.');
        } else if (error.response) {
            console.error('SAP Error Response:', error.response.status, error.response.data);
            throw new Error(`SAP system error: ${error.response.status}`);
        } else {
            throw new Error('Failed to fetch credit and debit memo data from SAP');
        }
    }
}

module.exports = {
    fetchCreditDebitMemoFromSAP
};
