const app = require('../backend/app');
const connectDB = require('../backend/config/db');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  let dbError = null;
  
  if (req.url === '/api/debug') {
    return res.status(200).json({
      envExists: !!process.env.MONGODB_URI,
      envStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) : null,
      readyState: mongoose.connection.readyState,
    });
  }

  // Check if we have a connection to the database or if it's currently connecting
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    try {
      await connectDB();
    } catch (e) {
      dbError = e.message;
    }
  }
  
  return app(req, res);
};
