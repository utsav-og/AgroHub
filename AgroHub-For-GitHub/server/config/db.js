const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses MONGO_URI from .env with fallback to local 127.0.0.1
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrohub';
    
    // Connection event listeners for proactive error detection
    mongoose.connection.on('connected', () => {
      console.log('[AgroHub Database] Mongoose connection event: connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[AgroHub Database] Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[AgroHub Database] Mongoose connection event: disconnected');
    });

    const conn = await mongoose.connect(mongoUri);
    console.log(`[AgroHub Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[AgroHub Database] Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
