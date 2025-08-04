import React from 'react';
import { ChevronRight, Play, BookOpen, Clock, Code } from 'lucide-react';

const OngoingPrograms = () => {
  const programs = [
    { 
      name: 'Web Development', 
      progress: 75, 
      color: 'bg-orange-500',
      gradient: 'from-orange-400 to-orange-600',
      lessons: 12,
      totalLessons: 16,
      timeLeft: '2h 30m',
      icon: Code
    },
    { 
      name: 'Data Structures', 
      progress: 62, 
      color: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600',
      lessons: 8,
      totalLessons: 13,
      timeLeft: '4h 15m',
      icon: BookOpen
    },
    { 
      name: 'JavaScript', 
      progress: 88, 
      color: 'bg-yellow-500',
      gradient: 'from-yellow-400 to-yellow-600',
      lessons: 15,
      totalLessons: 17,
      timeLeft: '1h 45m',
      icon: Code
    },
    { 
      name: 'React', 
      progress: 45, 
      color: 'bg-cyan-500',
      gradient: 'from-cyan-400 to-cyan-600',
      lessons: 9,
      totalLessons: 20,
      timeLeft: '6h 20m',
      icon: Code
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ongoing Programs</h2>
          <p className="text-sm text-gray-500">Continue your learning journey</p>
        </div>
        <button className="text-purple-600 font-medium flex items-center gap-1 hover:text-purple-700 transition-colors group">
          View all 
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {programs.map((program, index) => {
          const Icon = program.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${program.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{program.timeLeft} left</p>
                    <p className="text-xs text-gray-400">{program.lessons}/{program.totalLessons} lessons</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-3 group-hover:text-purple-700 transition-colors">
                  {program.name}
                </h3>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`bg-gradient-to-r ${program.gradient} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${program.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{program.progress}% Complete</span>
                  <button className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                    <Play size={14} />
                    Continue
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OngoingPrograms;