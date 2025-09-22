const Hotel = require('../models/Hotel');

const getHotels = async (req, res, next) => {
  try {
    const { destination, checkin, checkout, guests, page = 1, limit = 10, sort = 'rating', minPrice, maxPrice } = req.query;

    const query = {};

    if (destination) {
      query.$or = [
        { destination: new RegExp(destination, 'i') },
        { 'address.city': new RegExp(destination, 'i') }
      ];
    }

    if (minPrice || maxPrice) {
      query['priceRange.min'] = {};
      if (minPrice) query['priceRange.min'].$gte = Number(minPrice);
      if (maxPrice) query['priceRange.max'] = { $lte: Number(maxPrice) };
    }

    query.active = true;

    const sortOptions = {
      rating: { rating: -1 },
      price_low: { 'priceRange.min': 1 },
      price_high: { 'priceRange.max': -1 },
      name: { name: 1 }
    };

    const hotels = await Hotel.find(query)
      .sort(sortOptions[sort] || sortOptions.rating)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await Hotel.countDocuments(query);

    // Filter available rooms based on dates and guests
    if (checkin && checkout && guests) {
      hotels.forEach(hotel => {
        hotel.rooms = hotel.rooms.filter(room =>
          room.capacity >= guests && room.availability > 0
        );
      });
    }

    res.json({
      success: true,
      data: hotels,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkin, checkout, guests } = req.query;

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Filter available rooms if dates and guests provided
    if (checkin && checkout && guests) {
      const hotelData = hotel.toObject();
      hotelData.rooms = hotelData.rooms.filter(room =>
        room.capacity >= guests && room.availability > 0
      );
      return res.json({
        success: true,
        data: hotelData
      });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

const searchHotels = async (req, res, next) => {
  try {
    const { query, location, radius = 10 } = req.body;

    let searchQuery = { active: true };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (location && location.lat && location.lng) {
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    const hotels = await Hotel.find(searchQuery)
      .select('name destination rating priceRange images amenities')
      .limit(20);

    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ featured: true, active: true })
      .select('name destination rating priceRange images')
      .limit(8);

    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotels,
  getHotelById,
  searchHotels,
  getFeaturedHotels
};