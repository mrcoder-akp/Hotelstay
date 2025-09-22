const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hotelId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roomType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Standard'
  },
  checkInDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  checkOutDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  numberOfRooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  numberOfGuests: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    validate: {
      min: 1
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bookingReference: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (booking) => {
      booking.bookingReference = 'BKG' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  }
});

module.exports = Booking;