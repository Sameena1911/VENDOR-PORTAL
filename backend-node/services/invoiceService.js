const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const SAP_SERVICE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_invoice_services?sap-client=100';
const SAP_USERNAME = 'k901705';
const SAP_PASSWORD = 'Sameena@1911';

// Create SOAP envelope for Invoice
function createInvoiceSoapEnvelope(vendorId, documentNumber = '') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
        <urn:ZVP_INVOICE_FM>
            <IV_LIFNR>${vendorId}</IV_LIFNR>
            <IV_BELNR>${documentNumber}</IV_BELNR>
        </urn:ZVP_INVOICE_FM>
    </soapenv:Body>
</soapenv:Envelope>`;
}

// Parse SOAP response for Invoice
async function parseInvoiceSoapResponse(xmlResponse) {
    try {
        const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
        const result = await parser.parseStringPromise(xmlResponse);
        
        console.log('Full Invoice SOAP Response:', JSON.stringify(result, null, 2));
        
        const soapBody = result['soap-env:Envelope']['soap-env:Body'];
        const response = soapBody['n0:ZVP_INVOICE_FMResponse'];
        
        if (response && response.EV_PDF) {
            return {
                success: true,
                pdfData: response.EV_PDF,
                message: 'Invoice PDF generated successfully'
            };
        } else {
            return {
                success: false,
                message: 'No PDF data found in SAP response'
            };
        }
        
    } catch (error) {
        console.error('Error parsing Invoice SOAP response:', error);
        throw new Error('Failed to parse SAP invoice response');
    }
}

// Get invoice list for a vendor (mock data for now, you can replace with actual SAP call)
function getInvoiceList(vendorId) {
    // Since the FM requires a document number, we'll create a mock list
    // In a real scenario, you'd have another SAP service to get the invoice list
    return [
        {
            documentNumber: '5105600751',
            vendorId: vendorId,
            invoiceDate: '2025-07-30',
            amount: 15000.00,
            currency: 'INR',
            status: 'Posted',
            description: 'Invoice for goods receipt',
            dueDate: '2025-08-29',
            paymentTerms: 'Net 30',
            reference: 'PO-2025-001'
        },
        {
            documentNumber: '5105600752',
            vendorId: vendorId,
            invoiceDate: '2025-07-28',
            amount: 25000.00,
            currency: 'INR',
            status: 'Posted',
            description: 'Invoice for services',
            dueDate: '2025-08-27',
            paymentTerms: 'Net 30',
            reference: 'PO-2025-002'
        },
        {
            documentNumber: '5105600753',
            vendorId: vendorId,
            invoiceDate: '2025-07-26',
            amount: 8500.00,
            currency: 'INR',
            status: 'Pending',
            description: 'Invoice for materials',
            dueDate: '2025-08-25',
            paymentTerms: 'Net 30',
            reference: 'PO-2025-003'
        },
        {
            documentNumber: '5105600754',
            vendorId: vendorId,
            invoiceDate: '2025-07-24',
            amount: 12750.00,
            currency: 'INR',
            status: 'Posted',
            description: 'Invoice for equipment',
            dueDate: '2025-08-23',
            paymentTerms: 'Net 30',
            reference: 'PO-2025-004'
        }
    ];
}

// Main function to fetch invoice list from SAP (mock implementation)
async function fetchInvoiceListFromSAP(vendorId) {
    try {
        console.log(`Fetching invoice list for vendor: ${vendorId}`);
        
        // Get mock invoice list
        const invoices = getInvoiceList(vendorId);
        
        // Calculate summary
        const summary = calculateInvoiceSummary(invoices);
        
        return {
            success: true,
            invoices: invoices,
            summary: summary,
            totalRecords: invoices.length
        };
        
    } catch (error) {
        console.error('Error fetching invoice list from SAP:', error.message);
        throw new Error('Failed to fetch invoice list from SAP');
    }
}

// Main function to fetch invoice PDF from SAP
async function fetchInvoicePDFFromSAP(vendorId, documentNumber) {
    try {
        console.log(`Fetching invoice PDF for vendor: ${vendorId}, document: ${documentNumber}`);
        
        const soapEnvelope = createInvoiceSoapEnvelope(vendorId, documentNumber);
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
            return await parseInvoiceSoapResponse(response.data);
        } else {
            throw new Error(`SAP service returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error fetching invoice PDF from SAP:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Unable to connect to SAP system. Please check if SAP is accessible.');
        } else if (error.code === 'ETIMEDOUT') {
            throw new Error('Request to SAP system timed out. Please try again.');
        } else if (error.response) {
            console.error('SAP Error Response:', error.response.status, error.response.data);
            throw new Error(`SAP system error: ${error.response.status}`);
        } else {
            throw new Error('Failed to fetch invoice PDF from SAP');
        }
    }
}

// Calculate invoice summary
function calculateInvoiceSummary(invoices) {
    const summary = {
        total: {
            count: invoices.length,
            amount: invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
        },
        byStatus: {},
        pending: {
            count: 0,
            amount: 0
        },
        posted: {
            count: 0,
            amount: 0
        },
        overdue: {
            count: 0,
            amount: 0
        }
    };
    
    const today = new Date();
    
    invoices.forEach(invoice => {
        // Group by status
        const status = invoice.status;
        if (!summary.byStatus[status]) {
            summary.byStatus[status] = { count: 0, amount: 0 };
        }
        summary.byStatus[status].count++;
        summary.byStatus[status].amount += invoice.amount;
        
        // Group by posting status
        if (status === 'Pending') {
            summary.pending.count++;
            summary.pending.amount += invoice.amount;
        } else if (status === 'Posted') {
            summary.posted.count++;
            summary.posted.amount += invoice.amount;
        }
        
        // Check for overdue
        const dueDate = new Date(invoice.dueDate);
        if (dueDate < today && status !== 'Posted') {
            summary.overdue.count++;
            summary.overdue.amount += invoice.amount;
        }
    });
    
    return summary;
}

// Save PDF to file system (for download)
function savePDFToFile(base64Data, fileName) {
    try {
        const downloadsDir = path.join(__dirname, '..', 'downloads');
        
        // Create downloads directory if it doesn't exist
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }
        
        const filePath = path.join(downloadsDir, fileName);
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        
        fs.writeFileSync(filePath, pdfBuffer);
        
        return {
            success: true,
            filePath: filePath,
            fileName: fileName
        };
    } catch (error) {
        console.error('Error saving PDF file:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    fetchInvoiceListFromSAP,
    fetchInvoicePDFFromSAP,
    savePDFToFile
};
