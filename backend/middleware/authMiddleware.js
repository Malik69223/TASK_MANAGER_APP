const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Find the default single user
    let defaultUser = await User.findOne({ email: 'default@personal.app' });
    
    // If it doesn't exist, create it once
    if (!defaultUser) {
      defaultUser = await User.create({
        name: 'Personal User',
        email: 'default@personal.app',
        password: 'no_password_needed_for_single_user_mode',
      });
    }

    // Inject the user into the request so all controllers work perfectly
    req.user = defaultUser;
    
    return next();
  } catch (error) {
    console.error('Auth bypass error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching default user.',
    });
  }
};

module.exports = { protect };
