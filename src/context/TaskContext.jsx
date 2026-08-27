import React, { createContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { categoryService } from '../services/categoryService';
import { analyticsService } from '../services/analyticsService';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
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

  // Dynamic Real-Time Streak Calculation
  const calculateRealtimeStreak = (taskList) => {
    const datesWithCompletions = new Set();
    taskList.forEach((task) => {
      if (task.status === 'Completed' && task.completedAt) {
        const dStr = new Date(task.completedAt).toISOString().split('T')[0];
        datesWithCompletions.add(dStr);
      }
    });

    if (datesWithCompletions.size === 0) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!datesWithCompletions.has(todayStr) && !datesWithCompletions.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(today);
    if (!datesWithCompletions.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (datesWithCompletions.has(dStr)) {
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
    const pendingTasks = taskList.filter((t) => t.status === 'Pending').length;
    const now = new Date();
    const overdueTasks = taskList.filter(
      (t) => t.status === 'Pending' && t.dueDate && new Date(t.dueDate) < now
    ).length;

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


  // Auto Reset Completed Tasks at Midnight 12:00 AM
  const checkMidnightReset = useCallback((taskList) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('taskmanager_last_reset_date');

    if (lastReset !== todayStr) {
      // Midnight passed! Reset completed tasks back to pending so user doesn't need to re-add them
      const resetTasks = taskList.map((t) => ({
        ...t,
        status: 'Pending',
        completedAt: null,
      }));

      localStorage.setItem('taskmanager_tasks_data', JSON.stringify(resetTasks));
      localStorage.setItem('taskmanager_last_reset_date', todayStr);

      if (lastReset && resetTasks.some((t) => t.status === 'Pending')) {
        showToast('🌕 12:00 AM Midnight Reset: Daily tasks refreshed for the new day!', 'info');
      }

      return resetTasks;
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
        const cleanedTasks = checkMidnightReset(taskRes.data);
        setTasks(cleanedTasks);
        calculateStats(cleanedTasks);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error loading tasks & categories:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, checkMidnightReset]);

  useEffect(() => {
    fetchTasksAndCategories();

    // Set interval to check for midnight transition every 30 seconds
    const timer = setInterval(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastReset = localStorage.getItem('taskmanager_last_reset_date');
      if (lastReset && lastReset !== todayStr) {
        fetchTasksAndCategories();
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [fetchTasksAndCategories]);


  // Task Operations
  const addTask = async (taskData) => {
    try {
      const res = await taskService.createTask(taskData);
      if (res.success) {
        const updated = [res.data, ...tasks];
        setTasks(updated);
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
