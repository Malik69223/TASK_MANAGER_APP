import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Modal } from '../components/common/Modal';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Briefcase,
  BookOpen,
  User,
  Code,
  Activity,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, tasks } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    icon: 'Folder',
  });

  const availableIcons = [
    { name: 'Briefcase', icon: Briefcase },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'User', icon: User },
    { name: 'Code', icon: Code },
    { name: 'Activity', icon: Activity },
    { name: 'GraduationCap', icon: GraduationCap },
  ];

  const availableColors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#f43f5e', // Rose
    '#6366f1', // Indigo
  ];

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', color: '#6366f1', icon: 'Briefcase' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      color: cat.color || '#6366f1',
      icon: cat.icon || 'Briefcase',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory._id, formData);
    } else {
      await addCategory(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            Category Organization
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
            Manage Categories
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Create, customize colors, assign icons, and organize your task workflows
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const taskCount = tasks.filter((t) => t.category === cat.name).length;
          const catColor = cat.color || '#6366f1';

          return (
            <div
              key={cat._id}
              className="p-5 rounded-2xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: catColor }}
                >
                  <Tag className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white font-outfit">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(cat._id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g., University"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    formData.color === color
                      ? 'scale-125 border-gray-900 dark:border-white shadow-md'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md hover:shadow-glow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{editingCategory ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
