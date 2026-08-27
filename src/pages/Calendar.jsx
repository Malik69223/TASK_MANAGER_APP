import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/tasks/TaskCard';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';

export const Calendar = ({ onOpenAddTask, onEditTask }) => {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group tasks by Date ISO string (YYYY-MM-DD)
  const taskMap = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const dStr = new Date(task.dueDate).toISOString().split('T')[0];
      if (!taskMap[dStr]) taskMap[dStr] = [];
      taskMap[dStr].push(task);
    }
  });

  const selectedTasks = taskMap[selectedDateStr] || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            Schedule Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
            Task Calendar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Click on any date to inspect or add scheduled tasks
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task for Date</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-outfit">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-20 rounded-xl bg-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = dateObj.toISOString().split('T')[0];

              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              const dayTasks = taskMap[dateStr] || [];
              const pendingCount = dayTasks.filter((t) => t.status === 'Pending').length;
              const completedCount = dayTasks.filter((t) => t.status === 'Completed').length;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-500 shadow-glow scale-[1.02] z-10'
                      : isToday
                      ? 'bg-brand-50/50 dark:bg-brand-950/40 border-brand-500/50 text-gray-900 dark:text-white'
                      : 'bg-white/40 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-800/60 text-gray-800 dark:text-gray-200 hover:border-brand-400'
                  }`}
                >
                  <span
                    className={`text-xs font-bold font-outfit ${
                      isSelected
                        ? 'text-white'
                        : isToday
                        ? 'text-brand-600 dark:text-brand-400'
                        : ''
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Task Indicator Pills */}
                  {dayTasks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pendingCount > 0 && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-sky-500'
                          }`}
                          title={`${pendingCount} pending`}
                        />
                      )}
                      {completedCount > 0 && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                          }`}
                          title={`${completedCount} completed`}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Tasks Drawer Pane */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Scheduled Tasks
              </span>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white font-outfit">
                {new Date(selectedDateStr).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
              {selectedTasks.length} Tasks
            </span>
          </div>

          {/* Task Cards for Selected Date */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]">
            {selectedTasks.length > 0 ? (
              selectedTasks.map((task) => (
                <TaskCard key={task._id} task={task} onEdit={onEditTask} />
              ))
            ) : (
              <div className="py-12 text-center">
                <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  No tasks scheduled for this date.
                </p>
                <button
                  onClick={onOpenAddTask}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
