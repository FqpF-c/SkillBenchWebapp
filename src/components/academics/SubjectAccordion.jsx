import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Clock, Target } from 'lucide-react';

const SubjectAccordion = () => {
  const navigate = useNavigate();
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const subjects = [
    {
      name: 'Biosensors and Transducers',
      units: [
        'Unit 1: Introduction to Biosensors', 
        'Unit 2: Transduction Mechanisms', 
        'Unit 3: Signal Processing'
      ],
      progress: 25,
      totalUnits: 3
    },
    {
      name: 'Communicative English - II',
      units: [
        'Unit 1: Grammar Basics', 
        'Unit 2: Vocabulary Building', 
        'Unit 3: Essay Writing'
      ],
      progress: 60,
      totalUnits: 3
    },
    {
      name: 'Digital System Design',
      units: [
        'Unit 1: Logic Gates', 
        'Unit 2: Sequential Circuits', 
        'Unit 3: Memory Systems'
      ],
      progress: 0,
      totalUnits: 3
    },
    {
      name: 'Electron Devices and Circuits',
      units: [
        'Unit 1: Semiconductor Physics', 
        'Unit 2: Diode Circuits', 
        'Unit 3: Transistor Amplifiers'
      ],
      progress: 40,
      totalUnits: 3
    },
    {
      name: 'Engineering Mathematics - II',
      units: [
        'Unit 1: Differential Equations', 
        'Unit 2: Vector Calculus', 
        'Unit 3: Complex Analysis'
      ],
      progress: 80,
      totalUnits: 3
    }
  ];

  const handleSubjectClick = (index) => {
    setExpandedSubject(expandedSubject === index ? null : index);
  };

  const handleUnitClick = (subject, unit) => {
    const categoryId = encodeURIComponent('Academics');
    const subcategoryName = encodeURIComponent(subject.name);
    const topicName = encodeURIComponent(unit);
    
    navigate(`/topic/${categoryId}/${subcategoryName}/${topicName}`);
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

  return (
    <div className="space-y-6">
      {subjects.map((subject, index) => (
        <div key={index} className="card overflow-hidden hover:shadow-lg transition-all duration-300">
          <button
            onClick={() => handleSubjectClick(index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <h3 className={`font-semibold text-lg mb-2 ${expandedSubject === index ? 'text-secondary' : 'text-gray-900'}`}>
                {subject.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{subject.totalUnits} units</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${getProgressColor(subject.progress)}`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                  <span className={`font-medium ${getProgressColorText(subject.progress)}`}>
                    {subject.progress}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {expandedSubject === index ? (
                <ChevronUp className="text-secondary" size={20} />
              ) : (
                <ChevronDown className="text-gray-400" size={20} />
              )}
            </div>
          </button>

          {expandedSubject === index && (
            <div className="border-t border-gray-100 bg-gray-50/50">
              <div className="p-6 space-y-3">
                <h4 className="font-medium text-gray-900 mb-4">Units</h4>
                {subject.units.map((unit, unitIndex) => (
                  <div
                    key={unitIndex}
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer group border border-gray-100 hover:border-secondary/30"
                    onClick={() => handleUnitClick(subject, unit)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <BookOpen className="text-secondary" size={16} />
                      </div>
                      <span className="text-gray-900 group-hover:text-secondary transition-colors">
                        {unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-gray-500">Start learning</span>
                      <ChevronDown className="text-gray-400 rotate-[-90deg]" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {subjects.length === 0 && (
        <div className="card">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-gray-400" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No subjects available</h3>
            <p className="text-gray-600 text-sm">Select a department to view available subjects</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectAccordion;