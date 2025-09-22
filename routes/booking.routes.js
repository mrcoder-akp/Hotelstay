const express = require('express');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All booking routes require authentication

router.post('/create', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/cancel', cancelBooking);

module.exports = router;