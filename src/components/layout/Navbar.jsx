import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';
import { usePWA } from '../../hooks/usePWA';
import {
  Sun,
  Moon,
  Search,
  Download,
  Wifi,
  WifiOff,
  LogOut,
  User,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export const Navbar = ({ onOpenAddTask }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useTasks();
  const { isInstallable, installPWA, isOnline } = usePWA();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/70 dark:bg-[#0b0f19]/70 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Brand (Shown on small screens) */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-base text-gray-900 dark:text-white font-outfit">
          HabitTracker
        </span>
      </div>

      {/* Global Search Input */}
      <div className="hidden sm:flex items-center flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks, descriptions, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-transparent focus:border-brand-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none transition-all"
        />
      </div>

      {/* Controls & Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Quick Mobile Add Button */}
        <button
          onClick={onOpenAddTask}
          className="lg:hidden p-2 rounded-xl bg-brand-600 text-white shadow-sm hover:bg-brand-500 transition-colors"
          title="Add New Task"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Online / Offline Network Badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
        </div>

        {/* PWA Install Button Prompt */}
        {isInstallable && (
          <button
            onClick={installPWA}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-brand-600 dark:text-brand-400 font-semibold text-xs transition-colors border border-brand-500/30"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/40 transition-all"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-brand-500"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xl p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
              </div>

              <div className="py-1">
                <a
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Account Settings
                </a>
                <a
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile & Preferences
                </a>

              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
