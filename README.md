# 🏢 Vendor Portal - SAP Integrated Solution

A comprehensive full-stack vendor management portal built with **Angular 17** frontend and **Node.js** backend, featuring **SAP integration** for enterprise-level vendor authentication and management.

## 🌟 Features

### Frontend (Angular 17)
- **Modern Dashboard Design** with SAP color scheme (#0057D2)
- **Fixed Sidebar Navigation** with 7 core modules
- **Responsive Design** for all screen sizes
- **JWT Token Authentication** with route guards
- **Real-time Notifications** system
- **Vendor Profile Management**
- **Interactive Summary Tiles**

### Backend (Node.js + Express)
- **SAP SOAP Integration** for vendor authentication
- **JWT Token Management** with expiration handling
- **CORS Enabled** for cross-origin requests
- **Security Headers** with Helmet.js
- **Request Logging** with Morgan
- **XML Response Parsing** for SAP data

### SAP Integration
- **ZVP_LOGIN_FM** function module integration
- **ZVP_LOGIN_TABLE** custom table access
- **RFC-enabled service calls**
- **SOAP envelope generation and parsing**

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI (`npm install -g @angular/cli`)
- SAP system access (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sameena1911/VENDOR-PORTAL.git
   cd VENDOR-PORTAL
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend-node
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend-angular
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend-node
   npm start
   # Server runs on http://localhost:3001
   ```

2. **Start Frontend Application**
   ```bash
   cd frontend-angular
   npm start
   # Application runs on http://localhost:4200
   ```

## 📱 Application Modules

### 🏠 **Home Dashboard**
- Vendor profile information display
- Summary tiles (RFQs, POs, Goods Receipts, Outstanding)
- Real-time status updates

### 📋 **Request for Quotation (RFQ)**
- View incoming RFQ requests
- Submit quotation responses
- Track RFQ status

### 📦 **Purchase Orders**
- Monitor purchase order status
- View order details and specifications
- Track delivery schedules

### 📥 **Goods Receipt**
- Process goods receipt documentation
- Update delivery confirmations
- Manage receipt tracking

### 📄 **Invoice Details**
- View invoice information
- Track invoice status
- Manage billing details

### 💳 **Payment and Aging**
- Monitor payment status
- View aging reports
- Track outstanding amounts

### 📝 **Credit Debit Memo**
- Handle credit memo processing
- Manage debit memo transactions
- Track memo status

## 🛡️ Security Features

- **JWT Authentication** with automatic token refresh
- **Route Guards** preventing unauthorized access
- **HTTP Interceptors** for automatic token injection
- **Token Expiration Handling** with auto-logout
- **CORS Protection** for API security
- **Helmet.js Security Headers**

## 🎨 Design System

- **Primary Color**: SAP Blue (#0057D2)
- **Secondary Color**: White (#FFFFFF)
- **Typography**: Modern, clean font stack
- **Layout**: Fixed sidebar with responsive main content
- **Icons**: Unicode emojis for universal compatibility

## 🔧 Technology Stack

### Frontend
- **Angular 17** (Standalone Components)
- **TypeScript** (ES2022)
- **RxJS** for reactive programming
- **Angular Router** with guards
- **HTTP Client** for API communication

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **Axios** for HTTP requests
- **xml2js** for XML parsing
- **bcryptjs** for password hashing
- **CORS** for cross-origin support

### Development Tools
- **Angular CLI** for development server
- **Nodemon** for backend auto-restart
- **VS Code** configuration included
│   │   ├── app/
│   │   │   ├── login/       # Login component
│   │   │   ├── dashboard/   # Dashboard component
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   └── README.md
├── backend-node/           # Node.js backend API
│   ├── server.js          # Main server file
│   ├── package.json
│   ├── .env              # Environment variables
│   └── README.md
└── README.md              # This file
```

## Features

### Frontend (Angular)
- Modern Angular 17 application
- Responsive login form with validation
- Dashboard with statistics and activities
- JWT token-based authentication
- Clean, professional UI design

### Backend (Node.js)
- Express.js REST API
- JWT authentication
- Password hashing with bcryptjs
- CORS enabled for frontend communication
- Security headers and request logging

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Angular CLI (optional, for development)

### 1. Setup Backend

```bash
cd backend-node
npm install
npm run dev
```

The backend will run on http://localhost:3000

### 2. Setup Frontend

```bash
cd frontend-angular
npm install
ng serve
```

The frontend will run on http://localhost:4200

## Demo Credentials

- **Email**: vendor@example.com
- **Password**: password123

Alternative:
- **Email**: admin@example.com  
- **Password**: admin123

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/dashboard` - Dashboard data (protected)
- `GET /api/vendors` - Vendor list (protected)
- `GET /api/health` - Health check

## Development

### Backend Development
```bash
cd backend-node
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend-angular
ng serve --open  # Opens browser automatically
```

## Production Deployment

### Backend
1. Set environment variables in production
2. Change JWT_SECRET to a secure value
3. Use a proper database instead of in-memory storage
4. Enable HTTPS

### Frontend
1. Build for production: `ng build --prod`
2. Serve the `dist/` folder with a web server
3. Update API URLs for production

## Security Notes

- JWT tokens are used for authentication
- Passwords are hashed using bcryptjs
- CORS is configured for development
- Helmet provides security headers
- Input validation should be enhanced for production

## Tech Stack

### Frontend
- Angular 17
- TypeScript
- RxJS
- Angular Router
- Angular Forms

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- Helmet
- Morgan (logging)
- dotenv

## License

This project is for demonstration purposes.
