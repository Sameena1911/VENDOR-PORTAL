# Vendor Portal Frontend

An Angular application for the Vendor Portal with authentication and dashboard features.

## Features

- Modern Angular 17 application with standalone components
- Responsive login form with validation
- JWT token-based authentication
- Dashboard with statistics and recent activities
- Clean, professional UI with gradient backgrounds
- Form validation and error handling
- Auto-redirect after successful login

## Demo Credentials

- **Email**: vendor@example.com
- **Password**: password123

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Angular CLI globally (if not already installed):
```bash
npm install -g @angular/cli
```

3. Start the development server:
```bash
ng serve
```

The application will run on http://localhost:4200

## Project Structure

```
frontend-angular/
├── src/
│   ├── app/
│   │   ├── login/           # Login component
│   │   ├── dashboard/       # Dashboard component
│   │   ├── app.component.ts # Root component
│   │   ├── app.config.ts    # App configuration
│   │   └── app.routes.ts    # Routing configuration
│   ├── index.html           # Main HTML file
│   ├── main.ts             # Application bootstrap
│   └── styles.css          # Global styles
├── angular.json            # Angular configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Routes

- `/` - Redirects to login
- `/login` - Login page
- `/dashboard` - Protected dashboard (requires authentication)

## Components

### LoginComponent
- Email and password validation
- API integration with backend
- Error handling and loading states
- Auto-redirect on successful login

### DashboardComponent
- Statistics cards
- Recent activities list
- Logout functionality
- Protected route (requires authentication)

## Styling

- Modern CSS with gradients and shadows
- Responsive design
- Clean form styling
- Professional color scheme

## Backend Integration

The frontend communicates with the Node.js backend API at:
- Base URL: http://localhost:3000
- Login endpoint: POST /api/auth/login

## Development Notes

- Uses Angular 17 with standalone components
- Implements reactive forms with validation
- JWT tokens stored in localStorage
- CORS configured for local development
