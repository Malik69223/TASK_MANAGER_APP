import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart3,
  FolderKanban,
  Settings,
  Zap,
  Plus,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ onOpenAddTask }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Habits', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Categories', path: '/categories', icon: FolderKanban },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-r border-gray-200/80 dark:border-gray-800/80 p-5 z-30 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-glow">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-gray-900 dark:text-white font-outfit leading-tight tracking-tight">
            HabitTracker
          </h1>
          <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 tracking-widest uppercase">
            Pro · PWA
          </span>
        </div>
      </div>

      {/* Quick Add Habit Button */}
      <button
        onClick={onOpenAddTask}
        className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md hover:shadow-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Habit</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold shadow-sm border border-brand-200/50 dark:border-brand-800/50'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Pro Banner Footer */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-brand-950/60 border border-brand-500/20 text-center">
        <div className="inline-flex p-2 rounded-xl bg-brand-500/20 text-brand-400 mb-2">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-white mb-1 font-outfit">PWA Offline Ready</h4>
        <p className="text-[11px] text-gray-400 leading-snug">
          Install on mobile or desktop for seamless offline habit tracking.
        </p>
      </div>
    </aside>
  );
};
