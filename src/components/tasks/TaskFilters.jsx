import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export const TaskFilters = () => {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    categories,
  } = useTasks();

  const statuses = ['All', 'Pending', 'Completed'];
  const priorities = ['All', 'Low', 'Medium', 'High'];

  return (
    <div className="space-y-4 mb-6">
      {/* Search Input Bar (on smaller screens) */}
      <div className="sm:hidden relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Primary Status Filters & Dropdown Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Secondary Dropdown Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Priority Select */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
            >
              {priorities.map((p) => (
                <option key={p} value={p} className="dark:bg-gray-800 text-gray-900 dark:text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="dark:bg-gray-800 text-gray-900 dark:text-white">
                All
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c.name} className="dark:bg-gray-800 text-gray-900 dark:text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="priority" className="dark:bg-gray-800 text-gray-900 dark:text-white">
                Priority
              </option>
              <option value="title" className="dark:bg-gray-800 text-gray-900 dark:text-white">
                Title
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
