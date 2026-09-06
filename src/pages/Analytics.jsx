import React, { useEffect, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { analyticsService } from '../services/analyticsService';
import { WeeklyChart } from '../components/charts/WeeklyChart';
import { MonthlyChart } from '../components/charts/MonthlyChart';
import { CategoryChart } from '../components/charts/CategoryChart';
import { StatusPieChart } from '../components/charts/StatusPieChart';
import { CircularProgress } from '../components/common/CircularProgress';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Award,
  Calendar,
  Target,
  CheckCircle2,
} from 'lucide-react';

export const Analytics = () => {
  const { tasks, categories, stats } = useTasks();
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [wRes, mRes] = await Promise.all([
          analyticsService.getWeeklyAnalytics(),
          analyticsService.getMonthlyAnalytics(),
        ]);
        if (wRes.success) setWeeklyData(wRes.data);
        if (mRes.success) setMonthlyData(mRes.data);
      } catch (err) {
        console.error('Failed loading analytics:', err);
      }
    };

    fetchAnalytics();
  }, []);

  // Compute Category counts dynamically
  const categoryChartData = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat.name);
    const count = catTasks.length;
    const completed = catTasks.filter((t) => t.status === 'Completed').length;
    return {
      name: cat.name,
      count,
      completed,
      rate: count > 0 ? Math.round((completed / count) * 100) : 0,
      color: cat.color || '#6366f1',
    };
  });

  // Weekly completion %: avg over last 7 days
  const weeklyAvgRate =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((sum, d) => sum + (d.rate ?? 0), 0) / weeklyData.length)
      : 0;

  // Monthly completion %
  const monthlyWithTasks = monthlyData.filter((d) => (d.completed + (d.pending || 0)) > 0);
  const monthlyAvgRate =
    monthlyWithTasks.length > 0
      ? Math.round(
          monthlyWithTasks.reduce((sum, d) => {
            const total = d.completed + (d.pending || 0);
            return sum + (total > 0 ? Math.round((d.completed / total) * 100) : 0);
          }, 0) / monthlyWithTasks.length
        )
      : 0;

  // Determine productivity tier
  const getTier = (pct) => {
    if (pct >= 85) return { label: 'Elite Performer', color: 'text-amber-500', sub: 'Top 5% habit velocity' };
    if (pct >= 65) return { label: 'High Achiever', color: 'text-brand-600 dark:text-brand-400', sub: 'Excellent consistency' };
    if (pct >= 40) return { label: 'Rising Star', color: 'text-sky-600 dark:text-sky-400', sub: 'Building momentum' };
    return { label: 'Getting Started', color: 'text-emerald-600 dark:text-emerald-400', sub: 'Keep going — habits take time!' };
  };
  const tier = getTier(stats.dailyProductivityPercentage);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          Habit Insights
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          In-depth habit performance metrics, completion rates, and streak data
        </p>
      </div>

      {/* Top Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Completion Rate Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Today's Rate
            </span>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
              {stats.dailyProductivityPercentage}
              <span className="text-lg text-gray-400 ml-0.5">%</span>
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats.completedTasks} of {stats.totalTasks} habits done</span>
            </p>
          </div>
          <CircularProgress percentage={stats.dailyProductivityPercentage || 0} size={90} strokeWidth={8} />
        </div>

        {/* Weekly Avg Rate Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Weekly Avg
            </span>
            <h3 className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-outfit">
              {weeklyAvgRate}
              <span className="text-lg text-gray-400 ml-0.5">%</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Avg completion over 7 days
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
            <Calendar className="w-8 h-8" />
          </div>
        </div>

        {/* Monthly Avg Rate Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Monthly Avg
            </span>
            <h3 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-outfit">
              {monthlyAvgRate}
              <span className="text-lg text-gray-400 ml-0.5">%</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Avg completion this month
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Streak + Tier Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streak Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Active Streak
            </span>
            <h3 className="text-3xl font-extrabold text-amber-500 font-outfit">
              {stats.productivityStreak || 0}
              <span className="text-lg text-gray-400 ml-1">days 🔥</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Consecutive days with habit activity
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Achievement Tier Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Productivity Tier
            </span>
            <h3 className={`text-2xl font-extrabold font-outfit ${tier.color}`}>
              {tier.label}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tier.sub}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: Weekly Bar+Line & Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                Weekly Completion
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Habits done (bars) + completion % (line) — last 7 days
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>7 Days</span>
            </div>
          </div>
          <WeeklyChart data={weeklyData} />
        </div>

        {/* Status Pie Chart */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit mb-1">
            Status Breakdown
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Completed vs Pending vs Overdue — with %
          </p>
          <StatusPieChart
            completed={stats.completedTasks}
            pending={stats.pendingTasks}
            overdue={stats.overdueTasks}
          />
        </div>
      </div>

      {/* Main Charts Row 2: Monthly Line Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                Monthly Progress
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed vs Pending + completion % across this month
              </p>
            </div>
          </div>
          <MonthlyChart data={monthlyData} />
        </div>

        {/* Category Breakdown Chart */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                Category Distribution
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Habits spread across your categories
              </p>
            </div>
          </div>
          <CategoryChart data={categoryChartData} />
        </div>
      </div>
    </div>
  );
};
