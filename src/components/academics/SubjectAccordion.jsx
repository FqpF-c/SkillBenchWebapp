import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Clock, Target, Play, Award, Loader2, Zap, Trophy } from 'lucide-react';
import { AcademicsService } from '../../services/AcademicsService';
import QuizService from '../../services/QuizService';

const SubjectAccordion = ({ selectionData }) => {
  const navigate = useNavigate();
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Fetch subjects when selection changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectionData?.collegeId || !selectionData?.department || !selectionData?.semester) {
        setSubjects([]);
        return;
      }

      try {
        setLoading(true);
        const subjectsList = await AcademicsService.getSubjects(
          selectionData.collegeId,
          selectionData.department,
          selectionData.semester
        );
        
        // Convert subject names to objects with units
        const subjectsWithUnits = await Promise.all(
          subjectsList.map(async (subjectName) => {
            try {
              const units = await AcademicsService.getUnits(
                selectionData.collegeId,
                selectionData.department,
                selectionData.semester,
                subjectName
              );
              return {
                name: subjectName,
                units: units,
                totalUnits: units.length,
                progress: Math.floor(Math.random() * 101) // Placeholder progress
              };
            } catch (error) {
              console.error(`Error fetching units for subject ${subjectName}:`, error);
              return {
                name: subjectName,
                units: [],
                totalUnits: 0,
                progress: 0
              };
            }
          })
        );
        
        setSubjects(subjectsWithUnits);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [selectionData]);

  const handleSubjectClick = (index) => {
    setExpandedSubject(expandedSubject === index ? null : index);
  };

  const handleUnitClick = (subject, unit) => {
    setSelectedUnit({ subject, unit });
    setShowModeSelector(true);
  };

  const handleModeSelection = async (mode) => {
    if (!selectedUnit || !selectionData) return;

    try {
      setGeneratingQuestions(true);
      setShowModeSelector(false);

      // Generate questions using QuizService
      const generatedQuestions = await QuizService.generateAcademicQuestions({
        college: selectionData.collegeId,
        department: selectionData.department,
        semester: selectionData.semester,
        subject: selectedUnit.subject.name,
        unit: selectedUnit.unit,
        count: mode === 'test' ? 20 : 15,
        setCount: 0,
        mode: mode
      });

      // Navigate to quiz screen with generated questions
      const navigationState = {
        questions: generatedQuestions,
        mode: mode,
        topicName: `${selectedUnit.subject.name} - ${selectedUnit.unit}`,
        department: selectionData.department,
        semester: selectionData.semester,
        college: selectionData.collegeId,
        metadata: {
          collegeId: selectionData.collegeId,
          department: selectionData.department,
          semester: selectionData.semester,
          subject: selectedUnit.subject.name,
          unit: selectedUnit.unit
        }
      };

      if (mode === 'practice') {
        navigate('/infinite-practice-mode', { state: navigationState });
      } else {
        navigate('/test-mode-screen', { state: navigationState });
      }

    } catch (error) {
      console.error('Error generating questions:', error);
      // You could show an error toast here
      alert('Failed to generate questions. Please try again.');
    } finally {
      setGeneratingQuestions(false);
      setSelectedUnit(null);
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-gray-300';
    if (progress < 30) return 'bg-red-400';
    if (progress < 60) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getProgressColorText = (progress) => {
    if (progress === 0) return 'text-gray-500';
    if (progress < 30) return 'text-red-600';
    if (progress < 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex items-center gap-6 ml-15">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="w-24 h-3 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Loading Overlay for Question Generation */}
      {generatingQuestions && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center max-w-sm mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="text-white animate-spin" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Questions</h3>
            <p className="text-gray-600 text-sm">Please wait while we create your personalized quiz...</p>
          </motion.div>
        </motion.div>
      )}

      {/* Mode Selection Modal */}
      <AnimatePresence>
        {showModeSelector && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModeSelector(false)}
          >
            <motion.div 
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Quiz Mode</h3>
              <p className="text-gray-600 mb-6">
                {selectedUnit && `Select how you want to study "${selectedUnit.unit}"`}
              </p>
              
              <div className="space-y-3">
                <motion.button
                  onClick={() => handleModeSelection('practice')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Practice Mode</div>
                    <div className="text-sm opacity-90">Learn with instant feedback</div>
                  </div>
                </motion.button>
                
                <motion.button
                  onClick={() => handleModeSelection('test')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-2xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trophy className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Test Mode</div>
                    <div className="text-sm opacity-90">Challenge yourself with timed questions</div>
                  </div>
                </motion.button>
              </div>
              
              <button
                onClick={() => setShowModeSelector(false)}
                className="mt-4 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {subjects.map((subject, index) => (
        <motion.div 
          key={index} 
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:shadow-purple-500/10 transition-all duration-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.button
            onClick={() => handleSubjectClick(index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/50 transition-colors"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  expandedSubject === index 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                }`}>
                  <BookOpen className={expandedSubject === index ? 'text-white' : 'text-purple-600'} size={20} />
                </div>
                <h3 className={`font-semibold text-lg ${
                  expandedSubject === index 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' 
                    : 'text-gray-900'
                }`}>
                  {subject.name}
                </h3>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600 ml-15">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-purple-500" />
                  <span className="font-medium">{subject.totalUnits} units</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${getProgressColor(subject.progress)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  <span className={`font-bold ${getProgressColorText(subject.progress)}`}>
                    {subject.progress}%
                  </span>
                </div>
              </div>
            </div>
            <motion.div 
              className="flex items-center gap-2"
              animate={{ rotate: expandedSubject === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className={expandedSubject === index ? 'text-purple-600' : 'text-gray-400'} size={24} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSubject === index && (
              <motion.div 
                className="border-t border-white/30 bg-white/30 backdrop-blur-sm"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Award className="text-white" size={16} />
                    </div>
                    <h4 className="font-semibold text-gray-900">Course Units</h4>
                  </div>
                  {subject.units.map((unit, unitIndex) => (
                    <motion.div
                      key={unitIndex}
                      className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-white/40 hover:border-purple-300/50"
                      onClick={() => handleUnitClick(subject, unit)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: unitIndex * 0.1 }}
                      whileHover={{ scale: 1.02, x: 8 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 group-hover:from-purple-500 group-hover:to-pink-500 rounded-xl flex items-center justify-center transition-all duration-300">
                          <Play className="text-purple-600 group-hover:text-white" size={16} />
                        </div>
                        <span className="text-gray-900 group-hover:text-purple-600 transition-colors font-medium">
                          {unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="text-xs text-purple-600 font-medium">Start learning</span>
                        <ChevronDown className="text-purple-600 rotate-[-90deg]" size={16} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {subjects.length === 0 && (
        <motion.div 
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-12 text-center">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BookOpen className="text-purple-500" size={28} />
            </motion.div>
            <motion.h3 
              className="font-semibold text-gray-900 mb-3 text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              No subjects available
            </motion.h3>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Select a department and semester to view available subjects
            </motion.p>
          </div>
        </motion.div>
      )}
      </div>
    </>
  );
};

export default SubjectAccordion;