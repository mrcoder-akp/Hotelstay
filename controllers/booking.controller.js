const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Cart = require('../models/Cart');
const { sequelize } = require('../config/database');

const createBooking = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const {
      hotelId,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfRooms = 1,
      numberOfGuests = 2,
      specialRequests,
      totalAmount
    } = req.body;

    // Verify hotel and room availability
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const room = hotel.rooms.find(r => r.type === roomType);
    if (!room) {
      return res.status(404).json({ error: 'Room type not found' });
    }

    if (room.available < numberOfRooms) {
      return res.status(400).json({
        error: 'Not enough rooms available',
        available: room.available,
        requested: numberOfRooms
      });
    }

    // Create booking in PostgreSQL
    const booking = await Booking.create({
      userId: req.user.id,
      hotelId: hotelId,
      roomType: roomType,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfRooms: numberOfRooms,
      numberOfGuests: numberOfGuests,
      totalAmount: totalAmount || (room.price * numberOfRooms),
      specialRequests,
      status: 'pending',
      bookingReference: 'BKG' + Date.now()
    }, { transaction: t });

    // Update room availability in MongoDB
    room.available -= numberOfRooms;
    await hotel.save();

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const bookings = await Booking.findAndCountAll({
      where,
      limit: limit * 1,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

 
    // Fetch hotel details for each booking
    const bookingsWithHotels = await Promise.all(
      bookings.rows.map(async (booking) => {
        const hotel = await Hotel.findById(booking.hotelId)
          .select('name location images rating basePrice rooms');
        return {
          ...booking.toJSON(),
          hotel: hotel ? hotel.toObject() : null
        };
      })
    );

    res.json({
      success: true,
      data: bookingsWithHotels,
      totalPages: Math.ceil(bookings.count / limit),
      currentPage: page,
      total: bookings.count
    });
  } catch (error) {
    console.log(error,"error")
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const hotel = await Hotel.findById(booking.hotelId);

    res.json({
      success: true,
      data: {
        ...booking.toJSON(),
        hotel: hotel ? hotel.toObject() : null
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        error: `Cannot update ${booking.status} booking`
      });
    }

    booking.status = status;
    await booking.save();

    // If cancelled, restore room availability
    if (status === 'cancelled') {
      const hotel = await Hotel.findById(booking.hotelId);
      const room = hotel.rooms.find(r => r.type === booking.roomType);
      if (room) {
        room.available += booking.numberOfRooms || 1;
        await hotel.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        error: `Cannot cancel ${booking.status} booking`
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Restore room availability
    const hotel = await Hotel.findById(booking.hotelId);
    const room = hotel.rooms.find(r => r.type === booking.roomType);
    if (room) {
      room.available += booking.numberOfRooms || 1;
      await hotel.save();
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};