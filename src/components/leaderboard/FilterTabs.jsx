import React, { useState } from 'react';
import { Calendar, History, ChevronDown } from 'lucide-react';

const FilterTabs = () => {
  const [activeTab, setActiveTab] = useState('Weekly');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const tabs = [
    { id: 'Weekly', label: 'Weekly', icon: Calendar },
    { id: 'All Time', label: 'All Time', icon: History }
  ];

  return (
    <div className="space-y-4">
      {/* Time Filter Tabs */}
      <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all ${
                activeTab === tab.id
                  ? 'bg-secondary text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
            <span className="text-white/70 text-sm">College</span>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none"
            >
              <option value="All">All</option>
              <option value="Engineering College">Engineering College</option>
            </select>
            <ChevronDown className="text-white/70" size={16} />
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="flex items-center gap-2 p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
            <span className="text-white/70 text-sm">Department</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none"
            >
              <option value="All">All</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
            </select>
            <ChevronDown className="text-white/70" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterTabs;