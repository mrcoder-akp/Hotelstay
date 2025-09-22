const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  hotelName: String,
  roomId: {
    type: String,
    required: true
  },
  roomName: String,
  roomType: String,
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

cartSchema.methods.calculateTotal = function() {
  this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
  return this.totalAmount;
};

cartSchema.methods.clearExpiredItems = function() {
  const now = new Date();
  this.items = this.items.filter(item => {
    const itemExpiry = new Date(item.addedAt.getTime() + 30 * 60 * 1000); // 30 minutes per item
    return itemExpiry > now;
  });
  this.calculateTotal();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;