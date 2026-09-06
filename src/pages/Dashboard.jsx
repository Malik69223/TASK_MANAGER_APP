import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { analyticsService } from '../services/analyticsService';
import { CircularProgress } from '../components/common/CircularProgress';
import { WeeklyChart } from '../components/charts/WeeklyChart';
import { TaskCard } from '../components/tasks/TaskCard';
import { StatCardSkeleton } from '../components/common/Skeleton';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Flame,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

const DAILY_MOTIVATIONAL_QUOTES = [
  "“Small daily improvements over time lead to stunning results. Stay focused!” ✨",
  "“Believe you can and you're halfway there. Make today count!” 🌟",
  "“Your future is created by what you do today, not tomorrow.” 💪",
  "“Consistency is the key to unlocking your potential. Keep pushing!” 🔥",
  "“Success isn't about greatness. It's about consistency. Keep going!” 🚀",
  "“Focus on being productive instead of busy. You've got this!” 🎯",
  "“Action is the foundational key to all success. Take the first step!” 💡",
  "“Don't watch the clock; do what it does. Keep going!” ⏰",
  "“The secret of getting ahead is getting started.” 🌈",
  "“Great things are done by a series of small things brought together.” ✨",
  "“Push yourself, because no one else is going to do it for you.” 🏆",
  "“Dream big, work hard, stay focused, and surround yourself with good energy.” 💫",
  "“The harder you work for something, the greater you'll feel when you achieve it.” 🎉",
  "“Don't stop until you're proud. Today is another opportunity to excel!” 🔥",
  "“Quality is not an act, it is a habit. Make today extraordinary!” ⭐",
  "“You don't have to be great to start, but you have to start to be great.” 🌟",
  "“Success starts with self-discipline. Stay committed to your goals today!” 🎯",
  "“Turn your obstacles into opportunities and your goals into reality.” 💎",
  "“One small positive thought in the morning can change your whole day.” ☀️",
  "“Your dedication today determines your triumph tomorrow.” 🏅",
  "“Energy flows where attention goes. Keep your eyes on your goals!” ⚡",
  "“Make each day your masterpiece. Productivity brings peace of mind.” 🎨",
  "“Difficulties in your path are opportunities to grow stronger.” 🌿",
  "“You are capable of achieving more than you know. Stay relentless!” 💥",
  "“Set your goals high, and don't stop till you get there.” 🏔️",
  "“Every accomplishment starts with the decision to try.” ✨",
  "“Work hard in silence, let your success be your noise.” 🎺",
  "“Be stronger than your excuses. Execute your plan today!” 🛡️",
  "“Today's effort is tomorrow's achievement. Give it your 100%!” 🔥",
  "“Strive for progress, not perfection. Keep building your momentum!” 📈",
  "“Your potential is endless. Go do what you were created to do!” 🚀"
];

export const Dashboard = ({ onOpenAddTask, onEditTask }) => {
  const { user } = useAuth();
  const { tasks, stats, loading } = useTasks();
  const [weeklyData, setWeeklyData] = useState([]);

  const dailyQuote = React.useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    return DAILY_MOTIVATIONAL_QUOTES[dayOfYear % DAILY_MOTIVATIONAL_QUOTES.length];
  }, []);

  useEffect(() => {
    const loadWeekly = async () => {
      try {
        const res = await analyticsService.getWeeklyAnalytics();
        if (res.success) {
          setWeeklyData(res.data);
        }
      } catch (err) {
        console.error('Failed to load weekly analytics:', err);
      }
    };
    loadWeekly();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const greetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '☀️';
    if (hour >= 12 && hour < 17) return '🌤️';
    if (hour >= 17 && hour < 21) return '🌆';
    return '🌙';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const recentTasks = tasks.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white p-6 sm:p-8 shadow-glow">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDateFormatted}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Sparky'}! {greetingEmoji()}
            </h2>

            <p className="text-xs sm:text-sm font-medium text-indigo-100 max-w-xl mt-1.5 leading-relaxed tracking-wide italic">
              {dailyQuote}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Badge Card */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">
                  Current Streak
                </span>
                <span className="text-lg font-extrabold font-outfit text-white">
                  {stats.productivityStreak || 0} Days 🔥
                </span>

              </div>
            </div>

            <button
              onClick={onOpenAddTask}
              className="hidden sm:flex items-center gap-2 py-3 px-5 rounded-2xl bg-white text-brand-600 hover:bg-gray-100 font-bold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add Habit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Tasks */}
            <div className="p-5 rounded-2xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Total Habits
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
                  {stats.totalTasks}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="p-5 rounded-2xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Completed Habits
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-outfit">
                  {stats.completedTasks}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="p-5 rounded-2xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Pending Habits
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-outfit">
                  {stats.pendingTasks}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid: Circular Indicator + Weekly Productivity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Circular Progress Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex flex-col items-center justify-center text-center">
          <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit mb-4 self-start">
            Daily Productivity
          </h3>
          <div className="my-2">
            <CircularProgress
              percentage={stats.dailyProductivityPercentage || 0}
              size={150}
              strokeWidth={12}
            />

          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 max-w-xs">
            {stats.dailyProductivityPercentage >= 70
              ? 'Outstanding performance! You are exceeding your targets.'
              : 'Consistent effort leads to great results. Keep going!'}
          </p>
        </div>

        {/* Weekly Productivity Recharts Area */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                Weekly Habit Wave
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Habits completed each day — rises when you complete more 📈
              </p>
            </div>
            <a
              href="/analytics"
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>View Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <WeeklyChart data={weeklyData} />
        </div>
      </div>

      {/* Grid: Recent Tasks & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
              Recent Habits
            </h3>
            <a
              href="/tasks"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View All
            </a>
          </div>

          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((t) => (
                <TaskCard key={t._id} task={t} onEdit={onEditTask} />
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No habits added yet. Start building your streak! 🔥</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
