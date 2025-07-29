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

    // Authenticate with SAP
    const sapResult = await authenticateWithSAP(vendorId, password);
    
    if (!sapResult.success) {
      return res.status(401).json({ 
        message: sapResult.message || 'Invalid vendor ID or password' 
      });
    }

    // Generate JWT token for successful authentication
    const token = jwt.sign(
      { 
        vendorId: vendorId,
        loginTime: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        vendorId: vendorId,
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
