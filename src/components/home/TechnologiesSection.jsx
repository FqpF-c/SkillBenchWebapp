import React from 'react';
import { Code, Wrench, ChevronRight, Star, Users, Award } from 'lucide-react';

const TechnologiesSection = () => {
  const technologies = [
    { 
      name: 'Web Development', 
      icon: Code,
      description: 'Frontend & Backend skills',
      courses: 12,
      difficulty: 'Beginner',
      rating: 4.8,
      students: '2.4k',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      name: 'Data Structures', 
      icon: Wrench,
      description: 'Algorithms & problem solving',
      courses: 15,
      difficulty: 'Intermediate',
      rating: 4.9,
      students: '3.1k',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      name: 'Machine Learning', 
      icon: Code,
      description: 'AI & data science fundamentals',
      courses: 8,
      difficulty: 'Advanced',
      rating: 4.7,
      students: '1.8k',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      name: 'Mobile Development', 
      icon: Wrench,
      description: 'iOS & Android apps',
      courses: 10,
      difficulty: 'Intermediate',
      rating: 4.6,
      students: '2.2k',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const featuredSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Data Structures', 'Flutter', 'Java', 'C++'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Technologies</h2>
          <p className="text-sm text-gray-500">Explore different learning paths</p>
        </div>
        <button className="text-purple-600 font-medium hover:text-purple-700 transition-colors group flex items-center gap-1">
          View all
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {technologies.map((tech, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl shadow-sm border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group ${tech.borderColor} hover:border-purple-300`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${tech.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <tech.icon className={`${tech.color}`} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">
                      {tech.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{tech.description}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-4">
                  <span>{tech.courses} courses</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span>{tech.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{tech.students}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  tech.difficulty === 'Beginner' 
                    ? 'bg-green-100 text-green-700' 
                    : tech.difficulty === 'Advanced'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {tech.difficulty}
                </span>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 py-2 px-4 rounded-xl font-medium hover:from-purple-100 hover:to-pink-100 transition-all duration-200">
                Explore Courses
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Trending Skills</h3>
        <div className="flex flex-wrap gap-2">
          {featuredSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:border-purple-300 hover:text-purple-700 transition-colors cursor-pointer"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-semibold">Recommended for you</h4>
              <p className="text-sm text-purple-100">Based on your progress</p>
            </div>
          </div>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-xl font-medium hover:bg-purple-50 transition-colors">
            View Path
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnologiesSection;