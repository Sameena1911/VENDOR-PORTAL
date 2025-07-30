const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('✅ All modules loaded successfully');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log('✅ Express app created');

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware configured');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Vendor Portal API'
  });
});

// Simple login route (no SAP integration yet)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // For testing - accept any credentials
  if (email && password) {
    const token = jwt.sign(
      { vendorId: email, loginTime: new Date().toISOString() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful (test mode)',
      token: token,
      user: { vendorId: email, loginTime: new Date().toISOString() }
    });
  } else {
    res.status(400).json({ message: 'Vendor ID and password are required' });
  }
});

console.log('✅ Routes configured');

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log('✅ Server started successfully');
});

console.log('✅ Server setup complete');
