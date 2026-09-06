import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Modal } from '../common/Modal';
import { Calendar, Tag, AlertCircle, Repeat, Sparkles } from 'lucide-react';

export const TaskModal = ({ isOpen, onClose, taskToEdit = null, defaultDate = null }) => {
  const { addTask, updateTask, categories } = useTasks();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Medium',
    dueDate: null,
    isRecurring: false,
    recurrenceType: 'Daily',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        category: taskToEdit.category || 'General',
        priority: taskToEdit.priority || 'Medium',
        dueDate: taskToEdit.dueDate
          ? new Date(taskToEdit.dueDate).toISOString().split('T')[0]
          : '',
        isRecurring: Boolean(taskToEdit.isRecurring),
        recurrenceType: taskToEdit.recurrenceType || 'Daily',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: categories[0]?.name || 'General',
        priority: 'Medium',
        // Pre-fill with the calendar-selected date if provided
        dueDate: defaultDate || '',
        isRecurring: false,
        recurrenceType: 'Daily',
      });
    }
    setErrors({});
  }, [taskToEdit, isOpen, categories, defaultDate]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Habit title is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    let result;
    if (taskToEdit) {
      result = await updateTask(taskToEdit._id, formData);
    } else {
      result = await addTask(formData);
    }

    setSubmitting(false);
    if (result?.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Habit' : 'Add New Habit'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Habit Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Morning Workout, Read 30 mins..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all ${
              errors.title
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
            }`}
          />
          {errors.title && (
            <p className="flex items-center gap-1 mt-1 text-xs text-rose-500">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Description / Notes
          </label>
          <textarea
            rows="3"
            placeholder="Add relevant notes, goals, or instructions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-all resize-none"
          />
        </div>

        {/* Grid: Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c._id} value={c.name} className="dark:bg-gray-800">
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="Low" className="dark:bg-gray-800">Low Priority</option>
              <option value="Medium" className="dark:bg-gray-800">Medium Priority</option>
              <option value="High" className="dark:bg-gray-800">High Priority</option>
            </select>
          </div>
        </div>

        {/* Due Date — Calendar-aware pre-filled field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Due Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
            />
          </div>
          {defaultDate && !taskToEdit && (
            <p className="mt-1 text-[11px] text-brand-500 dark:text-brand-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Date pre-filled from calendar selection
            </p>
          )}
        </div>

        {/* Recurring Habit Section */}
        <div className="p-4 rounded-xl bg-gray-100/60 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Recurring Habit
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) =>
                  setFormData({ ...formData, isRecurring: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {formData.isRecurring && (
            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Recurrence Frequency
              </label>
              <select
                value={formData.recurrenceType}
                onChange={(e) =>
                  setFormData({ ...formData, recurrenceType: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="Daily">Repeat Daily</option>
                <option value="Weekly">Repeat Weekly</option>
                <option value="Monthly">Repeat Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md hover:shadow-glow transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{taskToEdit ? 'Update Habit' : 'Save Habit'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
