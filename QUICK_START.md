# ⚡ Quick Start Guide - LoveConnect

Get your matchmaking platform running in 5 minutes!

## 🏃‍♂️ Fastest Setup (Development)

### 1. Prerequisites
- Node.js 16+ installed
- MongoDB running locally OR MongoDB Atlas account
- Stripe account (for payments)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd offline-matchmaking-app
npm install
cd client && npm install && cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env
```

**Edit `.env` with minimum required values:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matchmaking-app
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
CLIENT_URL=http://localhost:3000
```

**Create `client/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Start Application
```bash
npm run dev
```

### 5. Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

## 🎯 What You Get

### ✅ Completed Features
- **User Authentication** (Register/Login with JWT)
- **Multi-step Registration** (3-step form with validation)
- **Modern UI/UX** (Tailwind CSS, responsive design)
- **Backend API** (Express.js with MongoDB)
- **Stripe Integration** (Payment processing setup)
- **User Dashboard** (Profile overview and stats)
- **Security Features** (Rate limiting, CORS, validation)

### 🚧 Ready for Implementation
- **Profile Browsing** (API endpoints ready)
- **Calendar Booking** (Database models ready)
- **Payment Flow** (Stripe integration complete)
- **Booking Management** (Full CRUD operations)
- **Review System** (Rating and feedback)

## 🔧 Key Commands

```bash
# Development (both servers)
npm run dev

# Backend only
npm run server

# Frontend only
cd client && npm start

# Install all dependencies
npm run install-all

# Production build
cd client && npm run build
```

## 🎨 What's Included

### Backend (`/server`)
- Express.js server with security middleware
- MongoDB models (User, Booking)
- JWT authentication system
- Stripe payment processing
- Complete API endpoints
- Input validation and error handling

### Frontend (`/client`)
- React 18 with modern hooks
- Responsive Tailwind CSS design
- Multi-step registration form
- Authentication context
- Protected routing
- Toast notifications
- Stripe payment components

## 🔐 Required API Keys

### Stripe (stripe.com)
1. Create account → Get test keys
2. Copy to `.env` files
3. Optional: Setup webhooks for production

### MongoDB
- **Local**: Start MongoDB service
- **Atlas**: Get connection string

## 🚀 Next Steps

1. **Test Registration**: Create account at `/register`
2. **Customize Styling**: Edit Tailwind classes
3. **Add Features**: Implement calendar, browse, booking pages
4. **Deploy**: Use Heroku (backend) + Netlify (frontend)

## 📱 Mobile Ready

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🆘 Need Help?

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Documentation**: See `README.md`
- **Issues**: Check terminal logs and browser console

---

**Ready to find love? Start coding! 💕**