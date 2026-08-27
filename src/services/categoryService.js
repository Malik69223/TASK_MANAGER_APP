import { apiRequest } from './api';

export const categoryService = {
  getCategories: async () => {
    return await apiRequest('/categories', {
      method: 'GET',
    });
  },

  createCategory: async (categoryData) => {
    return await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id, categoryData) => {
    return await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (id) => {
    return await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
