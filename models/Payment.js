const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Bookings',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    unique: true
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    unique: true
  },
  razorpaySignature: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true
});

module.exports = Payment;