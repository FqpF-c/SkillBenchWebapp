// src/components/home/TechnologiesSection.jsx - Updated with Firebase
import React, { useState, useEffect } from 'react';
import { Code, Wrench, ChevronRight, Star, Users, Award, RefreshCw } from 'lucide-react';
import { firebasePrepService } from '../../services/firebasePrepService';

const TechnologiesSection = () => {
  const [technologies, setTechnologies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredSkills, setFeaturedSkills] = useState([]);

  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading technologies from Firebase...');
      const prepData = await firebasePrepService.loadAllPrepData();
      
      // Transform Firebase data to match your component structure
      const formattedTechnologies = [];
      const allSkills = [];
      
      // Process each category
      Object.entries(prepData.categoryItems).forEach(([categoryId, items]) => {
        const displayName = prepData.displayTitles[categoryId] || categoryId;
        
        // Map category to appropriate icon and details
        const categoryConfig = getCategoryConfig(categoryId, displayName);
        
        formattedTechnologies.push({
          id: categoryId,
          name: displayName,
          icon: categoryConfig.icon,
          description: categoryConfig.description,
          courses: items.length,
          difficulty: categoryConfig.difficulty,
          rating: categoryConfig.rating,
          students: categoryConfig.students,
          color: categoryConfig.color,
          bgColor: categoryConfig.bgColor,
          borderColor: categoryConfig.borderColor,
          items: items // Store the actual items for navigation
        });
        
        // Collect skills for featured section
        items.forEach(item => {
          if (item.name && !allSkills.includes(item.name)) {
            allSkills.push(item.name);
          }
        });
      });
      
      setTechnologies(formattedTechnologies);
      setFeaturedSkills(allSkills.slice(0, 8)); // Show first 8 skills
      
      console.log('Technologies loaded:', formattedTechnologies);
      
    } catch (err) {
      console.error('Error loading technologies:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get category configuration
  const getCategoryConfig = (categoryId, displayName) => {
    const configs = {
      'Programming Language': {
        icon: Code,
        description: 'Master popular programming languages',
        difficulty: 'Beginner',
        rating: 4.8,
        students: '2.4k',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'Cloud Computing': {
        icon: Wrench,
        description: 'Cloud platforms & services',
        difficulty: 'Intermediate',
        rating: 4.6,
        students: '1.8k',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      'Web Development': {
        icon: Code,
        description: 'Frontend & Backend development',
        difficulty: 'Beginner',
        rating: 4.9,
        students: '3.2k',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    };
    
    return configs[categoryId] || {
      icon: Wrench,
      description: 'Learn new skills and technologies',
      difficulty: 'Mixed',
      rating: 4.5,
      students: '1.2k',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const handleCategoryClick = (technology) => {
    console.log('Technology category clicked:', technology);
    // Here you can navigate to a detailed view of the category
    // or trigger question generation for the entire category
    
    // Example: Show alert with available subjects
    const subjectNames = technology.items.map(item => item.name).join(', ');
    alert(`${technology.name} subjects: ${subjectNames}`);
  };

  const handleSkillClick = (skill) => {
    console.log('Skill clicked for question generation:', skill);
    // Trigger question generation for specific skill
    alert(`Starting question generation for: ${skill}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Technologies</h2>
            <p className="text-sm text-gray-500">Loading from Firebase...</p>
          </div>
          <RefreshCw className="animate-spin text-secondary" size={20} />
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card border-2 border-gray-200">
              <div className="p-5 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
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
            <h2 className="text-xl font-bold text-gray-900 mb-1">Technologies</h2>
            <p className="text-sm text-red-500">Error loading data</p>
          </div>
          <button 
            onClick={loadTechnologies}
            className="text-secondary hover:text-secondary-dark transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="p-5 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button 
              onClick={loadTechnologies}
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
          <h2 className="text-xl font-bold text-gray-900 mb-1">Technologies</h2>
          <p className="text-sm text-gray-500">Explore different learning paths</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadTechnologies}
            className="text-gray-400 hover:text-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button className="text-secondary font-medium hover:text-secondary-dark transition-colors group flex items-center gap-1">
            View all
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Technologies Cards */}
      <div className="space-y-4">
        {technologies.map((tech, index) => (
          <div
            key={tech.id}
            className={`card hover:shadow-lg transition-all duration-300 cursor-pointer group ${tech.borderColor} border-2 hover:border-secondary/50`}
            onClick={() => handleCategoryClick(tech)}
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
                    <span className="text-gray-600">{tech.courses} subjects</span>
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
                    : tech.difficulty === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {tech.difficulty}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(tech);
                  }}
                  className="btn btn-ghost text-sm px-4 py-2 hover:bg-secondary hover:text-white"
                >
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
      {featuredSkills.length > 0 && (
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-0">
          <div className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Available Skills</h3>
            <div className="flex flex-wrap gap-2">
              {featuredSkills.map((skill, index) => (
                <span
                  key={index}
                  onClick={() => handleSkillClick(skill)}
                  className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:border-secondary hover:text-secondary transition-colors cursor-pointer"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action for Question Generation */}
      <div className="card gradient-soft border-0">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <Star className="text-secondary" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Start Question Generation</h4>
              <p className="text-sm text-gray-600">Choose any subject above to begin</p>
            </div>
          </div>
          <button 
            onClick={() => alert('Please select a subject from the categories above')}
            className="btn btn-secondary text-sm px-4 py-2"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnologiesSection;