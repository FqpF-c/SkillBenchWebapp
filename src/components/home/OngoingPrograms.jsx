import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Clock, Award, ChevronRight } from 'lucide-react';

const OngoingPrograms = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOngoingPrograms();
  }, []);

  const loadOngoingPrograms = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPrograms = [
        {
          name: 'React Components',
          category: 'Web Development',
          subcategory: 'Frontend Frameworks',
          progress: 75,
          lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalHours: 12,
          bestScore: 85,
          color: 'from-blue-400 to-blue-600'
        },
        {
          name: 'Python Basics',
          category: 'Programming Language',
          subcategory: 'Backend Development',
          progress: 45,
          lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalHours: 8,
          bestScore: 72,
          color: 'from-green-400 to-green-600'
        },
        {
          name: 'MongoDB Queries',
          category: 'Database',
          subcategory: 'NoSQL Databases',
          progress: 60,
          lastStudied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          totalHours: 15,
          bestScore: 91,
          color: 'from-emerald-400 to-emerald-600'
        },
        {
          name: 'Flutter Widgets',
          category: 'App Development',
          subcategory: 'Mobile Development',
          progress: 30,
          lastStudied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          totalHours: 6,
          bestScore: 68,
          color: 'from-purple-400 to-purple-600'
        },
        {
          name: 'AWS Lambda',
          category: 'Cloud Computing',
          subcategory: 'Serverless Computing',
          progress: 85,
          lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalHours: 20,
          bestScore: 94,
          color: 'from-orange-400 to-orange-600'
        }
      ];
      
      setPrograms(mockPrograms);
    } catch (error) {
      console.error('Error loading ongoing programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgramClick = (program) => {
    const categoryId = encodeURIComponent(program.category);
    const subcategoryName = encodeURIComponent(program.subcategory);
    const topicName = encodeURIComponent(program.name);
    
    navigate(`/topic/${categoryId}/${subcategoryName}/${topicName}`);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Ongoing Programs</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                  <div className="w-16 h-6 bg-gray-300 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-5 bg-gray-300 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ongoing Programs</h2>
          <p className="text-gray-600 mt-1">Continue where you left off</p>
        </div>
        <button className="btn btn-secondary text-sm px-4 py-2">
          View All
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="card">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="text-gray-400" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No ongoing programs</h3>
            <p className="text-gray-600 text-sm">Start learning to see your progress here</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <div
              key={index}
              className="card hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-secondary/30"
              onClick={() => handleProgramClick(program)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${program.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Play className="text-white" size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {program.progress}%
                    </span>
                    <ChevronRight className="text-gray-400 group-hover:text-secondary group-hover:translate-x-1 transition-all" size={16} />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-secondary transition-colors">
                  {program.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{program.category}</p>

                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${program.color} rounded-full transition-all duration-500`}
                      style={{ width: `${program.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{program.totalHours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award size={12} />
                      <span>{program.bestScore}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(program.lastStudied)}
                    </span>
                    <button className="btn btn-ghost text-xs px-3 py-1.5 hover:bg-secondary hover:text-white group-hover:bg-secondary group-hover:text-white transition-all">
                      Continue
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
            </div>
          ))}
        </div>
      )}

      <div className="card gradient-soft border-0">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-secondary" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Keep Learning</h4>
              <p className="text-sm text-gray-600">Consistency is key to mastering new skills</p>
            </div>
          </div>
          <button className="btn btn-secondary text-sm px-4 py-2">
            Start New
          </button>
        </div>
      </div>
    </div>
  );
};

export default OngoingPrograms;