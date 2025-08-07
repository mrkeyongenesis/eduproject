const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Participants
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Date Details
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 120 // 2 hours default
  },
  location: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Pricing
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  
  // Payment Info
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'],
    default: 'pending'
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'canceled'],
    default: 'pending'
  },
  
  // Messages
  requestMessage: {
    type: String,
    maxlength: 500
  },
  responseMessage: {
    type: String,
    maxlength: 500
  },
  
  // Confirmation
  confirmedAt: Date,
  rejectedAt: Date,
  canceledAt: Date,
  completedAt: Date,
  
  // Cancellation
  canceledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  refundAmount: Number,
  
  // Reviews (after completion)
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ requester: 1, createdAt: -1 });
bookingSchema.index({ recipient: 1, createdAt: -1 });
bookingSchema.index({ dateTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ stripePaymentIntentId: 1 });

// Virtual for total duration in hours
bookingSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Check if booking is in the past
bookingSchema.virtual('isPast').get(function() {
  return new Date() > this.dateTime;
});

// Check if booking can be canceled (at least 24 hours before)
bookingSchema.virtual('canCancel').get(function() {
  const now = new Date();
  const bookingTime = new Date(this.dateTime);
  const hoursDifference = (bookingTime - now) / (1000 * 60 * 60);
  
  return hoursDifference >= 24 && 
         ['pending', 'confirmed'].includes(this.status);
});

// Pre-save middleware to set confirmation timestamp
bookingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'rejected':
        if (!this.rejectedAt) this.rejectedAt = now;
        break;
      case 'canceled':
        if (!this.canceledAt) this.canceledAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
    }
  }
  next();
});

// Static method to find user's bookings
bookingSchema.statics.findUserBookings = function(userId, options = {}) {
  const query = {
    $or: [
      { requester: userId },
      { recipient: userId }
    ]
  };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.dateRange) {
    query.dateTime = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  return this.find(query)
    .populate('requester', 'firstName lastName profileImage')
    .populate('recipient', 'firstName lastName profileImage')
    .sort({ dateTime: -1 });
};

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);