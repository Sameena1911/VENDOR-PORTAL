# Vendor Portal Backend

A Node.js Express API backend for the Vendor Portal application with SAP integration.

## Features

- SAP authentication via ZVP_LOGIN_FM function module
- JWT token-based session management
- CORS enabled for frontend communication
- Security headers with Helmet
- Request logging with Morgan
- Environment variable configuration

## SAP Integration

### Function Module: ZVP_LOGIN_FM
- **Service**: ZVP_LOGIN_SERVICE
- **URL**: http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_login_service?sap-client=100
- **Authentication**: Uses vendor credentials from ZVP_LOGIN_TABLE
- **Validation**: Checks against LIFNR from LFA1 table

### Authentication Flow
1. Frontend sends Vendor ID and Password
2. Backend creates SOAP envelope for SAP function module
3. SAP validates credentials against ZVP_LOGIN_TABLE
4. On success, backend generates JWT token
5. Token used for subsequent API calls

## API Endpoints

### Authentication
- `POST /api/auth/login` - Vendor login via SAP
- `GET /api/auth/profile` - Get vendor profile (protected)
- `POST /api/auth/logout` - Vendor logout (protected)

### Dashboard
- `GET /api/dashboard` - Get dashboard data (protected)

### Vendors
- `GET /api/vendors` - Get all vendors (protected)

### Health
- `GET /api/health` - Health check

## Environment Variables

Create a `.env` file with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# SAP Configuration
SAP_SERVICE_URL=http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_login_service?sap-client=100
SAP_USERNAME=k901705
SAP_PASSWORD=Sameena@1911
SAP_TIMEOUT=30000

# CORS Configuration
FRONTEND_URL=http://localhost:4200
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:3000

## SAP SOAP Request Format

The application sends SOAP requests in this format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:n0="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <n0:ZVP_LOGIN_FM>
      <VENDOR_ID>vendor_id</VENDOR_ID>
      <PASSWORD>password</PASSWORD>
    </n0:ZVP_LOGIN_FM>
  </soapenv:Body>
</soapenv:Envelope>
```

## Project Structure

```
backend-node/
├── server.js          # Main server file with SAP integration
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (SAP credentials)
└── README.md         # This file
```

## Security Notes

- SAP credentials are stored in environment variables
- JWT tokens expire after 24 hours
- All API endpoints except login and health require authentication
- Input validation on all endpoints
- Use HTTPS in production
- Ensure SAP system is accessible from your network
