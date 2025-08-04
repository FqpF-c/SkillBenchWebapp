import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Clock, Target } from 'lucide-react';

const SubjectAccordion = () => {
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
    setSelectedUnit({ subject, unit });
    setShowModeSelector(true);
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-gray-300';
    if (progress < 30) return 'bg-red-400';
    if (progress < 60) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  // Simple ModeSelector Modal
  const ModeSelector = () => {
    if (!showModeSelector) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
        <div className="bg-white rounded-t-3xl w-full max-w-md">
          <div className="flex justify-center pt-4 pb-6">
            <div className="w-12 h-1.5 bg-secondary rounded-full" />
          </div>
          
          <div className="px-6 pb-6">
            <h3 className="text-xl font-bold text-primary mb-4">Select Mode</h3>
            <p className="text-sm text-gray-600 mb-6">{selectedUnit?.unit}</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowModeSelector(false)}
                className="w-full p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="text-green-600" size={20} />
                  <div className="text-left">
                    <h4 className="font-semibold text-green-800">Practice Mode</h4>
                    <p className="text-sm text-green-600">Learn at your own pace</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => setShowModeSelector(false)}
                className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-600" size={20} />
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-800">Test Mode</h4>
                    <p className="text-sm text-blue-600">Timed assessment</p>
                  </div>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowModeSelector(false)}
              className="w-full mt-4 py-3 bg-gray-100 rounded-lg text-gray-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {subjects.map((subject, index) => (
          <div key={index} className="card overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Subject Header */}
            <button
              onClick={() => handleSubjectClick(index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-2 ${expandedSubject === index ? 'text-secondary' : 'text-primary'}`}>
                  {subject.name}
                </h3>
                
                {/* Progress Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-gray-500" size={14} />
                    <span className="text-sm text-gray-600">{subject.totalUnits} units</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 flex-1 max-w-32">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(subject.progress)}`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{subject.progress}%</span>
                  </div>
                </div>
              </div>
              
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                expandedSubject === index ? 'bg-secondary/10 rotate-180' : 'bg-gray-100'
              }`}>
                <ChevronDown className={`${expandedSubject === index ? 'text-secondary' : 'text-gray-600'}`} size={20} />
              </div>
            </button>

            {/* Expanded Units */}
            {expandedSubject === index && (
              <div className="px-6 pb-6">
                {/* Divider */}
                <div className="w-full h-px bg-gray-200 mb-6" />
                
                {/* Units List */}
                <div className="space-y-4">
                  {subject.units.map((unit, unitIndex) => (
                    <div
                      key={unitIndex}
                      onClick={() => handleUnitClick(subject.name, unit)}
                      className="group p-4 bg-background-section rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-secondary/30 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform" />
                          <h4 className="font-medium text-primary group-hover:text-secondary transition-colors">
                            {unit}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Unit Progress */}
                          <div className="w-24 bg-white rounded-full h-2 overflow-hidden shadow-sm">
                            <div 
                              className="bg-secondary h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.random() * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-primary min-w-[2rem]">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                          
                          {/* Start Button */}
                          <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary hover:text-white text-secondary rounded-lg text-sm font-medium transition-all duration-300">
                            Start
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Subject Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900 text-sm">Subject Progress</h5>
                      <p className="text-gray-600 text-xs">
                        {Math.floor(subject.progress / 33)} of {subject.totalUnits} units completed
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-secondary">{subject.progress}%</span>
                      <p className="text-xs text-gray-600">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ModeSelector />
    </>
  );
};

export default SubjectAccordion;