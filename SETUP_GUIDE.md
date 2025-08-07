# 🚀 LoveConnect Setup Guide

This guide will walk you through setting up the LoveConnect matchmaking application from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js (v16+) installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] A text editor (VS Code recommended)
- [ ] MongoDB (local or Atlas account)
- [ ] Stripe account (for payments)

## 🔧 Step-by-Step Setup

### Step 1: System Requirements

#### Install Node.js
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Install MongoDB (Choose One)

**Option A: Local MongoDB**
1. Visit [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download and install MongoDB Community Server
3. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb/brew/mongodb-community
   
   # Windows
   net start MongoDB
   
   # Linux (Ubuntu)
   sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Note down your connection string

### Step 2: Project Setup

#### Clone and Install
```bash
# Clone the repository
git clone <your-repository-url>
cd offline-matchmaking-app

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Environment Configuration

#### Backend Environment
Create `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Choose one option
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/matchmaking-app

# Option B: MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matchmaking-app

# JWT Secret - Generate a secure random string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Stripe Configuration (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment
Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Step 4: Stripe Setup

#### Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Complete account verification

#### Get API Keys
1. Go to Stripe Dashboard
2. Navigate to "Developers" → "API keys"
3. Copy your publishable and secret keys
4. Update your `.env` files

#### Setup Webhooks (Optional for Development)
1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows/Linux - download from stripe.com/docs/stripe-cli
   ```

2. Login and forward webhooks:
   ```bash
   stripe login
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

3. Copy the webhook signing secret to your `.env` file

### Step 5: Database Initialization

#### For Local MongoDB
```bash
# Start MongoDB service
# The application will automatically create the database and collections
```

#### For MongoDB Atlas
1. Go to your Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Update `MONGODB_URI` in your `.env` file

### Step 6: Start the Application

#### Option A: Concurrent Mode (Recommended)
```bash
# Starts both backend and frontend together
npm run dev
```

#### Option B: Separate Terminals
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
cd client
npm start
```

### Step 7: Verify Installation

1. **Backend Health Check**: Visit http://localhost:5000/api/health
   - Should return: `{"status":"OK","message":"Matchmaking API is running"}`

2. **Frontend**: Visit http://localhost:3000
   - Should show the LoveConnect homepage

3. **Database Connection**: Check server logs for:
   ```
   📦 MongoDB Connected: <your-connection-host>
   🚀 Server running on port 5000
   ```

## 🧪 Test the Application

### Create Test Account
1. Go to http://localhost:3000/register
2. Fill out the multi-step registration form
3. Complete all required fields
4. Submit the form

### Test Authentication
1. Login with your test account
2. Verify you're redirected to the dashboard
3. Check that navigation works

### Test API Endpoints
Use a tool like Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Register user (example)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "interestedIn": "female",
    "location": {
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "datePrice": 50
  }'
```

## 🔧 Development Workflow

### Making Changes

1. **Backend Changes**: Server automatically restarts (nodemon)
2. **Frontend Changes**: Browser automatically reloads
3. **Database Changes**: Use MongoDB Compass or Atlas web interface

### Adding New Features

1. **API Endpoints**: Add to `server/routes/`
2. **Database Models**: Add to `server/models/`
3. **React Pages**: Add to `client/src/pages/`
4. **Components**: Add to `client/src/components/`

### Environment Variables

Always update both `.env` files when adding new environment variables:
- Backend: Root `.env`
- Frontend: `client/.env`

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Failed
**Error**: `MongooseError: Connection failed`

**Solutions**:
- Check if MongoDB service is running
- Verify connection string in `.env`
- For Atlas: Check network access and IP whitelist
- Test connection string separately

#### 2. Stripe Keys Invalid
**Error**: `Invalid API key provided`

**Solutions**:
- Verify keys are copied correctly (no extra spaces)
- Ensure using test keys for development
- Check key format (sk_test_... for secret, pk_test_... for publishable)

#### 3. CORS Errors
**Error**: `Access-Control-Allow-Origin` error

**Solutions**:
- Verify `CLIENT_URL` in backend `.env` matches frontend URL
- Check `REACT_APP_API_URL` in frontend `.env`
- Restart both servers after changes

#### 4. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env file
```

#### 5. JWT Secret Too Short
**Error**: `secretOrPrivateKey has a minimum key size of 2048 bits`

**Solutions**:
- Generate a longer JWT secret (minimum 32 characters)
- Use a secure random string generator

#### 6. Dependencies Installation Failed
**Error**: Various npm/yarn errors

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. **Check Logs**: Always check terminal output for error messages
2. **Console Errors**: Check browser developer console
3. **Network Tab**: Check API requests and responses
4. **MongoDB Logs**: Check database connection logs

### Debug Mode

Enable debug mode for more detailed logs:

```bash
# Backend debug mode
DEBUG=* npm run server

# Or set in .env
NODE_ENV=development
```

## 🚀 Production Deployment

### Preparation
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Use production Stripe keys
4. Set secure JWT secrets
5. Configure proper CORS origins

### Build Frontend
```bash
cd client
npm run build
```

### Deploy Options
- **Backend**: Heroku, DigitalOcean, AWS
- **Frontend**: Netlify, Vercel, AWS S3
- **Database**: MongoDB Atlas (recommended)

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check the main [README.md](README.md) file
2. Search existing issues in the repository
3. Create a new issue with:
   - Your operating system
   - Node.js version
   - Error messages (full stack trace)
   - Steps to reproduce

---

Happy coding! 💕