console.log('Starting debug test...');

try {
  console.log('Step 1: Loading express...');
  const express = require('express');
  console.log('Step 2: Express loaded successfully');
  
  console.log('Step 3: Creating app...');
  const app = express();
  console.log('Step 4: App created successfully');
  
  console.log('Step 5: Setting up route...');
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
  console.log('Step 6: Route setup complete');
  
  console.log('Step 7: Starting server...');
  const server = app.listen(3001, () => {
    console.log('Step 8: Server started successfully on port 3001');
  });
  
  setTimeout(() => {
    console.log('Step 9: Stopping server...');
    server.close();
    console.log('Step 10: Server stopped');
    process.exit(0);
  }, 2000);
  
} catch (error) {
  console.error('Error occurred:', error);
  process.exit(1);
}
