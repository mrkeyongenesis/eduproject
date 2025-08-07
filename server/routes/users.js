const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   GET /api/users/browse
// @desc    Browse available users for dating
// @access  Private
router.get('/browse', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minAge').optional().isInt({ min: 18, max: 100 }),
  query('maxAge').optional().isInt({ min: 18, max: 100 }),
  query('maxDistance').optional().isInt({ min: 1, max: 500 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get current user to determine preferences
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Build query based on user preferences and filters
    const query = {
      _id: { $ne: currentUser._id }, // Exclude current user
      isActive: true,
      isVerified: true
    };

    // Gender preference matching
    if (currentUser.interestedIn !== 'both') {
      query.gender = currentUser.interestedIn;
    }

    // Age filtering
    const today = new Date();
    const minAge = req.query.minAge || (currentUser.ageRange?.min || 18);
    const maxAge = req.query.maxAge || (currentUser.ageRange?.max || 65);
    
    const maxBirthDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    const minBirthDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
    
    query.dateOfBirth = {
      $gte: minBirthDate,
      $lte: maxBirthDate
    };

    // Price filtering
    if (req.query.minPrice) {
      query.datePrice = { ...query.datePrice, $gte: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      query.datePrice = { ...query.datePrice, $lte: parseFloat(req.query.maxPrice) };
    }

    // Location filtering (simplified - in production, use geospatial queries)
    if (currentUser.location) {
      query['location.city'] = currentUser.location.city;
      query['location.state'] = currentUser.location.state;
    }

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -stripeCustomerId -email')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });

  } catch (error) {
    console.error('Browse users error:', error);
    res.status(500).json({
      message: 'Failed to browse users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -stripeCustomerId -email');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        message: 'User profile is not active'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile'
    });
  }
});

// @route   GET /api/users/:id/availability
// @desc    Get user's availability for booking
// @access  Private
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required'
      });
    }

    const user = await User.findById(req.params.id)
      .select('availability firstName lastName');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get existing bookings in the date range
    const existingBookings = await Booking.find({
      recipient: req.params.id,
      dateTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $in: ['pending', 'confirmed'] }
    }).select('dateTime duration');

    // Generate available time slots
    const availableSlots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      const dayAvailability = user.availability.find(av => av.dayOfWeek === dayOfWeek);

      if (dayAvailability && dayAvailability.timeSlots.length > 0) {
        dayAvailability.timeSlots.forEach(slot => {
          const slotStart = new Date(date);
          const [startHour, startMinute] = slot.start.split(':');
          slotStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

          const slotEnd = new Date(date);
          const [endHour, endMinute] = slot.end.split(':');
          slotEnd.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

          // Check if slot is not booked
          const isBooked = existingBookings.some(booking => {
            const bookingStart = new Date(booking.dateTime);
            const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
            
            return (slotStart < bookingEnd && slotEnd > bookingStart);
          });

          if (!isBooked && slotStart > new Date()) { // Only future slots
            availableSlots.push({
              date: date.toISOString().split('T')[0],
              startTime: slot.start,
              endTime: slot.end,
              available: true
            });
          }
        });
      }
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      },
      availableSlots,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      message: 'Failed to get availability'
    });
  }
});

// @route   PUT /api/users/availability
// @desc    Update user's availability
// @access  Private
router.put('/availability', auth, [
  body('availability').isArray(),
  body('availability.*.dayOfWeek').isInt({ min: 0, max: 6 }),
  body('availability.*.timeSlots').isArray(),
  body('availability.*.timeSlots.*.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('availability.*.timeSlots.*.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { availability } = req.body;

    // Validate time slots don't overlap and start < end
    for (const dayAvail of availability) {
      for (const slot of dayAvail.timeSlots) {
        const [startHour, startMin] = slot.start.split(':').map(Number);
        const [endHour, endMin] = slot.end.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (startMinutes >= endMinutes) {
          return res.status(400).json({
            message: 'Start time must be before end time'
          });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { availability },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Availability updated successfully',
      availability: user.availability
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      message: 'Failed to update availability'
    });
  }
});

module.exports = router;