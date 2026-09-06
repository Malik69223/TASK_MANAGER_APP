import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart3,
  FolderKanban,
  Settings,
} from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Habits', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Categories', path: '/categories', icon: FolderKanban },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 px-2 py-2 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                  : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
