const Task = require('../models/Task');

// Helper to calculate productivity streak
const calculateStreak = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  const datesWithCompleted = new Set();
  tasks.forEach((task) => {
    if (task.status === 'Completed' && task.completedAt) {
      const dateStr = new Date(task.completedAt).toISOString().split('T')[0];
      datesWithCompleted.add(dateStr);
    }
  });

  if (datesWithCompleted.size === 0) return 0;

  let streak = 0;
  const today = new Date();
  const currentDate = new Date(today);

  // Check if today or yesterday has a completion to start counting
  const todayStr = currentDate.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!datesWithCompleted.has(todayStr) && !datesWithCompleted.has(yesterdayStr)) {
    return 0;
  }

  // Count backwards consecutive days
  if (!datesWithCompleted.has(todayStr)) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dStr = currentDate.toISOString().split('T')[0];
    if (datesWithCompleted.has(dStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// @desc    Get dashboard metrics & statistics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    const now = new Date();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
    const overdueTasks = tasks.filter((t) => {
      if (t.status !== 'Pending' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);
      return now > due;
    }).length;

    // Daily productivity percentage calculation
    const todayStr = now.toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => {
      const taskDue = new Date(t.dueDate).toISOString().split('T')[0];
      const taskComp = t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : null;
      return taskDue === todayStr || taskComp === todayStr;
    });

    const todayCompleted = todayTasks.filter((t) => t.status === 'Completed').length;
    const todayTotal = todayTasks.length;
    const dailyProductivityPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

    const productivityStreak = calculateStreak(tasks);

    return res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        dailyProductivityPercentage,
        productivityStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly productivity breakdown (last 7 days)
// @route   GET /api/analytics/weekly
// @access  Private
const getWeeklyAnalytics = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    const weeklyData = [];
    const now = new Date();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];

      const completedCount = tasks.filter(
        (t) => t.status === 'Completed' && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dateStr
      ).length;

      const createdOrDueCount = tasks.filter(
        (t) => new Date(t.dueDate).toISOString().split('T')[0] === dateStr
      ).length;

      const rate = createdOrDueCount > 0 ? Math.round((completedCount / createdOrDueCount) * 100) : (completedCount > 0 ? 100 : 0);

      weeklyData.push({
        day: dayName,
        date: dateStr,
        completed: completedCount,
        total: Math.max(createdOrDueCount, completedCount),
        rate: Math.min(rate, 100),
      });
    }

    return res.status(200).json({
      success: true,
      data: weeklyData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly productivity breakdown
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateStr = d.toISOString().split('T')[0];

      const completed = tasks.filter(
        (t) => t.status === 'Completed' && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dateStr
      ).length;

      const pending = tasks.filter(
        (t) => t.status === 'Pending' && new Date(t.dueDate).toISOString().split('T')[0] === dateStr
      ).length;

      monthlyData.push({
        day: `Day ${day}`,
        date: dateStr,
        completed,
        pending,
        total: completed + pending,
      });
    }

    return res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
};
