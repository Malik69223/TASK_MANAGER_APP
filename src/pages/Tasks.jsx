import React from 'react';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskList } from '../components/tasks/TaskList';
import { Plus, CheckSquare } from 'lucide-react';

export const Tasks = ({ onOpenAddTask, onEditTask }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            Habit Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
            My Habits
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Organize, search, filter, and track your daily habits
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <TaskFilters />

      {/* Task List Grid */}
      <TaskList onEditTask={onEditTask} />
    </div>
  );
};
