import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';
import DepartmentSelector from '../components/academics/DepartmentSelector';
import SubjectAccordion from '../components/academics/SubjectAccordion';

const Academics = () => {
  const [selectionData, setSelectionData] = useState(null);

  const handleSelectionChange = useCallback((data) => {
    setSelectionData(data);
  }, []);

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      {/* Header Section */}
      <motion.div 
        className="px-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative w-full rounded-3xl shadow-xl overflow-hidden bg-gradient-to-r from-[#2E0059] via-[#4B007D] to-[#602769]" style={{ minHeight: '180px' }}>
          {/* Decorative elements */}
          <div className="absolute top-6 right-6 opacity-10">
            <div className="w-16 h-16 border-2 border-white/30 rounded-full"></div>
            <div className="absolute top-1 right-1 w-8 h-8 border-2 border-white/40 rounded-full"></div>
          </div>

          <div className="relative px-6 py-8 h-full flex items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <GraduationCap className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Academics
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                  Explore your curriculum and track your progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 pb-32">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <DepartmentSelector onSelectionChange={handleSelectionChange} />
          </motion.div>
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SubjectAccordion selectionData={selectionData} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Academics;
