import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskSkeleton } from '../common/Skeleton';
import { CheckSquare, SearchX } from 'lucide-react';

export const TaskList = ({ onEditTask }) => {
  const {
    tasks,
    loading,
    searchQuery,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
  } = useTasks();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchCat = task.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Helper for 12 AM midnight overdue rule
    const checkIsOverdue = (t) => {
      if (t.status !== 'Pending' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);
      return new Date() > due;
    };

    // Status filter
    if (statusFilter === 'Pending') {
      if (task.status !== 'Pending' || checkIsOverdue(task)) return false;
    }
    if (statusFilter === 'Completed' && task.status !== 'Completed') return false;
    if (statusFilter === 'Overdue') {
      if (!checkIsOverdue(task)) return false;
    }

    // Priority filter
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

    // Category filter
    if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    }
    if (sortBy === 'priority') {
      const order = { High: 3, Medium: 2, Low: 1 };
      return (order[b.priority] || 0) - (order[a.priority] || 0);
    }
    if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 my-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mb-4">
          {searchQuery ? <SearchX className="w-7 h-7" /> : <CheckSquare className="w-7 h-7" />}
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit mb-1">
          No tasks found
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
          {searchQuery
            ? `No tasks matching "${searchQuery}". Try clearing search or filters.`
            : 'You are all caught up! Click "Create Task" to add your next task.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTasks.map((task) => (
        <TaskCard key={task._id} task={task} onEdit={onEditTask} />
      ))}
    </div>
  );
};
