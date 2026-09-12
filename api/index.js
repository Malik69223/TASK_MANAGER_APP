const app = require('../backend/app');
const connectDB = require('../backend/config/db');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  // Check if we have a connection to the database or if it's currently connecting
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  
  // Pass the request to the Express app
  return app(req, res);
};
