const { sequelize } = require('../config/database');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Hotel = require('../models/Hotel');
const Cart = require('../models/Cart');

// Get database statistics - PUBLIC ENDPOINT
const getDatabaseStats = async (req, res) => {
  try {
    // PostgreSQL statistics
    const totalUsers = await User.count();
    const totalBookings = await Booking.count();
    const totalPayments = await Payment.count();

    // Get booking statistics
    const bookingStats = await Booking.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    // Get payment statistics
    const paymentStats = await Payment.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['status']
    });

    // MongoDB statistics
    const totalHotels = await Hotel.countDocuments();
    const totalCarts = await Cart.countDocuments();

    // Get hotels by destination
    const hotelsByDestination = await Hotel.aggregate([
      {
        $group: {
          _id: '$destination',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          avgMinPrice: { $avg: '$priceRange.min' },
          avgMaxPrice: { $avg: '$priceRange.max' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get featured hotels count
    const featuredHotels = await Hotel.countDocuments({ featured: true });

    // Get hotels by tags
    const hotelsByTags = await Hotel.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get room availability statistics
    const roomStats = await Hotel.aggregate([
      { $unwind: '$rooms' },
      {
        $group: {
          _id: '$rooms.type',
          totalRooms: { $sum: '$rooms.availability' },
          avgPrice: { $avg: '$rooms.price' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalRooms: -1 }
      }
    ]);

    // Get cart statistics
    const activeCarts = await Cart.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Response with all statistics
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        postgresql: {
          status: 'Connected',
          tables: {
            users: {
              total: totalUsers,
              details: 'User accounts with authentication'
            },
            bookings: {
              total: totalBookings,
              byStatus: bookingStats.map(s => ({
                status: s.status || 'pending',
                count: parseInt(s.dataValues.count)
              }))
            },
            payments: {
              total: totalPayments,
              byStatus: paymentStats.map(p => ({
                status: p.status,
                count: parseInt(p.dataValues.count),
                totalAmount: parseFloat(p.dataValues.totalAmount) || 0
              }))
            }
          }
        },
        mongodb: {
          status: 'Connected',
          collections: {
            hotels: {
              total: totalHotels,
              featured: featuredHotels,
              byDestination: hotelsByDestination.map(d => ({
                destination: d._id,
                count: d.count,
                avgRating: parseFloat(d.avgRating?.toFixed(2)) || 0,
                avgPriceRange: {
                  min: Math.round(d.avgMinPrice || 0),
                  max: Math.round(d.avgMaxPrice || 0)
                }
              })),
              byTags: hotelsByTags.slice(0, 10),
              roomTypes: roomStats.map(r => ({
                type: r._id,
                totalAvailable: r.totalRooms,
                avgPrice: Math.round(r.avgPrice || 0),
                count: r.count
              }))
            },
            carts: {
              total: totalCarts,
              activeLastWeek: activeCarts
            }
          }
        }
      },
      summary: {
        totalRecords: {
          postgresql: totalUsers + totalBookings + totalPayments,
          mongodb: totalHotels + totalCarts,
          overall: totalUsers + totalBookings + totalPayments + totalHotels + totalCarts
        },
        systemHealth: 'Operational',
        apiVersion: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch database statistics',
      details: error.message
    });
  }
};

// Get detailed hotel statistics - PUBLIC ENDPOINT
const getHotelStats = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .select('name destination rating reviewCount priceRange featured tags amenities rooms')
      .lean();

    const stats = {
      totalHotels: hotels.length,
      destinations: [...new Set(hotels.map(h => h.destination))].sort(),
      priceAnalysis: {
        lowest: Math.min(...hotels.map(h => h.priceRange.min)),
        highest: Math.max(...hotels.map(h => h.priceRange.max)),
        average: {
          min: Math.round(hotels.reduce((sum, h) => sum + h.priceRange.min, 0) / hotels.length),
          max: Math.round(hotels.reduce((sum, h) => sum + h.priceRange.max, 0) / hotels.length)
        }
      },
      ratingAnalysis: {
        highest: Math.max(...hotels.map(h => h.rating)),
        lowest: Math.min(...hotels.map(h => h.rating)),
        average: parseFloat((hotels.reduce((sum, h) => sum + h.rating, 0) / hotels.length).toFixed(2))
      },
      topRatedHotels: hotels
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(h => ({
          name: h.name,
          destination: h.destination,
          rating: h.rating,
          reviews: h.reviewCount
        })),
      mostReviewedHotels: hotels
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 5)
        .map(h => ({
          name: h.name,
          destination: h.destination,
          rating: h.rating,
          reviews: h.reviewCount
        })),
      amenitiesFrequency: {},
      tagsFrequency: {}
    };

    // Calculate amenities frequency
    hotels.forEach(h => {
      h.amenities.forEach(amenity => {
        stats.amenitiesFrequency[amenity] = (stats.amenitiesFrequency[amenity] || 0) + 1;
      });
      h.tags.forEach(tag => {
        stats.tagsFrequency[tag] = (stats.tagsFrequency[tag] || 0) + 1;
      });
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      statistics: stats,
      hotelList: hotels.map(h => ({
        name: h.name,
        destination: h.destination,
        rating: h.rating,
        priceRange: h.priceRange,
        roomsAvailable: h.rooms.reduce((sum, r) => sum + r.availability, 0),
        featured: h.featured
      }))
    });
  } catch (error) {
    console.error('Hotel stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel statistics',
      details: error.message
    });
  }
};

module.exports = {
  getDatabaseStats,
  getHotelStats
};