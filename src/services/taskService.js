import { apiRequest } from './api';

export const taskService = {
  getTasks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  createTask: async (taskData) => {
    return await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: async (id, taskData) => {
    return await apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  deleteTask: async (id) => {
    return await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  completeTask: async (id) => {
    return await apiRequest(`/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  },

  uncompleteTask: async (id) => {
    return await apiRequest(`/tasks/${id}/uncomplete`, {
      method: 'PATCH',
    });
  },
};
