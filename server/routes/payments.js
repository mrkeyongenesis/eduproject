const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for date booking
// @access  Private
router.post('/create-payment-intent', auth, [
  body('recipientId').isMongoId(),
  body('amount').isFloat({ min: 10 }),
  body('dateTime').isISO8601(),
  body('duration').optional().isInt({ min: 30, max: 480 }) // 30 min to 8 hours
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recipientId, amount, dateTime, duration = 120, location, requestMessage } = req.body;
    const requesterId = req.user.userId;

    // Validate users exist
    const [requester, recipient] = await Promise.all([
      User.findById(requesterId),
      User.findById(recipientId)
    ]);

    if (!requester || !recipient) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!recipient.isActive) {
      return res.status(400).json({
        message: 'This user is not currently accepting dates'
      });
    }

    // Validate amount matches recipient's price
    if (amount !== recipient.datePrice) {
      return res.status(400).json({
        message: 'Amount does not match the recipient\'s date price'
      });
    }

    // Check for existing booking at the same time
    const existingBooking = await Booking.findOne({
      recipient: recipientId,
      dateTime: new Date(dateTime),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'This time slot is already booked'
      });
    }

    // Create Stripe customer if doesn't exist
    if (!requester.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: requester.email,
        name: `${requester.firstName} ${requester.lastName}`,
        metadata: {
          userId: requester._id.toString()
        }
      });

      requester.stripeCustomerId = customer.id;
      await requester.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: requester.stripeCustomerId,
      metadata: {
        requesterId: requesterId,
        recipientId: recipientId,
        dateTime: dateTime,
        duration: duration.toString(),
        type: 'date_booking'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create booking record
    const booking = new Booking({
      requester: requesterId,
      recipient: recipientId,
      dateTime: new Date(dateTime),
      duration,
      location,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      requestMessage,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking._id,
      amount: amount
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent'
    });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and update booking
// @access  Private
router.post('/confirm-payment', auth, [
  body('paymentIntentId').notEmpty(),
  body('bookingId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentIntentId, bookingId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        message: 'Payment not completed'
      });
    }

    // Update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    if (booking.requester.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Unauthorized to confirm this payment'
      });
    }

    booking.paymentStatus = 'succeeded';
    await booking.save();

    // Populate booking details for response
    await booking.populate([
      { path: 'requester', select: 'firstName lastName profileImage' },
      { path: 'recipient', select: 'firstName lastName profileImage' }
    ]);

    res.json({
      message: 'Payment confirmed successfully',
      booking
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      message: 'Failed to confirm payment'
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund for canceled booking
// @access  Private
router.post('/refund', auth, [
  body('bookingId').isMongoId(),
  body('reason').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId, reason } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId);
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
        message: 'Unauthorized to refund this booking'
      });
    }

    // Check if booking can be refunded
    if (!booking.canCancel) {
      return res.status(400).json({
        message: 'Booking cannot be canceled (less than 24 hours notice)'
      });
    }

    if (booking.paymentStatus !== 'succeeded') {
      return res.status(400).json({
        message: 'No successful payment to refund'
      });
    }

    // Calculate refund amount (full refund if canceled more than 24 hours in advance)
    const hoursUntilDate = (new Date(booking.dateTime) - new Date()) / (1000 * 60 * 60);
    const refundPercentage = hoursUntilDate >= 24 ? 1.0 : 0.5; // 50% if less than 24 hours
    const refundAmount = Math.round(booking.amount * refundPercentage * 100); // in cents

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        bookingId: bookingId,
        canceledBy: userId,
        originalAmount: (booking.amount * 100).toString()
      }
    });

    // Update booking
    booking.status = 'canceled';
    booking.paymentStatus = 'refunded';
    booking.canceledBy = userId;
    booking.cancellationReason = reason;
    booking.refundAmount = refundAmount / 100; // convert back to dollars

    await booking.save();

    res.json({
      message: 'Refund processed successfully',
      refundAmount: refundAmount / 100,
      refundId: refund.id
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      message: 'Failed to process refund'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update booking payment status
        await Booking.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { paymentStatus: 'succeeded' }
        );
        
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        // Update booking payment status
        await Booking.findOneAndUpdate(
          { stripePaymentIntentId: failedPayment.id },
          { paymentStatus: 'failed' }
        );
        
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;