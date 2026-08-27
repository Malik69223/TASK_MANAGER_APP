import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Tag,
  Repeat,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const TaskCard = ({ task, onEdit }) => {
  const { toggleTaskCompletion, deleteTask, categories } = useTasks();
  const [showOptions, setShowOptions] = useState(false);

  const isCompleted = task.status === 'Completed';
  const isOverdue =
    !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  // Find matching category color/icon
  const matchedCat = categories.find((c) => c.name === task.category);
  const catColor = matchedCat?.color || '#6366f1';

  // Priority Styles
  const priorityStyles = {
    High: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`group relative p-5 rounded-2xl glass-card border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        isCompleted
          ? 'opacity-70 bg-gray-50/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/40'
          : isOverdue
          ? 'border-rose-500/40 bg-rose-50/20 dark:bg-rose-950/10'
          : 'border-gray-200/80 dark:border-gray-800/80'
      }`}
    >
      {/* Header: Status Checkbox + Priority Badge + Dropdown Menu */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Interactive Checkbox */}
          <button
            onClick={() => toggleTaskCompletion(task._id)}
            className="p-1 rounded-lg hover:scale-110 transition-transform text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none"
            aria-label={isCompleted ? 'Mark task pending' : 'Mark task completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
            ) : (
              <Circle className="w-6 h-6 stroke-[1.75]" />
            )}
          </button>

          {/* Category Pill Tag */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${catColor}15`,
              color: catColor,
              border: `1px solid ${catColor}30`,
            }}
          >
            <Tag className="w-3 h-3" />
            {task.category || 'General'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Priority Pill */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
              priorityStyles[task.priority] || priorityStyles.Medium
            }`}
          >
            {task.priority}
          </span>

          {/* Action Menu button */}
          <div className="relative">
            <button
              onClick={() => setShowOptions((prev) => !prev)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-1 w-36 rounded-xl glass-panel bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xl p-1 z-20 animate-fade-in">
                <button
                  onClick={() => {
                    setShowOptions(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    setShowOptions(false);
                    deleteTask(task._id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Body: Title & Description */}
      <h3
        className={`font-semibold text-base text-gray-900 dark:text-white mb-1.5 font-outfit line-clamp-1 ${
          isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''
        }`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: Due Date & Recurrence */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 dark:border-gray-800/60">
        <div
          className={`flex items-center gap-1.5 font-medium ${
            isOverdue
              ? 'text-rose-600 dark:text-rose-400 font-semibold'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {isOverdue ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
          <span>
            {isOverdue ? 'Overdue: ' : task.dueDate ? 'Due: ' : 'Daily Task '}
            {formattedDueDate || '(Resets 12 AM)'}
          </span>

        </div>

        {task.isRecurring && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full"
            title={`Recurring task: ${task.recurrenceType}`}
          >
            <Repeat className="w-3 h-3" />
            {task.recurrenceType}
          </span>
        )}
      </div>
    </div>
  );
};
