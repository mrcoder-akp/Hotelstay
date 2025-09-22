const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

// PostgreSQL connection - only initialize if URL is provided
let sequelize = null;
if (process.env.POSTGRES_URL) {
  sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// MongoDB connection
const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.warn('MongoDB URL not provided, skipping MongoDB connection');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Only exit in development, not in production/serverless
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

// Connect to both databases
const connectDB = async () => {
  try {
    // Check if database URLs are provided
    if (!process.env.POSTGRES_URL && !process.env.MONGODB_URL) {
      console.warn('No database URLs provided. Running without database connections.');
      return;
    }

    // Test PostgreSQL connection
    if (sequelize) {
      await sequelize.authenticate();
      console.log('PostgreSQL connected successfully');

      // Sync PostgreSQL models
      await sequelize.sync({ force: false });
      console.log('PostgreSQL models synced');
    }

    // Connect to MongoDB
    await connectMongoDB();
  } catch (error) {
    console.error('Database connection error:', error);
    // Only exit in development, not in production/serverless
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;