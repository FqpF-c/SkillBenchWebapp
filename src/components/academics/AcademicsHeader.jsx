import React from 'react';
import { GraduationCap, Building, BookOpen, Users } from 'lucide-react';

const AcademicsHeader = () => {
  const user = {
    college: 'Sri Manakula Vinayagar Engineering College',
    department: 'Mechatronics Engineering',
    semester: 'Semester 4'
  };

  return (
    <div className="gradient-purple rounded-b-[60px] px-6 pt-16 pb-8 mb-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/30 rounded-full animate-pulse"
              style={{
                width: `${(i + 1) * 50}px`,
                height: `${(i + 1) * 50}px`,
                top: '20%',
                right: '20%',
                transform: 'translate(50%, -50%)',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Header Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Academics</h1>
            <p className="text-white/80 text-sm">Continue your academic journey</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <GraduationCap className="text-white" size={32} />
          </div>
        </div>

        {/* College Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Building className="text-accent-pink" size={16} />
            </div>
            <span className="text-sm font-medium opacity-80">College:</span>
            <span className="text-accent-pink text-sm font-semibold flex-1">
              {user.college}
            </span>
          </div>

          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="text-accent-pink" size={16} />
            </div>
            <span className="text-sm font-medium opacity-80">Department:</span>
            <span className="text-accent-pink text-sm font-semibold">
              {user.department}
            </span>
          </div>

          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="text-accent-pink" size={16} />
            </div>
            <span className="text-sm font-medium opacity-80">Current:</span>
            <span className="text-accent-pink text-sm font-semibold">
              {user.semester}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicsHeader;