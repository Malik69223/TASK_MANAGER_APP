import { apiRequest } from './api';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    return await apiRequest('/analytics/dashboard', {
      method: 'GET',
    });
  },

  getWeeklyAnalytics: async () => {
    return await apiRequest('/analytics/weekly', {
      method: 'GET',
    });
  },

  getMonthlyAnalytics: async () => {
    return await apiRequest('/analytics/monthly', {
      method: 'GET',
    });
  },
};
