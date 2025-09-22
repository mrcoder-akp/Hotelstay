const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  checkout
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All payment routes require authentication

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/:paymentId', getPaymentDetails);
router.post('/refund', refundPayment);
router.post('/checkout', checkout);

module.exports = router;