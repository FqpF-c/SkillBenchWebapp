import React, { useState } from 'react';
import { ChevronDown, Building, Calendar } from 'lucide-react';

const DepartmentSelector = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const departments = [
    'Biomedical Engineering',
    'Computer Science Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  const semesters = [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
    'Semester 6',
    'Semester 7',
    'Semester 8'
  ];

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
    setIsDepartmentOpen(false);
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
    setIsSemesterOpen(false);
  };

  return (
    <div className="card p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">Department & Semester</h3>
      
      <div className="space-y-4">
        {/* Department Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDepartmentOpen(!isDepartmentOpen)}
            className="w-full flex items-center gap-3 p-4 bg-background-section rounded-xl border border-gray-200 hover:border-secondary/50 transition-colors"
          >
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Building className="text-secondary" size={16} />
            </div>
            <span className={`flex-1 text-left font-medium ${selectedDepartment ? 'text-primary' : 'text-gray-500'}`}>
              {selectedDepartment || 'Choose department'}
            </span>
            <ChevronDown 
              className={`text-secondary transition-transform duration-300 ${isDepartmentOpen ? 'rotate-180' : ''}`} 
              size={20} 
            />
          </button>

          {/* Department Dropdown */}
          {isDepartmentOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
              {departments.map((dept, index) => (
                <button
                  key={index}
                  onClick={() => handleDepartmentSelect(dept)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary/5 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-primary font-medium">{dept}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Semester Selector */}
        {selectedDepartment && (
          <div className="relative">
            <button
              onClick={() => setIsSemesterOpen(!isSemesterOpen)}
              className="w-full flex items-center gap-3 p-4 bg-background-section rounded-xl border border-gray-200 hover:border-secondary/50 transition-colors"
            >
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-secondary" size={16} />
              </div>
              <span className={`flex-1 text-left font-medium ${selectedSemester ? 'text-primary' : 'text-gray-500'}`}>
                {selectedSemester || 'Choose semester'}
              </span>
              <ChevronDown 
                className={`text-secondary transition-transform duration-300 ${isSemesterOpen ? 'rotate-180' : ''}`} 
                size={20} 
              />
            </button>

            {/* Semester Dropdown */}
            {isSemesterOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                {semesters.map((semester, index) => (
                  <button
                    key={index}
                    onClick={() => handleSemesterSelect(semester)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary/5 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-primary font-medium">{semester}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedDepartment && selectedSemester && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Selected Configuration</h4>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs">
              <span className="font-medium">Department:</span> {selectedDepartment}
            </p>
            <p className="text-gray-600 text-xs">
              <span className="font-medium">Semester:</span> {selectedSemester}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSelector;