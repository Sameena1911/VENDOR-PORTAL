// Simple working server for Vendor Portal
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple validation - for now accept any non-empty credentials
  if (email && password) {
    const token = jwt.sign({ vendorId: email }, 'secret-key', { expiresIn: '24h' });
    res.json({ 
      message: 'Login successful', 
      token: token,
      user: { vendorId: email }
    });
  } else {
    res.status(400).json({ message: 'Vendor ID and password required' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});

console.log('Server file loaded successfully');
