const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['single', 'double', 'suite', 'deluxe', 'presidential', 'villa'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  amenities: [String],
  images: [String],
  availability: {
    type: Number,
    default: 10
  },
  description: String,
  size: String,
  bedType: String
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  destination: {
    type: String,
    required: true,
    index: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  amenities: [String],
  images: [String],
  rooms: [roomSchema],
  policies: {
    checkInTime: String,
    checkOutTime: String,
    cancellation: String,
    childPolicy: String,
    petPolicy: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  priceRange: {
    min: Number,
    max: Number
  },
  tags: [String]
}, {
  timestamps: true
});

hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ destination: 'text', name: 'text' });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;