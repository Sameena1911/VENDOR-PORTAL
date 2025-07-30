const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

console.log('Starting server...');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'test-secret';

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Vendor Portal API - Test Mode'
  });
});

// Simple login (for testing)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  res.json({
    message: 'Test login successful',
    token: 'test-token',
    user: { vendorId: email }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
