import React from 'react';

export const TaskSkeleton = () => (
  <div className="p-4 rounded-2xl glass-card border animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
    </div>
    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg" />
    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
    <div className="flex items-center justify-between pt-2">
      <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded-md" />
      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-full" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="p-5 rounded-2xl glass-card border animate-pulse flex items-center justify-between">
    <div className="space-y-2">
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
      <div className="h-7 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
    </div>
    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
  </div>
);
