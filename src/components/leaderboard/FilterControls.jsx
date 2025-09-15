import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, ChevronDown, Filter } from 'lucide-react';

const FilterControls = ({ 
  timeframe = 'all_time', 
  group = 'All', 
  category = 'All',
  onTimeframeChange,
  onGroupChange, 
  onCategoryChange,
  isLoading = false 
}) => {
  const [filterOptions, setFilterOptions] = useState({
    groups: ['All'],
    categories: ['All']
  });

  const timeframeOptions = [
    { value: 'daily', label: 'Daily', icon: Calendar, description: 'Today' },
    { value: 'weekly', label: 'Weekly', icon: Calendar, description: 'This Week' },
    { value: 'monthly', label: 'Monthly', icon: Calendar, description: 'This Month' },
    { value: 'all_time', label: 'All Time', icon: Calendar, description: 'Since Beginning' }
  ];

  // TODO: Fetch filter options dynamically from LeaderboardService
  useEffect(() => {
    // This would fetch actual organizations and departments from Firestore
    // For now using static data
    setFilterOptions({
      groups: ['All', 'MIT', 'Stanford', 'Harvard', 'Berkeley', 'CMU'],
      categories: ['All', 'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry']
    });
  }, []);

  const FilterDropdown = ({ value, options, onChange, icon: Icon, label, disabled = false }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="appearance-none w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 hover:border-gray-300"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Icon className="text-gray-400" size={18} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 mb-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filter Label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={16} />
            </div>
            <span className="text-gray-700 font-semibold text-sm">Filters:</span>
          </div>

          {/* Filter Controls in horizontal layout */}
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Timeframe Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 flex-shrink-0">Time:</label>
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => onTimeframeChange && onTimeframeChange(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                >
                  {timeframeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Calendar className="text-gray-400" size={14} />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Organization Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 flex-shrink-0">Org:</label>
              <div className="relative">
                <select
                  value={group}
                  onChange={(e) => onGroupChange && onGroupChange(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                >
                  {filterOptions.groups.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Users className="text-gray-400" size={14} />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 flex-shrink-0">Dept:</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                >
                  {filterOptions.categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <BookOpen className="text-gray-400" size={14} />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(timeframe !== 'all_time' || group !== 'All' || category !== 'All') && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={() => {
                    onTimeframeChange && onTimeframeChange('all_time');
                    onGroupChange && onGroupChange('All');
                    onCategoryChange && onCategoryChange('All');
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1 rounded-md hover:bg-purple-50 transition-colors duration-200"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;