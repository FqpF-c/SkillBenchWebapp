import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Code, Smartphone, Database, Cloud, Zap } from 'lucide-react';

const TechnologiesSection = () => {
  const navigate = useNavigate();

  const technologies = [
    {
      name: 'JavaScript',
      category: 'Programming Language',
      subcategory: 'Frontend Development',
      progress: 75,
      difficulty: 'Intermediate',
      icon: Code,
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      name: 'React',
      category: 'Web Development',
      subcategory: 'Frontend Frameworks',
      progress: 60,
      difficulty: 'Intermediate',
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Python',
      category: 'Programming Language',
      subcategory: 'Backend Development',
      progress: 45,
      difficulty: 'Beginner',
      icon: Code,
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Flutter',
      category: 'App Development',
      subcategory: 'Mobile Development',
      progress: 30,
      difficulty: 'Beginner',
      icon: Smartphone,
      color: 'from-purple-400 to-purple-600'
    },
    {
      name: 'MongoDB',
      category: 'Database',
      subcategory: 'NoSQL Databases',
      progress: 80,
      difficulty: 'Advanced',
      icon: Database,
      color: 'from-green-500 to-green-700'
    },
    {
      name: 'AWS',
      category: 'Cloud Computing',
      subcategory: 'Cloud Services',
      progress: 25,
      difficulty: 'Beginner',
      icon: Cloud,
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const featuredSkills = [
    'Machine Learning', 'DevOps', 'UI/UX Design', 'Blockchain', 
    'Cybersecurity', 'Data Science', 'API Development', 'Testing'
  ];

  const handleTopicClick = (tech) => {
    const categoryId = encodeURIComponent(tech.category);
    const subcategoryName = encodeURIComponent(tech.subcategory);
    const topicName = encodeURIComponent(tech.name);
    
    navigate(`/topic/${categoryId}/${subcategoryName}/${topicName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Technologies</h2>
          <p className="text-gray-600 mt-1">Explore and master various programming technologies</p>
        </div>
        <button className="btn btn-secondary text-sm px-4 py-2">
          View All
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {technologies.map((tech, index) => {
          const IconComponent = tech.icon;
          
          return (
            <div 
              key={index} 
              className="card hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-secondary/30"
              onClick={() => handleTopicClick(tech)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${tech.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white" size={20} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    tech.difficulty === 'Advanced' 
                      ? 'bg-red-100 text-red-700'
                      : tech.difficulty === 'Intermediate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {tech.difficulty}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-secondary transition-colors">
                  {tech.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{tech.category}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{tech.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${tech.color} rounded-full transition-all duration-500`}
                      style={{ width: `${tech.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">{tech.subcategory}</span>
                  <button className="btn btn-ghost text-sm px-4 py-2 hover:bg-secondary hover:text-white group-hover:bg-secondary group-hover:text-white transition-all">
                    Explore
                  </button>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
            </div>
          );
        })}
      </div>

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