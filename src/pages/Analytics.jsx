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
  CheckCircle,
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
    const count = tasks.filter((t) => t.category === cat.name).length;
    return {
      name: cat.name,
      count,
      color: cat.color || '#6366f1',
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          Productivity Insights
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          In-depth data visualizations and task completion performance metrics
        </p>
      </div>

      {/* Top Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Completion Indicator Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Completion Rate
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white font-outfit">
              {stats.dailyProductivityPercentage}%
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Higher than last week</span>
            </p>
          </div>
          <CircularProgress percentage={stats.dailyProductivityPercentage || 0} size={90} strokeWidth={8} />
        </div>

        {/* Streak Insight Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Active Streak
            </span>
            <h3 className="text-2xl font-extrabold text-amber-500 font-outfit">
              {stats.productivityStreak || 0} Days
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Daily task completions unbroken
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Achievement Status Card */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Productivity Tier
            </span>
            <h3 className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 font-outfit">
              High Achiever
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Top 5% task velocity
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: Weekly Area & Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                Weekly Completion Progress
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Number of completed tasks per day over the last 7 days
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
            Completed vs Pending vs Overdue
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
                Monthly Task Volume
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed vs Pending task velocity across current month
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
                Category Productivity
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Distribution of tasks across custom category tags
              </p>
            </div>
          </div>
          <CategoryChart data={categoryChartData} />
        </div>
      </div>
    </div>
  );
};
