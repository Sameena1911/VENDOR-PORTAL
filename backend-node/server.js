require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const xml2js = require('xml2js');

// Import vendor profile service
const { fetchVendorProfileFromSAP } = require('./services/vendorProfileService');
// Import payment aging service
const { fetchPaymentAgingFromSAP } = require('./services/paymentAgingService');
// Import credit debit memo service
const { fetchCreditDebitMemoFromSAP } = require('./services/creditDebitMemoService');
// Import invoice service
const { fetchInvoiceListFromSAP, fetchInvoicePDFFromSAP, savePDFToFile } = require('./services/invoiceService');
// Import purchase order service
const { fetchPurchaseOrdersFromSAP } = require('./services/purchaseOrderService');
// Import goods receipt service
const { fetchGoodsReceiptsFromSAP } = require('./services/goodsReceiptService');
// Import RFQ service
const { fetchRFQsFromSAP } = require('./services/rfqService');
// ✅ Import invoice header service
// const { fetchInvoiceHeaderFromSAP } = require('./invoiceheader');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// SAP Configuration
const SAP_CONFIG = {
  url: process.env.SAP_SERVICE_URL || 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_login_service?sap-client=100',
  username: process.env.SAP_USERNAME || 'k901705',
  password: process.env.SAP_PASSWORD || 'Sameena@1911',
  timeout: parseInt(process.env.SAP_TIMEOUT) || 30000
};

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: '*', // Angular dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to create SOAP envelope for SAP login
function createSoapEnvelope(vendorId, password) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:n0="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <n0:ZVP_LOGIN_FM>
      <VENDOR_ID>${vendorId}</VENDOR_ID>
      <PASSWORD>${password}</PASSWORD>
    </n0:ZVP_LOGIN_FM>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// Helper function to parse SAP SOAP response
async function parseSoapResponse(responseXml) {
  const parser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  });
  
  try {
    const result = await parser.parseStringPromise(responseXml);
    const loginResponse = result?.Envelope?.Body?.ZVP_LOGIN_FMResponse;
    
    return {
      success: loginResponse?.SUCCESS === 'X',
      message: loginResponse?.MESSAGE || 'Unknown error'
    };
  } catch (error) {
    console.error('Error parsing SOAP response:', error);
    throw new Error('Failed to parse SAP response');
  }
}

// Function to authenticate with SAP
async function authenticateWithSAP(vendorId, password) {
  try {
    const soapEnvelope = createSoapEnvelope(vendorId, password);
    
    const response = await axios.post(SAP_CONFIG.url, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Authorization': `Basic ${Buffer.from(`${SAP_CONFIG.username}:${SAP_CONFIG.password}`).toString('base64')}`
      },
      timeout: SAP_CONFIG.timeout
    });

    return await parseSoapResponse(response.data);
  } catch (error) {
    console.error('SAP Authentication Error:', error.message);
    
    if (error.response) {
      console.error('SAP Response Status:', error.response.status);
      console.error('SAP Response Data:', error.response.data);
    }
    
    throw new Error('Failed to authenticate with SAP system');
  }
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Vendor Portal API'
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email: vendorId, password } = req.body;

    // Validate input
    if (!vendorId || !password) {
      return res.status(400).json({ 
        message: 'Vendor ID and password are required' 
      });
    }

    // Map login credentials to LIFNR vendor ID
    // In production, this would be fetched from a database
    const vendorMapping = {
      'k901705': '0000100000',  // Your SAP user maps to your LIFNR vendor ID
      'vendor@test.com': '0000100000', // Alternative login
      'VENDOR001': '0000100000', // Alternative vendor ID
      '0000100000': '0000100000' // Direct LIFNR login
    };

    const actualVendorId = vendorMapping[vendorId] || vendorId;
    console.log(`Login attempt: ${vendorId} -> LIFNR: ${actualVendorId}`);

    // For testing purposes, if vendorId is 0000100000 and password is 123, allow login
    if (actualVendorId === '0000100000' && password === '123') {
      console.log('✅ Using test credentials for vendor 0000100000');
      
      // Generate JWT token for successful authentication
      const token = jwt.sign(
        { 
          vendorId: actualVendorId,  // Store the actual LIFNR vendor ID
          loginUser: vendorId,       // Store the login user for reference
          loginTime: new Date().toISOString()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful',
        token: token,
        user: {
          vendorId: actualVendorId,
          loginUser: vendorId,
          loginTime: new Date().toISOString()
        }
      });
    }

    // Authenticate with SAP for other credentials
    const sapResult = await authenticateWithSAP(actualVendorId, password);
    
    if (!sapResult.success) {
      return res.status(401).json({ 
        message: sapResult.message || 'Invalid vendor ID or password' 
      });
    }

    // Generate JWT token for successful authentication
    const token = jwt.sign(
      { 
        vendorId: actualVendorId,  // Store the actual LIFNR vendor ID
        loginUser: vendorId,       // Store the login user for reference
        loginTime: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        vendorId: actualVendorId,
        loginUser: vendorId,
        loginTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error - Unable to connect to authentication system' 
    });
  }
});

// Protected route - Get user profile
app.get('/api/auth/profile', verifyToken, (req, res) => {
  res.json({
    vendorId: req.user.vendorId,
    loginTime: req.user.loginTime
  });
});

// Protected route - Get vendor profile from SAP
app.get('/api/vendor/profile', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    console.log(`Fetching profile for vendor: ${vendorId}`);

    // Fetch vendor profile from SAP
    const profileResult = await fetchVendorProfileFromSAP(vendorId);
    
    res.json({
      message: 'Vendor profile retrieved successfully from SAP',
      data: profileResult.data
    });

  } catch (error) {
    console.error('Vendor profile fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      message: 'Failed to fetch vendor profile from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Get payment and aging data from SAP
app.get('/api/vendor/payment-aging', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    console.log(`Fetching payment aging data for vendor: ${vendorId}`);

    // Fetch payment aging data from SAP
    const paymentAgingResult = await fetchPaymentAgingFromSAP(vendorId);
    
    if (paymentAgingResult.success) {
      res.json({
        success: true,
        message: 'Payment aging data retrieved successfully from SAP',
        data: paymentAgingResult.data,
        summary: paymentAgingResult.summary,
        totalRecords: paymentAgingResult.totalRecords
      });
    } else {
      res.json({
        success: false,
        message: paymentAgingResult.message || 'No payment aging data found',
        data: []
      });
    }

  } catch (error) {
    console.error('Payment aging fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      message: 'Failed to fetch payment aging data from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Get credit and debit memo data from SAP
app.get('/api/vendor/credit-debit-memo', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    console.log(`Fetching credit and debit memo data for vendor: ${vendorId}`);

    // Fetch credit and debit memo data from SAP
    const memoResult = await fetchCreditDebitMemoFromSAP(vendorId);
    
    if (memoResult.success) {
      res.json({
        message: 'Credit and debit memo data retrieved successfully from SAP',
        debitMemos: memoResult.debitMemos,
        creditMemos: memoResult.creditMemos,
        summary: memoResult.summary,
        totalRecords: memoResult.totalRecords
      });
    } else {
      res.status(404).json({
        message: memoResult.message || 'No credit/debit memo data found',
        debitMemos: [],
        creditMemos: []
      });
    }

  } catch (error) {
    console.error('Credit/Debit memo fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      message: 'Failed to fetch credit/debit memo data from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});
// ✅ New Protected Route - Fetch Invoice Header
// app.get('/api/vendor/invoice-header', verifyToken, async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;

//     if (!vendorId) {
//       return res.status(400).json({
//         message: 'Vendor ID not found in token',
//         error: 'Missing vendor ID'
//       });
//     }

//     console.log(`Fetching invoice header for vendor: ${vendorId}`);

//     const result = await fetchInvoiceHeaderFromSAP(vendorId);

//     res.json({
//       message: 'Invoice header retrieved successfully from SAP',
//       data: result
//     });

//   } catch (error) {
//     console.error('Invoice header fetch error:', error);
//     res.status(500).json({
//       message: 'Failed to fetch invoice header from SAP',
//       error: error.message,
//       details: 'Check server logs for more information'
//     });
//   }
// });
// Protected route - Get invoice list from SAP
app.get('/api/vendor/invoices', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    console.log(`Fetching invoice list for vendor: ${vendorId}`);

    // Fetch invoice list from SAP
    const invoiceResult = await fetchInvoiceListFromSAP(vendorId);
    
    if (invoiceResult.success) {
      res.json({
        message: 'Invoice list retrieved successfully from SAP',
        invoices: invoiceResult.invoices,
        summary: invoiceResult.summary,
        totalRecords: invoiceResult.totalRecords
      });
    } else {
      res.status(404).json({
        message: invoiceResult.message || 'No invoice data found',
        invoices: []
      });
    }

  } catch (error) {
    console.error('Invoice list fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      message: 'Failed to fetch invoice list from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Get invoice PDF from SAP
app.get('/api/vendor/invoice/:documentNumber/pdf', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const documentNumber = req.params.documentNumber;
    
    if (!vendorId) {
      return res.status(400).json({
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    if (!documentNumber) {
      return res.status(400).json({
        message: 'Document number is required',
        error: 'Missing document number'
      });
    }

    console.log(`Fetching invoice PDF for vendor: ${vendorId}, document: ${documentNumber}`);

    // Fetch invoice PDF from SAP
    const pdfResult = await fetchInvoicePDFFromSAP(vendorId, documentNumber);
    
    if (pdfResult.success) {
      // Return base64 PDF data for preview/download
      res.json({
        message: 'Invoice PDF retrieved successfully from SAP',
        pdfData: pdfResult.pdfData,
        documentNumber: documentNumber,
        vendorId: vendorId
      });
    } else {
      res.status(404).json({
        message: pdfResult.message || 'Invoice PDF not found',
        error: 'PDF generation failed'
      });
    }

  } catch (error) {
    console.error('Invoice PDF fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      message: 'Failed to fetch invoice PDF from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Download invoice PDF
app.get('/api/vendor/invoice/:documentNumber/download', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const documentNumber = req.params.documentNumber;
    
    if (!vendorId || !documentNumber) {
      return res.status(400).json({
        message: 'Vendor ID and document number are required'
      });
    }

    console.log(`Downloading invoice PDF for vendor: ${vendorId}, document: ${documentNumber}`);

    // Fetch invoice PDF from SAP
    const pdfResult = await fetchInvoicePDFFromSAP(vendorId, documentNumber);
    
    if (pdfResult.success) {
      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(pdfResult.pdfData, 'base64');
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice_${documentNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer
      res.send(pdfBuffer);
    } else {
      res.status(404).json({
        message: pdfResult.message || 'Invoice PDF not found',
        error: 'PDF generation failed'
      });
    }

  } catch (error) {
    console.error('Invoice PDF download error:', error);
    
    // Return proper error response
    res.status(500).json({
      message: 'Failed to download invoice PDF from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Get purchase orders from SAP
app.get('/api/vendor/purchase-orders', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    console.log(`Fetching purchase orders for vendor: ${vendorId}`);

    // Fetch purchase orders from SAP
    const poResult = await fetchPurchaseOrdersFromSAP(vendorId);
    
    if (poResult.success) {
      res.json({
        message: 'Purchase orders retrieved successfully from SAP',
        purchaseOrders: poResult.purchaseOrders,
        summary: poResult.summary,
        totalRecords: poResult.totalRecords
      });
    } else {
      res.status(404).json({
        message: poResult.message || 'No purchase order data found',
        purchaseOrders: []
      });
    }

  } catch (error) {
    console.error('Purchase order fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      message: 'Failed to fetch purchase orders from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Get goods receipts from SAP
app.get('/api/vendor/goods-receipts', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    console.log(`Fetching goods receipts for vendor: ${vendorId}`);

    // Fetch goods receipts from SAP
    const grResult = await fetchGoodsReceiptsFromSAP(vendorId);
    
    res.json({
      success: grResult.success,
      message: grResult.message,
      data: grResult.data,
      source: grResult.source,
      totalRecords: grResult.data ? grResult.data.length : 0
    });

  } catch (error) {
    console.error('Goods receipt fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goods receipts from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Get RFQs from SAP
app.get('/api/vendor/rfqs', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID not found in token',
        error: 'Missing vendor ID'
      });
    }

    console.log(`Fetching RFQs for vendor: ${vendorId}`);

    // Fetch RFQs from SAP
    const rfqResult = await fetchRFQsFromSAP(vendorId);
    
    if (rfqResult.success) {
      res.json({
        message: 'RFQs retrieved successfully from SAP',
        rfqs: rfqResult.rfqs,
        summary: rfqResult.summary,
        totalRecords: rfqResult.totalRecords
      });
    } else {
      // Return fallback data if SAP fails
      res.json({
        message: rfqResult.error ? `SAP Error: ${rfqResult.error}` : 'Using fallback RFQ data',
        rfqs: rfqResult.rfqs,
        summary: rfqResult.summary,
        totalRecords: rfqResult.totalRecords
      });
    }

  } catch (error) {
    console.error('RFQ fetch error:', error);
    
    // Return proper error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs from SAP',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Protected route - Dashboard data
app.get('/api/dashboard', verifyToken, (req, res) => {
  res.json({
    stats: {
      totalOrders: 24,
      pendingApprovals: 5,
      revenue: 12450,
      activeProducts: 18
    },
    recentActivities: [
      'Order #1234 was approved',
      'New product "Widget Pro" was added',
      'Payment for Order #1230 received',
      'Profile updated successfully'
    ]
  });
});

// Sample protected route - Get all vendors (example)
app.get('/api/vendors', verifyToken, (req, res) => {
  res.json([
    { id: 1, name: 'ABC Corp', status: 'active', joinDate: '2023-01-15' },
    { id: 2, name: 'XYZ Ltd', status: 'pending', joinDate: '2023-02-20' },
    { id: 3, name: 'Tech Solutions', status: 'active', joinDate: '2023-03-10' }
  ]);
});

// Logout endpoint (client-side handles token removal)
app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Initialize and start server
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
    //   console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    //   console.log(`� SAP Integration: ${SAP_CONFIG.url}`);
    //   console.log('\n📋 SAP Vendor Portal Login:');
    //   console.log('   Use your Vendor ID and Password from ZVP_LOGIN_TABLE');
    //   console.log('   Example: Vendor ID format should match LIFNR from LFA1 table');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
