# 💕 LoveConnect - Modern Offline Matchmaking Platform

A modern web application for offline matchmaking where users can browse profiles, set availability, book dates, and make secure payments through Stripe integration.

## 🌟 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Profile Management**: Comprehensive user profiles with photos, preferences, and availability
- **Calendar Integration**: Real-time availability booking system
- **Stripe Payment Processing**: Secure payment handling for date bookings
- **Booking Management**: Complete booking lifecycle from request to completion
- **Review System**: Post-date reviews and ratings
- **Responsive Design**: Modern, mobile-first UI with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Stripe** for payment processing
- **Bcrypt** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with functional components and hooks
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Stripe React Components** for payment forms

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Stripe Account** (for payment processing)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd offline-matchmaking-app
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/matchmaking-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matchmaking-app

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the `client` directory:

```bash
cd client
touch .env
```

Add the following to `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically connect to `mongodb://localhost:27017/matchmaking-app`

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Update the Stripe keys in your `.env` files
4. For webhooks (optional for development):
   - Install Stripe CLI: `stripe login`
   - Forward events: `stripe listen --forward-to localhost:5000/api/payments/webhook`

### 6. Start the Application

#### Development Mode (Recommended)
```bash
# Start both backend and frontend concurrently
npm run dev
```

#### Manual Start
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
cd client
npm start
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
offline-matchmaking-app/
├── server/                 # Backend code
│   ├── config/            # Database configuration
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Main server file
├── client/               # Frontend code
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable components
│       ├── contexts/    # React contexts
│       ├── pages/       # Page components
│       ├── utils/       # Utility functions
│       └── App.js       # Main App component
├── package.json         # Backend dependencies
└── README.md           # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users/browse` - Browse available users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/availability` - Get user availability
- `PUT /api/users/availability` - Update availability

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/reject` - Reject booking
- `PUT /api/bookings/:id/complete` - Complete booking
- `POST /api/bookings/:id/review` - Add review

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/refund` - Process refund
- `POST /api/payments/webhook` - Stripe webhook handler

## 🎨 UI Components

The application uses a modern, responsive design with:
- **Tailwind CSS** for utility-first styling
- **Custom component classes** for consistency
- **Heroicons** for beautiful icons
- **Mobile-first responsive design**
- **Dark/light theme support** (customizable)

### Key UI Features
- Responsive navigation bar
- Multi-step registration form
- Dashboard with statistics
- Profile browsing cards
- Calendar booking interface
- Payment forms with Stripe Elements
- Toast notifications
- Loading states and error handling

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt
- **Input Validation** on all endpoints
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **Stripe Webhook Verification** for payment security

## 🧪 Testing

```bash
# Run backend tests (when implemented)
npm test

# Run frontend tests
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment (Heroku Example)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

### Frontend Deployment (Netlify Example)
1. Build the frontend: `cd client && npm run build`
2. Deploy the `build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Environment Variables for Production
Ensure all production environment variables are set:
- Use production MongoDB URI
- Use production Stripe keys
- Set `NODE_ENV=production`
- Use secure JWT secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity for Atlas

2. **Stripe Payment Issues**
   - Verify Stripe keys are correct
   - Check webhook endpoint configuration
   - Ensure webhook secret matches

3. **CORS Errors**
   - Verify `CLIENT_URL` in backend `.env`
   - Check API URL in frontend `.env`

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Getting Help

- Check the [Issues](link-to-issues) page for known problems
- Create a new issue with detailed description
- Include error messages and environment details

## 🎯 Future Enhancements

- [ ] Real-time chat messaging
- [ ] Video call integration
- [ ] Advanced matching algorithms
- [ ] Mobile app development
- [ ] Social media integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [your-email@example.com]

---

Made with ❤️ for finding love in the digital age.
