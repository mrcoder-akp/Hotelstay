const express = require('express');
const router = express.Router();
const { getDatabaseStats, getHotelStats } = require('../controllers/stats.controller');

// PUBLIC ROUTES - No authentication required
// Get database statistics
router.get('/database', getDatabaseStats);

// Get detailed hotel statistics
router.get('/hotels', getHotelStats);

module.exports = router;