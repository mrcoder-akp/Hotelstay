const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Cart = require('../models/Cart');
const { sequelize } = require('../config/database');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId: req.user.id,
        status: 'pending'
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${booking.bookingReference}`,
      notes: {
        bookingId: booking.id,
        userId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      bookingId: booking.id,
      userId: req.user.id,
      amount,
      paymentMethod: 'razorpay',
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    // Find all payments with this Razorpay order ID
    const payments = await Payment.findAll({
      where: {
        razorpayOrderId: razorpay_order_id,
        userId: req.user.id
      }
    });

    if (!payments || payments.length === 0) {
      // Fallback to single payment ID if provided
      if (paymentId) {
        const payment = await Payment.findByPk(paymentId);
        if (payment) {
          payments.push(payment);
        }
      }

      if (payments.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }
    }

    // Update all payment records
    for (const payment of payments) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'completed';
      payment.transactionId = razorpay_payment_id;
      await payment.save({ transaction: t });

      // Update corresponding booking status
      const booking = await Booking.findByPk(payment.bookingId);
      if (booking) {
        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        await booking.save({ transaction: t });
      }
    }

    await t.commit();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      bookingCount: payments.length,
      bookings: payments.map(p => ({
        bookingId: p.bookingId,
        amount: p.amount
      }))
    });
  } catch (error) {
    await t.rollback();
    console.error('Payment verification error:', error);
    next(error);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      where: {
        id: paymentId,
        userId: req.user.id
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

const refundPayment = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { paymentId, reason } = req.body;

    const payment = await Payment.findOne({
      where: {
        id: paymentId,
        userId: req.user.id,
        status: 'completed'
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Process refund through Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(payment.amount * 100),
      notes: { reason }
    });

    // Update payment status
    payment.status = 'refunded';
    payment.metadata = {
      ...payment.metadata,
      refundId: refund.id,
      refundReason: reason,
      refundedAt: new Date()
    };
    await payment.save({ transaction: t });

    // Update booking status
    const booking = await Booking.findByPk(payment.bookingId);
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refund.id
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const checkout = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { cartItemIds, customerInfo, specialRequests, totalAmount, amountInPaise, subtotal, taxes, discount, promoCode } = req.body;
    console.log('Checkout request:', req.body);
    console.log('Total amount from frontend (with GST):', totalAmount);
    console.log('Amount in paise:', amountInPaise)
    // Find user's cart from MongoDB
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // If no specific items selected, use all cart items
    const selectedItems = cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0
      ? cart.items.filter(item => {
          const itemId = item._id ? item._id.toString() : item.id;
          return cartItemIds.includes(itemId);
        })
      : cart.items;

    if (selectedItems.length === 0) {
      return res.status(400).json({ error: 'No valid items selected' });
    }

    const bookings = [];

    // CRITICAL: Use amounts from frontend which already include GST calculations
    let finalTotalAmount = 0;
    let itemsSubtotal = 0;

    // Priority 1: Use explicit values from frontend
    if (totalAmount && totalAmount > 0) {
      finalTotalAmount = totalAmount; // This already includes GST from frontend
      console.log('✅ Using frontend totalAmount (includes GST):', finalTotalAmount);
      console.log('   - Frontend subtotal:', subtotal);
      console.log('   - Frontend taxes (GST):', taxes);
      console.log('   - Frontend discount:', discount);
    } else {
      // Fallback: Calculate from cart items
      for (const item of selectedItems) {
        itemsSubtotal += parseFloat(item.totalPrice || item.price || 0);
      }

      // Add 18% GST
      const calculatedTaxes = itemsSubtotal * 0.18;
      finalTotalAmount = itemsSubtotal + calculatedTaxes;

      console.log('⚠️ Fallback calculation:');
      console.log('   - Calculated subtotal:', itemsSubtotal);
      console.log('   - Calculated GST (18%):', calculatedTaxes);
      console.log('   - Total with GST:', finalTotalAmount);
    }

    // Calculate items subtotal for proportional distribution
    if (itemsSubtotal === 0) {
      for (const item of selectedItems) {
        itemsSubtotal += parseFloat(item.totalPrice || item.price || 0);
      }
    }

    // For booking records, calculate proportional amounts
    const gstMultiplier = itemsSubtotal > 0 ? finalTotalAmount / itemsSubtotal : 1.18;
    console.log('GST Multiplier for items:', gstMultiplier);

    // Create bookings for each item in PostgreSQL
    for (const item of selectedItems) {
      // Calculate this item's amount including its proportional share of GST
      const itemBaseAmount = parseFloat(item.totalPrice || item.price || 0);
      const itemTotalWithGST = itemBaseAmount * gstMultiplier;

      const booking = await Booking.create({
        userId: req.user.id,
        hotelId: item.hotelId ? item.hotelId.toString() : item.hotelId,
        roomType: item.roomType || 'Standard',
        checkInDate: item.checkInDate,
        checkOutDate: item.checkOutDate,
        numberOfRooms: item.rooms || 1,
        numberOfGuests: item.guests || 2,
        totalAmount: Math.round(itemTotalWithGST * 100) / 100, // Store amount with GST
        specialRequests: specialRequests || '',
        status: 'pending',
        paymentStatus: 'pending'
      }, { transaction: t });

      bookings.push(booking);
    }

    // CRITICAL FIX: Always ensure GST is included in Razorpay amount
    let razorpayAmount;

    // The frontend sends the correct total with GST
    if (totalAmount && totalAmount > 0) {
      // Convert to paise for Razorpay
      razorpayAmount = Math.round(totalAmount * 100);
      console.log('✅ RAZORPAY AMOUNT CALCULATION:');
      console.log('   - Total from frontend (with GST): ₹', totalAmount);
      console.log('   - Amount in paise for Razorpay:', razorpayAmount);
      console.log('   - This amount INCLUDES 18% GST');
    } else {
      // Fallback calculation ensuring GST is added
      razorpayAmount = Math.round(finalTotalAmount * 100);
      console.log('⚠️ RAZORPAY FALLBACK CALCULATION:');
      console.log('   - Calculated total (with GST): ₹', finalTotalAmount);
      console.log('   - Amount in paise:', razorpayAmount);
    }

    // Verify the amount is correct
    console.log('====================================');
    console.log('FINAL RAZORPAY PAYMENT DETAILS:');
    console.log('Amount in Paise:', razorpayAmount);
    console.log('Amount in Rupees: ₹', razorpayAmount / 100);
    console.log('====================================');

    const options = {
      amount: razorpayAmount, // Amount in paise including GST
      currency: 'INR',
      receipt: `checkout_${Date.now()}`,
      notes: {
        userId: req.user.id,
        bookingCount: bookings.length,
        customerName: `${customerInfo?.firstName} ${customerInfo?.lastName}`,
        customerEmail: customerInfo?.email,
        amount: razorpayAmount || 'N/A',
        subtotal: subtotal || 'N/A',
        taxes: taxes || 'N/A',
        discount: discount || 0,
        promoCode: promoCode || 'None',
        totalWithGST: finalTotalAmount
      }
    };

    console.log('Creating Razorpay order with amount (in paise):', options.amount);

    const order = await razorpay.orders.create(options);

    // Create payment records for each booking
    const payments = [];
    for (const booking of bookings) {
      const payment = await Payment.create({
        bookingId: booking.id,
        userId: req.user.id,
        amount: booking.totalAmount,
        paymentMethod: 'razorpay',
        razorpayOrderId: order.id,
        status: 'pending'
      }, { transaction: t });
      payments.push(payment);
    }

    // Clear selected items from MongoDB cart
    if (cartItemIds && cartItemIds.length > 0) {
      cart.items = cart.items.filter(item => {
        const itemId = item._id ? item._id.toString() : item.id;
        return !cartItemIds.includes(itemId);
      });
    } else {
      cart.items = [];
    }
    cart.calculateTotal();
    await cart.save();

    await t.commit();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount, // This is in paise and includes GST
      amountInRupees: order.amount / 100, // Amount in rupees for clarity
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      bookings: bookings.map(b => ({
        id: b.id,
        reference: b.bookingReference,
        amount: b.totalAmount // Amount with GST for each booking
      })),
      paymentId: payments[0]?.id, // Return first payment ID for verification
      totalWithGST: finalTotalAmount // Total amount in rupees with GST
    });
  } catch (error) {
    await t.rollback();
    console.error('Checkout error:', error);
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  checkout
};