import { INITIAL_USER, INITIAL_TASKS, INITIAL_CATEGORIES } from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Local storage keys for standalone mock persistence
const STORAGE_KEYS = {
  TOKEN: 'taskmanager_auth_token',
  USER: 'taskmanager_auth_user',
  TASKS: 'taskmanager_tasks_data',
  CATEGORIES: 'taskmanager_categories_data',
};

// Initialize Mock Local Storage
const initMockStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
};
initMockStorage();


// Standardized HTTP Request wrapper
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    // If backend is unreachable or throws network error, fallback to Mock Engine
    console.warn(`Backend connection notice for [${endpoint}]: ${error.message}. Routing request to Local Storage Mock Service.`);
    return mockHandler(endpoint, options);
  }
};

// Standalone Mock Fallback Engine for instant offline execution
const mockHandler = async (endpoint, options) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // --- AUTH MOCK ---
  if (endpoint === '/auth/login') {
    const user = { ...INITIAL_USER, email: body.email || INITIAL_USER.email };
    const mockToken = 'mock_jwt_token_' + Date.now();
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { success: true, message: 'Login successful', data: { ...user, token: mockToken } };
  }

  if (endpoint === '/auth/register') {
    const newUser = {
      _id: 'user_' + Date.now(),
      name: body.name || 'New User',
      email: body.email,
      avatar: '',
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'mock_jwt_token_' + Date.now();
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return { success: true, message: 'Registration successful', data: { ...newUser, token: mockToken } };
  }

  if (endpoint === '/auth/me') {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) throw new Error('Not authenticated');
    return { success: true, data: JSON.parse(storedUser) };
  }

  // --- TASKS MOCK ---
  let tasks = [];
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    if (!Array.isArray(tasks)) tasks = [];
  } catch (e) {
    tasks = [];
  }

  if (endpoint.startsWith('/tasks')) {
    if (method === 'GET') {
      return { success: true, data: tasks, pagination: { total: tasks.length, page: 1, pages: 1 } };
    }

    if (method === 'POST') {
      const newTask = {
        _id: 'task_' + Date.now(),
        userId: 'user_1',
        title: body.title,
        description: body.description || '',
        category: body.category || 'General',
        priority: body.priority || 'Medium',
        status: 'Pending',
        dueDate: body.dueDate,
        isRecurring: Boolean(body.isRecurring),
        recurrenceType: body.isRecurring ? (body.recurrenceType || 'Daily') : 'None',
        createdAt: new Date().toISOString(),
      };
      tasks = [newTask, ...tasks];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, message: 'Task created successfully', data: newTask };
    }

    const taskId = endpoint.split('/')[2];

    if (endpoint.endsWith('/complete')) {
      tasks = tasks.map((t) =>
        t._id === taskId ? { ...t, status: 'Completed', completedAt: new Date().toISOString() } : t
      );
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      const updated = tasks.find((t) => t._id === taskId);
      return { success: true, message: 'Task completed', data: updated };
    }

    if (endpoint.endsWith('/uncomplete')) {
      tasks = tasks.map((t) =>
        t._id === taskId ? { ...t, status: 'Pending', completedAt: null } : t
      );
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      const updated = tasks.find((t) => t._id === taskId);
      return { success: true, message: 'Task marked as pending', data: updated };
    }

    if (method === 'PUT') {
      tasks = tasks.map((t) => (t._id === taskId ? { ...t, ...body } : t));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      const updated = tasks.find((t) => t._id === taskId);
      return { success: true, message: 'Task updated', data: updated };
    }

    if (method === 'DELETE') {
      tasks = tasks.filter((t) => t._id !== taskId);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, message: 'Task deleted', data: { id: taskId } };
    }
  }

  // --- CATEGORIES MOCK ---
  let categories = [];
  try {
    categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    if (!Array.isArray(categories) || categories.length === 0) categories = INITIAL_CATEGORIES;
  } catch (e) {
    categories = INITIAL_CATEGORIES;
  }

  if (endpoint.startsWith('/categories')) {
    if (method === 'GET') {
      return { success: true, data: categories };
    }

    if (method === 'POST') {
      const newCat = {
        _id: 'cat_' + Date.now(),
        name: body.name,
        color: body.color || '#6366f1',
        icon: body.icon || 'Folder',
      };
      categories = [...categories, newCat];
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return { success: true, message: 'Category created', data: newCat };
    }

    const catId = endpoint.split('/')[2];

    if (method === 'PUT') {
      categories = categories.map((c) => (c._id === catId ? { ...c, ...body } : c));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      const updated = categories.find((c) => c._id === catId);
      return { success: true, message: 'Category updated', data: updated };
    }

    if (method === 'DELETE') {
      categories = categories.filter((c) => c._id !== catId);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return { success: true, message: 'Category deleted', data: { id: catId } };
    }
  }

  // --- ANALYTICS MOCK ---
  if (endpoint.startsWith('/analytics')) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
    const now = new Date();
    const overdueTasks = tasks.filter((t) => {
      if (t.status !== 'Pending' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);
      return now > due;
    }).length;

    if (endpoint === '/analytics/dashboard') {
      return {
        success: true,
        data: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          dailyProductivityPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          productivityStreak: completedTasks > 0 ? 1 : 0,
        },
      };
    }

    if (endpoint === '/analytics/weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];
        const completed = tasks.filter(
          (t) => t.status === 'Completed' && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dateStr
        ).length;
        const total = tasks.filter(
          (t) => new Date(t.dueDate).toISOString().split('T')[0] === dateStr
        ).length;
        weeklyData.push({
          day: dayName,
          date: dateStr,
          completed,
          total,
          rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }
      return { success: true, data: weeklyData };
    }

    if (endpoint === '/analytics/monthly') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const monthlyData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
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
      return { success: true, data: monthlyData };
    }
  }


  return { success: true, data: [] };
};
