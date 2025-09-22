import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Building, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AcademicsService } from '../../services/AcademicsService';

const DepartmentSelector = ({ onSelectionChange }) => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  
  // Dynamic data from Firebase
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [semestersLoading, setSemestersLoading] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user?.college) {
        setDepartmentsLoading(false);
        return;
      }

      try {
        setDepartmentsLoading(true);
        const departmentsList = await AcademicsService.getDepartments(user.college);
        setDepartments(departmentsList);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, [user?.college]);

  // Fetch semesters when department changes
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!user?.college || !selectedDepartment) {
        setSemesters([]);
        return;
      }

      try {
        setSemestersLoading(true);
        const semestersList = await AcademicsService.getSemesters(user.college, selectedDepartment);
        setSemesters(semestersList);
      } catch (error) {
        console.error('Error fetching semesters:', error);
        setSemesters([]);
      } finally {
        setSemestersLoading(false);
      }
    };

    fetchSemesters();
  }, [user?.college, selectedDepartment]);

  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        department: selectedDepartment,
        semester: selectedSemester,
        collegeId: user?.college
      });
    }
  }, [selectedDepartment, selectedSemester, user?.college]);

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
    setSelectedSemester(''); // Reset semester when department changes
    setIsDepartmentOpen(false);
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
    setIsSemesterOpen(false);
  };

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 space-y-6 hover:shadow-purple-500/10 transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Building className="text-white w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Department & Semester
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Department Selector */}
        <div className="relative">
          <motion.button
            onClick={() => setIsDepartmentOpen(!isDepartmentOpen)}
            className="w-full flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 hover:border-purple-400/50 hover:bg-white/70 transition-all duration-300 hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
              <Building className="text-purple-600" size={18} />
            </div>
            <span className={`flex-1 text-left font-medium ${selectedDepartment ? 'text-gray-900' : 'text-gray-500'}`}>
              {departmentsLoading ? 'Loading departments...' : (selectedDepartment || 'Choose department')}
            </span>
            {departmentsLoading && (
              <Loader2 className="text-purple-600 animate-spin" size={16} />
            )}
            <motion.div
              animate={{ rotate: isDepartmentOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="text-purple-600" size={20} />
            </motion.div>
          </motion.button>

          {/* Department Dropdown */}
          <AnimatePresence>
            {isDepartmentOpen && !departmentsLoading && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50 overflow-hidden"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  duration: 0.3
                }}
              >
                {departments.length > 0 ? (
                  departments.map((dept, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleDepartmentSelect(dept)}
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/30 transition-all duration-300 border-b border-gray-100/50 last:border-b-0 group relative overflow-hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                      whileHover={{
                        x: 6,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Hover background gradient */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Text with enhanced styling */}
                      <motion.span
                        className="relative z-10 text-gray-700 group-hover:text-purple-600 font-medium transition-colors duration-300"
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {dept}
                      </motion.span>

                      {/* Subtle arrow indicator */}
                      <motion.div
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 opacity-0 group-hover:opacity-100"
                        initial={{ x: -10, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        →
                      </motion.div>
                    </motion.button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No departments found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Semester Selector */}
        {selectedDepartment && (
          <motion.div 
            className="relative"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={() => setIsSemesterOpen(!isSemesterOpen)}
              className="w-full flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 hover:border-purple-400/50 hover:bg-white/70 transition-all duration-300 hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="text-purple-600" size={18} />
              </div>
              <span className={`flex-1 text-left font-medium ${selectedSemester ? 'text-gray-900' : 'text-gray-500'}`}>
                {semestersLoading ? 'Loading semesters...' : (selectedSemester || 'Choose semester')}
              </span>
              {semestersLoading && (
                <Loader2 className="text-purple-600 animate-spin" size={16} />
              )}
              <motion.div
                animate={{ rotate: isSemesterOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="text-purple-600" size={20} />
              </motion.div>
            </motion.button>

            {/* Semester Dropdown */}
            <AnimatePresence>
              {isSemesterOpen && !semestersLoading && (
                <motion.div 
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50 overflow-hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {semesters.length > 0 ? (
                    semesters.map((semester, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSemesterSelect(semester)}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50/50 transition-colors border-b border-gray-100/50 last:border-b-0 group"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-gray-700 group-hover:text-purple-600 font-medium transition-colors">{semester}</span>
                      </motion.button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      No semesters found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedDepartment && selectedSemester && (
        <motion.div 
          className="mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 backdrop-blur-sm rounded-2xl border border-purple-200/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Selected Configuration</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Department:</span> {selectedDepartment}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Semester:</span> {selectedSemester}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DepartmentSelector;