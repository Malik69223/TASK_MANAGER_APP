const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All analytics routes protected

router.get('/dashboard', getDashboardAnalytics);
router.get('/weekly', getWeeklyAnalytics);
router.get('/monthly', getMonthlyAnalytics);

module.exports = router;
