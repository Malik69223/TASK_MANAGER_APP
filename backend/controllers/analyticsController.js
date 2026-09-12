const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// Helper to calculate productivity streak
const calculateStreak = (tasks, logs) => {
  if ((!tasks || tasks.length === 0) && (!logs || logs.length === 0)) return 0;

  const datesWithCompleted = new Set();
  
  if (logs) {
    logs.forEach((log) => {
      if (log.timestamp) {
        const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
        datesWithCompleted.add(dateStr);
      }
    });
  }

  if (tasks) {
    tasks.forEach((task) => {
      if (task.status === 'Completed' && task.completedAt) {
        const dateStr = new Date(task.completedAt).toISOString().split('T')[0];
        datesWithCompleted.add(dateStr);
      }
    });
  }

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
    const logs = await ActivityLog.find({ userId: req.user._id, action: 'complete' });
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

    // Need to also count tasks completed today in logs
    const completedTodaySet = new Set();
    logs.forEach(log => {
      if (new Date(log.timestamp).toISOString().split('T')[0] === todayStr && log.taskId) {
        completedTodaySet.add(log.taskId.toString());
      }
    });
    tasks.forEach(t => {
      if (t.status === 'Completed' && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === todayStr) {
        completedTodaySet.add(t._id.toString());
      }
    });

    const todayCompleted = completedTodaySet.size;
    const todayTotal = todayTasks.length;
    const dailyProductivityPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

    const productivityStreak = calculateStreak(tasks, logs);

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
    const logs = await ActivityLog.find({ userId: req.user._id, action: 'complete' });
    const weeklyData = [];
    const now = new Date();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let cumulativeCompleted = 0;
    let cumulativeTotal = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];

      const completedOnDate = new Set();
      logs.forEach(log => {
        if (new Date(log.timestamp).toISOString().split('T')[0] === dateStr && log.taskId) {
          completedOnDate.add(log.taskId.toString());
        }
      });
      tasks.forEach(t => {
        if (t.status === 'Completed' && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dateStr) {
          completedOnDate.add(t._id.toString());
        }
      });

      const completedCount = completedOnDate.size;

      const createdOrDueCount = tasks.filter(
        (t) => new Date(t.dueDate).toISOString().split('T')[0] === dateStr
      ).length;

      cumulativeCompleted += completedCount;
      cumulativeTotal += createdOrDueCount;

      const rate = cumulativeTotal > 0 ? Math.round((cumulativeCompleted / cumulativeTotal) * 100) : (cumulativeCompleted > 0 ? 100 : 0);

      weeklyData.push({
        day: dayName,
        date: dateStr,
        completed: cumulativeCompleted,
        total: Math.max(cumulativeTotal, cumulativeCompleted),
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
    const logs = await ActivityLog.find({ userId: req.user._id, action: 'complete' });
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateStr = d.toISOString().split('T')[0];

      const completedOnDate = new Set();
      logs.forEach(log => {
        if (new Date(log.timestamp).toISOString().split('T')[0] === dateStr && log.taskId) {
          completedOnDate.add(log.taskId.toString());
        }
      });
      tasks.forEach(t => {
        if (t.status === 'Completed' && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dateStr) {
          completedOnDate.add(t._id.toString());
        }
      });
      const completed = completedOnDate.size;

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
