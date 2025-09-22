const express = require('express');
const {
  getHotels,
  getHotelById,
  searchHotels,
  getFeaturedHotels
} = require('../controllers/hotel.controller');

const router = express.Router();

router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.post('/search', searchHotels);
router.get('/:id', getHotelById);

module.exports = router;