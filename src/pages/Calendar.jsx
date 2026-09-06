import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/tasks/TaskCard';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
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
  const selectedCompletedCount = selectedTasks.filter((t) => t.status === 'Completed').length;
  const selectedPendingCount = selectedTasks.filter((t) => t.status === 'Pending').length;
  const selectedCompletionPct = selectedTasks.length > 0
    ? Math.round((selectedCompletedCount / selectedTasks.length) * 100)
    : 0;

  // Open add-habit modal pre-filled with selected calendar date
  const handleAddForDate = () => {
    onOpenAddTask(selectedDateStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedDateLabel = new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            Habit Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
            Habit Calendar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Click a date to view or schedule habits for that day
          </p>
        </div>

        <button
          onClick={handleAddForDate}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Habit for {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
                onClick={() => { setCurrentDate(new Date()); setSelectedDateStr(todayStr); }}
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
              const isToday = dateStr === todayStr;

              const dayTasks = taskMap[dateStr] || [];
              const pendingCount = dayTasks.filter((t) => t.status === 'Pending').length;
              const completedCount = dayTasks.filter((t) => t.status === 'Completed').length;
              const dayPct = dayTasks.length > 0
                ? Math.round((completedCount / dayTasks.length) * 100)
                : null;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-500 shadow-glow scale-[1.02] z-10'
                      : isToday
                      ? 'bg-brand-50/50 dark:bg-brand-950/40 border-brand-500/50 text-gray-900 dark:text-white'
                      : 'bg-white/40 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-800/60 text-gray-800 dark:text-gray-200 hover:border-brand-400 hover:bg-brand-50/20 dark:hover:bg-brand-950/20'
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

                  {/* Task Indicator with completion % */}
                  {dayTasks.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      {dayPct !== null && (
                        <span className={`text-[9px] font-bold leading-none ${
                          isSelected ? 'text-white/90' : dayPct === 100 ? 'text-emerald-500' : 'text-brand-500 dark:text-brand-400'
                        }`}>
                          {dayPct}%
                        </span>
                      )}
                      <div className="flex gap-0.5">
                        {pendingCount > 0 && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-white/70' : 'bg-sky-500'
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
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Tasks Drawer Pane */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex flex-col">
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Selected Date
            </span>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white font-outfit">
              {selectedDateLabel}
            </h3>

            {/* Stats for selected day */}
            {selectedTasks.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-lg font-extrabold text-gray-900 dark:text-white font-outfit">
                    {selectedTasks.length}
                  </div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wide">Total</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-outfit">
                    {selectedCompletedCount}
                  </div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Done</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                  <div className="text-lg font-extrabold text-brand-600 dark:text-brand-400 font-outfit">
                    {selectedCompletionPct}%
                  </div>
                  <div className="text-[9px] text-brand-600 dark:text-brand-400 uppercase tracking-wide">Rate</div>
                </div>
              </div>
            )}
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
                  No habits scheduled for this date.
                </p>
                <button
                  onClick={handleAddForDate}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Schedule a Habit
                </button>
              </div>
            )}
          </div>

          {/* Quick add button at bottom of pane */}
          {selectedTasks.length > 0 && (
            <button
              onClick={handleAddForDate}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-brand-500/30 bg-brand-50/60 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 font-semibold text-xs hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Habit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
