const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Profile Info
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  interestedIn: {
    type: String,
    enum: ['male', 'female', 'both'],
    required: true
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  
  // Preferences
  ageRange: {
    min: { type: Number, min: 18, max: 100 },
    max: { type: Number, min: 18, max: 100 }
  },
  maxDistance: {
    type: Number,
    default: 25 // miles
  },
  
  // Profile Details
  bio: {
    type: String,
    maxlength: 500
  },
  interests: [{
    type: String,
    trim: true
  }],
  profileImage: {
    type: String, // URL to image
    default: ''
  },
  
  // Availability
  availability: [{
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6
    },
    timeSlots: [{
      start: String, // "09:00"
      end: String    // "17:00"
    }]
  }],
  
  // Pricing
  datePrice: {
    type: Number,
    required: true,
    min: 10 // minimum $10
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Stripe
  stripeCustomerId: {
    type: String,
    default: ''
  },
  
  // Stats
  totalDates: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ location: 1 });
userSchema.index({ gender: 1, interestedIn: 1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get age from date of birth
userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);