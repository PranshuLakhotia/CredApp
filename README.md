# CredHub Frontend

A modern, responsive frontend for the CredHub digital credential management platform built with Next.js, TypeScript, and Material-UI.

## 🚀 Features

- **Modern Authentication UI** - Complete auth flow with login, registration, password reset
- **Responsive Design** - Mobile-first design that works on all devices
- **Material-UI Components** - Beautiful, accessible UI components
- **TypeScript** - Full type safety and better developer experience
- **Form Validation** - Comprehensive client-side validation with Zod
- **State Management** - Context-based authentication state management
- **API Integration** - Seamless integration with CredHub backend API

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v6
- **Styling**: Emotion (CSS-in-JS)
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Animation**: Framer Motion
- **State Management**: React Context + useReducer

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── verify-code/
│   │   └── set-password/
│   ├── dashboard/         # Protected dashboard
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable components
│   ├── auth/             # Authentication forms
│   ├── layout/           # Layout components
│   └── ui/               # Generic UI components
├── hooks/                # Custom React hooks
│   └── useAuth.tsx       # Authentication context & hooks
├── services/             # API services
│   └── auth.service.ts   # Authentication API calls
├── types/                # TypeScript type definitions
│   └── auth.ts           # Authentication types
├── lib/                  # Utility libraries
│   └── theme.ts          # Material-UI theme configuration
└── utils/                # Utility functions
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- CredHub Backend running on `http://localhost:8000`

### Installation

1. **Clone and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` if needed:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

The frontend implements a complete authentication system:

### Pages Available:
- **`/auth/login`** - User login with email/password
- **`/auth/register`** - New user registration
- **`/auth/forgot-password`** - Password reset request
- **`/auth/verify-code`** - Email verification code input
- **`/auth/set-password`** - New password creation
- **`/dashboard`** - Protected user dashboard

### Features:
- **JWT Token Management** - Automatic token refresh and storage
- **Form Validation** - Real-time validation with helpful error messages
- **Password Strength** - Visual password strength indicator
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Error Handling** - User-friendly error messages and loading states
- **Auto-redirect** - Smart routing based on authentication status

## 🎨 Design System

### Theme Configuration
The app uses a custom Material-UI theme with:
- **Primary Color**: Indigo Blue (`#4F46E5`)
- **Secondary Color**: Green (`#10B981`) 
- **Typography**: Inter font family
- **Components**: Custom styled buttons, inputs, and cards

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Linting with auto-fix
npm run lint:fix
```

### Code Quality

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code linting with Next.js recommended rules
- **Prettier** - Code formatting (configure in your editor)

## 🌐 API Integration

The frontend integrates with the CredHub backend API:

### Base Configuration
```typescript
// Default API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login  
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Automatic Features
- **Token Refresh** - Automatic token renewal on API calls
- **Request Interceptors** - Auto-attach auth headers
- **Error Handling** - Centralized API error management

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure API URL for production backend
3. Build the application

### Build Commands
```bash
# Create production build
npm run build

# Start production server  
npm start
```

### Deployment Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (with provided Dockerfile)

## 🔒 Security Features

- **JWT Token Security** - Secure token storage and management
- **Input Validation** - Client-side validation with Zod schemas
- **XSS Protection** - Built-in Next.js security features
- **CSRF Protection** - SameSite cookie configuration
- **Password Requirements** - Strong password enforcement

## 🎯 Future Enhancements

- [ ] Email verification flow
- [ ] Social authentication (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Progressive Web App (PWA) features
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Advanced dashboard features
- [ ] Real-time notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the CredHub application suite.
