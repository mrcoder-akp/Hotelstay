const Cart = require('../models/Cart');
const Hotel = require('../models/Hotel');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
        totalAmount: 0
      });
    }

    cart.clearExpiredItems();
    await cart.save();

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { hotelId, roomId, checkInDate, checkOutDate, guests } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const room = hotel.rooms.find(r => r.roomId === roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.capacity < guests) {
      return res.status(400).json({ error: 'Room capacity exceeded' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: []
      });
    }

    // Calculate nights and total price
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.hotelId.toString() === hotelId &&
              item.roomId === roomId &&
              item.checkInDate.getTime() === checkIn.getTime()
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].guests = guests;
      cart.items[existingItemIndex].totalPrice = totalPrice;
    } else {
      // Add new item
      cart.items.push({
        hotelId,
        hotelName: hotel.name,
        roomId,
        roomName: room.name,
        roomType: room.type,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        price: room.price,
        nights,
        totalPrice
      });
    }

    cart.calculateTotal();
    await cart.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.calculateTotal();
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { guests } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.find(item => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Validate room capacity
    const hotel = await Hotel.findById(item.hotelId);
    const room = hotel.rooms.find(r => r.roomId === item.roomId);

    if (room.capacity < guests) {
      return res.status(400).json({ error: 'Room capacity exceeded' });
    }

    item.guests = guests;
    cart.calculateTotal();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
};