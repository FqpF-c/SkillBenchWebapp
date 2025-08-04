import React from 'react';
import { ChevronRight, Play, BookOpen, Clock } from 'lucide-react';

const OngoingPrograms = () => {
  const programs = [
    { 
      name: 'HTML', 
      progress: 75, 
      color: 'bg-orange-500',
      gradient: 'from-orange-400 to-orange-600',
      lessons: 12,
      totalLessons: 16,
      timeLeft: '2h 30m'
    },
    { 
      name: 'CSS', 
      progress: 62, 
      color: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600',
      lessons: 8,
      totalLessons: 13,
      timeLeft: '4h 15m'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ongoing Programs</h2>
          <p className="text-sm text-gray-500">Continue your learning journey</p>
        </div>
        <button className="text-secondary font-medium flex items-center gap-1 hover:text-secondary-dark transition-colors group">
          View all 
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {programs.map((program, index) => (
          <div key={index} className="card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
            <div className="p-5">
              {/* Program Icon and Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${program.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white font-bold text-xl">
                    {program.name.charAt(0)}
                  </span>
                </div>
                <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-all duration-300 group-hover:scale-110">
                  <Play size={16} />
                </button>
              </div>

              {/* Program Title */}
              <h3 className="font-semibold text-gray-900 text-lg mb-3">{program.name}</h3>

              {/* Progress Section */}
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full progress-bar h-2">
                    <div 
                      className="progress-fill h-2"
                      style={{ 
                        width: `${program.progress}%`,
                        background: `linear-gradient(90deg, ${program.color.replace('bg-', '#')}, ${program.color.replace('bg-', '#')}dd)`
                      }}
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 text-xs font-bold text-secondary">
                    {program.progress}%
                  </span>
                </div>

                {/* Progress Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <BookOpen size={14} />
                    <span>{program.lessons}/{program.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock size={14} />
                    <span>{program.timeLeft}</span>
                  </div>
                </div>

                {/* Continue Button */}
                <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-secondary hover:to-secondary-light text-gray-700 hover:text-white rounded-xl font-medium transition-all duration-300 hover:shadow-md">
                  Continue Learning
                </button>
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-accent-light to-accent-pink/50 border-0">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
              <Play className="text-secondary" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Quick Practice</h4>
              <p className="text-sm text-gray-600">5-minute coding challenge</p>
            </div>
          </div>
          <button className="btn btn-secondary text-sm px-4 py-2">
            Start Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OngoingPrograms;