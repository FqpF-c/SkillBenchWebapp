// src/components/home/OngoingPrograms.jsx - Updated with Firebase Progress Integration
import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, BookOpen, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { firebasePrepService } from '../../services/firebasePrepService';

const OngoingPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOngoingPrograms();
  }, []);

  const loadOngoingPrograms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading ongoing programs from Firebase...');
      
      // Load Firebase prep data
      const prepData = await firebasePrepService.loadAllPrepData();
      
      // For demo purposes, we'll create some mock progress data
      // In a real app, you'd load this
      // src/components/home/OngoingPrograms.jsx - Continued
      // For demo purposes, we'll create some mock progress data
      // In a real app, you'd load this from user's progress in Firebase Realtime Database
      const mockProgressData = await loadUserProgress();
      
      // Transform Firebase data into ongoing programs
      const ongoingPrograms = [];
      
      // Process each category that has progress
      Object.entries(prepData.categoryItems).forEach(([categoryId, items]) => {
        const displayName = prepData.displayTitles[categoryId] || categoryId;
        
        // Check if user has progress in this category
        items.forEach((item, index) => {
          // Simulate some programs having progress
          if (index < 3) { // Show first 3 items from each category as ongoing
            const mockProgress = 45 + (index * 15) + Math.random() * 20; // 45-80% progress
            const totalLessons = 10 + Math.floor(Math.random() * 15); // 10-25 lessons
            const completedLessons = Math.floor((mockProgress / 100) * totalLessons);
            const timeLeft = `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 59)}m`;
            
            ongoingPrograms.push({
              id: `${categoryId}_${item.name}`,
              name: item.name,
              categoryName: displayName,
              progress: Math.round(mockProgress),
              color: item.color || firebasePrepService.getColorForTopic(item.name),
              gradient: getGradientForColor(item.color || firebasePrepService.getColorForTopic(item.name)),
              lessons: completedLessons,
              totalLessons: totalLessons,
              timeLeft: timeLeft,
              iconAsset: item.iconAsset || firebasePrepService.getAssetForTopic(item.name),
              lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              categoryId: categoryId,
              subcategory: item.name
            });
          }
        });
      });
      
      // Sort by progress (highest first) and take top 6
      const sortedPrograms = ongoingPrograms
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 6);
      
      setPrograms(sortedPrograms);
      console.log('Ongoing programs loaded:', sortedPrograms);
      
    } catch (err) {
      console.error('Error loading ongoing programs:', err);
      setError(err.message);
      
      // Fallback to static data if Firebase fails
      setPrograms(getStaticPrograms());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to simulate loading user progress
  // In real app, this would query Firebase Realtime Database: /skillbench/progress/{userId}
  const loadUserProgress = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock progress data
    return {
      'programming_language_c': { progress: 75, lastUpdated: Date.now() },
      'programming_language_python': { progress: 62, lastUpdated: Date.now() },
      'web_development_react': { progress: 45, lastUpdated: Date.now() },
      'cloud_computing_aws': { progress: 30, lastUpdated: Date.now() }
    };
  };

  // Helper function to convert hex color to gradient
  const getGradientForColor = (hexColor) => {
    const colorMap = {
      '#5C6BC0': 'from-indigo-400 to-indigo-600',
      '#42A5F5': 'from-blue-400 to-blue-600',
      '#EF5350': 'from-red-400 to-red-600',
      '#66BB6A': 'from-green-400 to-green-600',
      '#AB47BC': 'from-purple-400 to-purple-600',
      '#FF7043': 'from-orange-400 to-orange-600',
      '#29B6F6': 'from-cyan-400 to-cyan-600',
      '#26C6DA': 'from-teal-400 to-teal-600',
      '#26A69A': 'from-emerald-400 to-emerald-600',
      '#FF9800': 'from-amber-400 to-amber-600',
      '#4285F4': 'from-blue-500 to-blue-700',
      '#0078D4': 'from-sky-400 to-sky-600',
    };
    
    return colorMap[hexColor] || 'from-gray-400 to-gray-600';
  };

  // Fallback static data
  const getStaticPrograms = () => [
    { 
      id: 'html_static',
      name: 'HTML', 
      categoryName: 'Web Development',
      progress: 75, 
      color: '#E34F26',
      gradient: 'from-orange-400 to-orange-600',
      lessons: 12,
      totalLessons: 16,
      timeLeft: '2h 30m',
      lastActivity: 'Today'
    },
    { 
      id: 'css_static',
      name: 'CSS', 
      categoryName: 'Web Development',
      progress: 62, 
      color: '#1572B6',
      gradient: 'from-blue-400 to-blue-600',
      lessons: 8,
      totalLessons: 13,
      timeLeft: '4h 15m',
      lastActivity: 'Yesterday'
    }
  ];

  const handleProgramClick = (program) => {
    console.log('Program clicked for question generation:', program);
    // Here you would navigate to question generation with the specific program
    alert(`Starting question generation for ${program.name} (${program.categoryName})`);
  };

  const handleContinueLearning = (program, event) => {
    event.stopPropagation();
    console.log('Continue learning:', program);
    // Navigate to specific topic/subject learning
    alert(`Continuing ${program.name} from lesson ${program.lessons + 1}`);
  };

  const handleQuickPractice = () => {
    if (programs.length > 0) {
      const randomProgram = programs[Math.floor(Math.random() * programs.length)];
      handleProgramClick(randomProgram);
    } else {
      alert('No ongoing programs available. Please start learning a subject first.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Ongoing Programs</h2>
            <p className="text-sm text-gray-500">Loading your progress...</p>
          </div>
          <RefreshCw className="animate-spin text-secondary" size={20} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-3"></div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Ongoing Programs</h2>
            <p className="text-sm text-red-500">Error loading progress</p>
          </div>
          <button 
            onClick={loadOngoingPrograms}
            className="text-secondary hover:text-secondary-dark transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="p-5 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button 
              onClick={loadOngoingPrograms}
              className="btn btn-secondary text-sm px-4 py-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ongoing Programs</h2>
          <p className="text-sm text-gray-500">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadOngoingPrograms}
            className="text-gray-400 hover:text-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button className="text-secondary font-medium flex items-center gap-1 hover:text-secondary-dark transition-colors group">
            View all 
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Programs Grid */}
      {programs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {programs.map((program) => (
            <div 
              key={program.id} 
              className="card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => handleProgramClick(program)}
            >
              <div className="p-5">
                {/* Program Icon and Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${program.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {program.iconAsset ? (
                      <img 
                        src={program.iconAsset} 
                        alt={program.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <BookOpen className="text-white w-8 h-8" style={{display: program.iconAsset ? 'none' : 'block'}} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{program.progress}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>

                {/* Program Title and Category */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-secondary transition-colors">
                    {program.name}
                  </h3>
                  <p className="text-sm text-gray-600">{program.categoryName}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r ${program.gradient} h-2 rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${program.progress}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{program.lessons}/{program.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{program.timeLeft}</span>
                  </div>
                </div>

                {/* Last Activity */}
                {program.lastActivity && (
                  <div className="text-xs text-gray-500 mb-3">
                    Last activity: {program.lastActivity}
                  </div>
                )}

                {/* Continue Button */}
                <button 
                  onClick={(e) => handleContinueLearning(program, e)}
                  className="w-full py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-secondary hover:to-secondary-light text-gray-700 hover:text-white rounded-xl font-medium transition-all duration-300 hover:shadow-md"
                >
                  Continue Learning
                </button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-0">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-secondary" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Ongoing Programs</h3>
            <p className="text-gray-600 mb-4">Start learning to see your progress here</p>
            <button className="btn btn-secondary text-sm px-6 py-2">
              Browse Subjects
            </button>
          </div>
        </div>
      )}

      {/* Quick Practice Section */}
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
          <button 
            onClick={handleQuickPractice}
            className="btn btn-secondary text-sm px-4 py-2"
          >
            Start Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OngoingPrograms;