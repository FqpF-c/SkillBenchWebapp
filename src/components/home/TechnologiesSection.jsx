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
      name: 'General Skills', 
      icon: Wrench,
      description: 'Problem solving & logic',
      courses: 8,
      difficulty: 'Intermediate',
      rating: 4.6,
      students: '1.8k',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const featuredSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Data Structures'
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Technologies</h2>
          <p className="text-sm text-gray-500">Explore different learning paths</p>
        </div>
        <button className="text-secondary font-medium hover:text-secondary-dark transition-colors group flex items-center gap-1">
          View all
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Technologies Cards */}
      <div className="space-y-4">
        {technologies.map((tech, index) => (
          <div
            key={index}
            className={`card hover:shadow-lg transition-all duration-300 cursor-pointer group ${tech.borderColor} border-2 hover:border-secondary/50`}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${tech.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <tech.icon className={`${tech.color}`} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-secondary transition-colors">
                      {tech.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{tech.description}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-secondary group-hover:translate-x-1 transition-all" size={20} />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Award className="text-gray-500" size={14} />
                    <span className="text-gray-600">{tech.courses} courses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="text-gray-500" size={14} />
                    <span className="text-gray-600">{tech.students} students</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-500 fill-current" size={14} />
                  <span className="text-gray-700 font-medium">{tech.rating}</span>
                </div>
              </div>

              {/* Difficulty Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tech.difficulty === 'Beginner' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {tech.difficulty}
                </span>
                <button className="btn btn-ghost text-sm px-4 py-2 hover:bg-secondary hover:text-white">
                  Explore
                </button>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
          </div>
        ))}
      </div>

      {/* Featured Skills Section */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-0">
        <div className="p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Trending Skills</h3>
          <div className="flex flex-wrap gap-2">
            {featuredSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:border-secondary hover:text-secondary transition-colors cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Path Suggestion */}
      <div className="card gradient-soft border-0">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <Star className="text-secondary" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Recommended for you</h4>
              <p className="text-sm text-gray-600">Based on your progress</p>
            </div>
          </div>
          <button className="btn btn-secondary text-sm px-4 py-2">
            View Path
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnologiesSection;