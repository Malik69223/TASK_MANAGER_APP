import React, { createContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { categoryService } from '../services/categoryService';
import { analyticsService } from '../services/analyticsService';
import { usePWA } from '../hooks/usePWA';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { checkAndSendTaskNotifications } = usePWA();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    dailyProductivityPercentage: 0,
    productivityStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { id, message, type: 'success'|'error'|'info', undoAction: fn }
  const [lastCompletedTask, setLastCompletedTask] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Trigger Toast Notification
  const showToast = useCallback((message, type = 'success', undoAction = null) => {
    const id = Date.now();
    setToast({ id, message, type, undoAction });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4500);
  }, []);

  const hideToast = () => setToast(null);

  // Record daily app visit for real-time usage streak tracking
  const recordAppVisit = () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const storedVisits = JSON.parse(localStorage.getItem('taskmanager_app_visit_dates') || '[]');
      if (!storedVisits.includes(todayStr)) {
        const updatedVisits = [...storedVisits, todayStr];
        localStorage.setItem('taskmanager_app_visit_dates', JSON.stringify(updatedVisits));
      }
    } catch (e) {
      console.error('Error saving app visit date:', e);
    }
  };

  // Dynamic Real-Time Streak Calculation (App Open Days + Task Completions)
  const calculateRealtimeStreak = (taskList) => {
    const activityDates = new Set();

    // 1. Include recorded app visit dates
    try {
      const visits = JSON.parse(localStorage.getItem('taskmanager_app_visit_dates') || '[]');
      visits.forEach((d) => activityDates.add(d));
    } catch (e) {}

    // 2. Include task completion dates
    taskList.forEach((task) => {
      if (task.status === 'Completed' && task.completedAt) {
        const dStr = new Date(task.completedAt).toISOString().split('T')[0];
        activityDates.add(dStr);
      }
    });

    // Ensure today's active visit is registered
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    activityDates.add(todayStr);

    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Recalculate stats dynamically
  const calculateStats = useCallback((taskList) => {
    const totalTasks = taskList.length;
    const completedTasks = taskList.filter((t) => t.status === 'Completed').length;
    
    const now = new Date();
    const isTaskOverdue = (t) => {
      if (t.status !== 'Pending' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);
      return now > due;
    };

    const overdueTasks = taskList.filter(isTaskOverdue).length;
    const pendingTasks = taskList.filter((t) => t.status === 'Pending' && !isTaskOverdue(t)).length;

    const dailyProductivityPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const currentStreak = calculateRealtimeStreak(taskList);

    setStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      dailyProductivityPercentage,
      productivityStreak: currentStreak,
    });
  }, []);

  // Automatic Daily Task Status Refresh (Resets Completed Tasks to Pending for New Day)
  const performDailyTaskRefreshIfNeeded = useCallback((taskList) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('taskmanager_last_daily_reset');

    if (lastReset && lastReset !== todayStr) {
      let updated = false;
      const refreshedTasks = taskList.map((t) => {
        if (t.status === 'Completed') {
          updated = true;
          return {
            ...t,
            status: 'Pending',
            completedAt: null,
          };
        }
        return t;
      });

      localStorage.setItem('taskmanager_last_daily_reset', todayStr);

      if (updated) {
        try {
          localStorage.setItem('taskmanager_tasks_data', JSON.stringify(refreshedTasks));
        } catch (e) {}
        showToast('☀️ New Day! Your tasks have been refreshed to Pending.', 'info');
        return refreshedTasks;
      }
    } else if (!lastReset) {
      localStorage.setItem('taskmanager_last_daily_reset', todayStr);
    }

    return taskList;
  }, [showToast]);

  // Fetch Tasks & Categories
  const fetchTasksAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, catRes] = await Promise.all([
        taskService.getTasks(),
        categoryService.getCategories(),
      ]);

      if (taskRes.success) {
        recordAppVisit();
        const activeTasks = performDailyTaskRefreshIfNeeded(taskRes.data);
        setTasks(activeTasks);
        calculateStats(activeTasks);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error loading tasks & categories:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, performDailyTaskRefreshIfNeeded]);

  useEffect(() => {
    fetchTasksAndCategories();

    // Check for 12 AM midnight transition every 30 seconds
    const interval = setInterval(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastReset = localStorage.getItem('taskmanager_last_daily_reset');
      if (lastReset && lastReset !== todayStr) {
        fetchTasksAndCategories();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTasksAndCategories]);

  // Trigger notifications on tasks update
  useEffect(() => {
    if (tasks.length > 0) {
      checkAndSendTaskNotifications(tasks);
    }
  }, [tasks, checkAndSendTaskNotifications]);


  // Synchronous LocalStorage Task Persistence Guard
  const saveTasksToStorage = (taskList) => {
    try {
      localStorage.setItem('taskmanager_tasks_data', JSON.stringify(taskList));
    } catch (e) {
      console.error('Error saving tasks to local storage:', e);
    }
  };

  // Task Operations
  const addTask = async (taskData) => {
    try {
      const res = await taskService.createTask(taskData);
      if (res.success) {
        const updated = [res.data, ...tasks];
        setTasks(updated);
        saveTasksToStorage(updated);
        calculateStats(updated);
        showToast('Task created successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
      return { success: false, message: err.message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await taskService.updateTask(id, taskData);
      if (res.success) {
        const updated = tasks.map((t) => (t._id === id ? res.data : t));
        setTasks(updated);
        saveTasksToStorage(updated);
        calculateStats(updated);
        showToast('Task updated successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
      return { success: false, message: err.message };
    }
  };

  const deleteTask = async (id) => {
    const taskToDelete = tasks.find((t) => t._id === id);
    try {
      const res = await taskService.deleteTask(id);
      if (res.success) {
        const updated = tasks.filter((t) => t._id !== id);
        setTasks(updated);
        saveTasksToStorage(updated);
        calculateStats(updated);
        showToast(`Task "${taskToDelete?.title || ''}" deleted`, 'info');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
      return { success: false, message: err.message };
    }
  };

  const toggleTaskCompletion = async (id) => {
    const targetTask = tasks.find((t) => t._id === id);
    if (!targetTask) return;

    const isCompleting = targetTask.status === 'Pending';
    try {
      const res = isCompleting
        ? await taskService.completeTask(id)
        : await taskService.uncompleteTask(id);

      if (res.success) {
        const updated = tasks.map((t) => (t._id === id ? res.data : t));
        setTasks(updated);
        saveTasksToStorage(updated);
        calculateStats(updated);

        if (isCompleting) {
          setLastCompletedTask(targetTask);
          showToast(`Completed "${targetTask.title}"`, 'success', () => undoCompletion(id));
        } else {
          showToast(`Task marked as pending`, 'info');
        }
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const undoCompletion = async (id) => {
    try {
      const res = await taskService.uncompleteTask(id);
      if (res.success) {
        const updated = tasks.map((t) => (t._id === id ? res.data : t));
        setTasks(updated);
        saveTasksToStorage(updated);
        calculateStats(updated);
        showToast('Task completion undone', 'info');
      }
    } catch (err) {
      showToast('Could not undo action', 'error');
    }
  };

  // Category Operations
  const addCategory = async (catData) => {
    try {
      const res = await categoryService.createCategory(catData);
      if (res.success) {
        setCategories((prev) => [...prev, res.data]);
        showToast('Category created!', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Failed to add category', 'error');
      return { success: false };
    }
  };

  const updateCategory = async (id, catData) => {
    try {
      const res = await categoryService.updateCategory(id, catData);
      if (res.success) {
        setCategories((prev) => prev.map((c) => (c._id === id ? res.data : c)));
        showToast('Category updated!', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Failed to update category', 'error');
      return { success: false };
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        showToast('Category deleted', 'info');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
      return { success: false };
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        stats,
        loading,
        toast,
        showToast,
        hideToast,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        categoryFilter,
        setCategoryFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        undoCompletion,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshTasks: fetchTasksAndCategories,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
