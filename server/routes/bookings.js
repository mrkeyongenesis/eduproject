const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', auth, [
  query('status').optional().isIn(['pending', 'confirmed', 'rejected', 'completed', 'canceled']),
  query('type').optional().isIn(['sent', 'received', 'all']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { status, type = 'all', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    switch (type) {
      case 'sent':
        query.requester = userId;
        break;
      case 'received':
        query.recipient = userId;
        break;
      default: // 'all'
        query = {
          $or: [
            { requester: userId },
            { recipient: userId }
          ]
        };
    }

    if (status) {
      query.status = status;
    }

    // Execute query
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('requester', 'firstName lastName profileImage')
        .populate('recipient', 'firstName lastName profileImage')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Booking.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      message: 'Failed to get bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('requester', 'firstName lastName profileImage email')
      .populate('recipient', 'firstName lastName profileImage email');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    const userId = req.user.userId;
    const isAuthorized = booking.requester._id.toString() === userId || 
                        booking.recipient._id.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        message: 'Unauthorized to view this booking'
      });
    }

    res.json({ booking });

  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      message: 'Failed to get booking details'
    });
  }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm a booking request
// @access  Private
router.put('/:id/confirm', auth, [
  body('responseMessage').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { responseMessage } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findById(req.params.id)
      .populate('requester', 'firstName lastName email')
      .populate('recipient', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Only recipient can confirm
    if (booking.recipient._id.toString() !== userId) {
      return res.status(403).json({
        message: 'Only the recipient can confirm this booking'
      });
    }

    // Check if booking is in pending status and payment succeeded
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: 'Booking is not in pending status'
      });
    }

    if (booking.paymentStatus !== 'succeeded') {
      return res.status(400).json({
        message: 'Payment has not been completed'
      });
    }

    // Check if the booking is not in the past
    if (new Date(booking.dateTime) < new Date()) {
      return res.status(400).json({
        message: 'Cannot confirm a booking in the past'
      });
    }

    // Update booking
    booking.status = 'confirmed';
    booking.responseMessage = responseMessage;
    await booking.save();

    // Update user stats
    await Promise.all([
      User.findByIdAndUpdate(booking.requester._id, { $inc: { totalDates: 1 } }),
      User.findByIdAndUpdate(booking.recipient._id, { $inc: { totalDates: 1 } })
    ]);

    res.json({
      message: 'Booking confirmed successfully',
      booking
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      message: 'Failed to confirm booking'
    });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject a booking request
// @access  Private
router.put('/:id/reject', auth, [
  body('responseMessage').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { responseMessage } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Only recipient can reject
    if (booking.recipient.toString() !== userId) {
      return res.status(403).json({
        message: 'Only the recipient can reject this booking'
      });
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: 'Booking is not in pending status'
      });
    }

    // Update booking
    booking.status = 'rejected';
    booking.responseMessage = responseMessage;
    await booking.save();

    res.json({
      message: 'Booking rejected successfully',
      booking
    });

  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      message: 'Failed to reject booking'
    });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark booking as completed
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Check if user is authorized (either requester or recipient)
    const isAuthorized = booking.requester.toString() === userId || 
                        booking.recipient.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        message: 'Unauthorized to complete this booking'
      });
    }

    // Check if booking is confirmed and the date has passed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        message: 'Only confirmed bookings can be completed'
      });
    }

    const bookingEndTime = new Date(booking.dateTime.getTime() + booking.duration * 60000);
    if (new Date() < bookingEndTime) {
      return res.status(400).json({
        message: 'Booking cannot be completed before the scheduled end time'
      });
    }

    // Update booking
    booking.status = 'completed';
    await booking.save();

    await booking.populate([
      { path: 'requester', select: 'firstName lastName profileImage' },
      { path: 'recipient', select: 'firstName lastName profileImage' }
    ]);

    res.json({
      message: 'Booking completed successfully',
      booking
    });

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      message: 'Failed to complete booking'
    });
  }
});

// @route   POST /api/bookings/:id/review
// @desc    Add review for completed booking
// @access  Private
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Check if user is authorized (either requester or recipient)
    const isAuthorized = booking.requester.toString() === userId || 
                        booking.recipient.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        message: 'Unauthorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        message: 'Only completed bookings can be reviewed'
      });
    }

    // Check if user has already reviewed
    const existingReview = booking.reviews.find(
      review => review.reviewer.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this booking'
      });
    }

    // Add review
    booking.reviews.push({
      reviewer: userId,
      rating,
      comment
    });

    await booking.save();

    // Update the other user's rating
    const otherUserId = booking.requester.toString() === userId ? 
                       booking.recipient : booking.requester;

    const otherUser = await User.findById(otherUserId);
    const newRatingCount = otherUser.rating.count + 1;
    const newRatingSum = (otherUser.rating.average * otherUser.rating.count) + rating;
    const newRatingAverage = newRatingSum / newRatingCount;

    await User.findByIdAndUpdate(otherUserId, {
      'rating.average': Math.round(newRatingAverage * 10) / 10, // Round to 1 decimal
      'rating.count': newRatingCount
    });

    res.json({
      message: 'Review added successfully',
      review: booking.reviews[booking.reviews.length - 1]
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      message: 'Failed to add review'
    });
  }
});

module.exports = router;