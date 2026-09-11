import React from 'react';
import { User, Code, Heart } from 'lucide-react';

export const AboutDeveloper = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
          <User className="w-4 h-4" />
          About Developer
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
          Meet the Creator
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          The mind behind Habit Tracker Pro
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 text-center space-y-6 mt-8 relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center text-white text-4xl font-extrabold font-outfit border-4 border-brand-500/30 shadow-xl mb-6">
            M
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit mb-2">
            M. Adeel Akhtar
          </h2>
          
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-6">
            CS Student @ GCU Lahore
          </p>

          <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-md">
            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed flex items-center justify-center gap-2">
              <Code className="w-5 h-5 text-brand-500" />
              Building, Learning & Exploring the World of Technology 🚀
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-center items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          Made with <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse-glow" /> in Lahore
        </div>
      </div>
    </div>
  );
};
