import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePrepData } from '../hooks/usePrepData';
import StatsRow from '../components/home/StatsRow';
import { BookOpen, Play, ChevronRight, ArrowRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { prepData, loading, error } = usePrepData();
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('');

  useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
      setGreetingIcon('🌅');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
      setGreetingIcon('☀️');
    } else {
      setGreeting('Good Evening');
      setGreetingIcon('🌆');
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/list-topics/${encodeURIComponent(categoryName)}`, {
      state: {
        categoryName,
        categoryIcon: getCategoryIcon(categoryName)
      }
    });
  };

  const handleSubcategoryClick = (categoryName, subcategory) => {
    navigate(`/list-topics/${encodeURIComponent(categoryName)}`, {
      state: {
        categoryName,
        categoryIcon: getCategoryIcon(categoryName),
        initialExpandedTopic: subcategory
      }
    });
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Programming Language': '💻',
      'Web Development': '🌐',
      'App Development': '📱',
      'Cloud Computing': '☁️',
      'Database': '🗄️',
      'Machine Learning': '🤖',
      'General Skills': '🎯'
    };
    return icons[categoryName] || '📚';
  };

  const getAssetForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    const topicAssetMap = {
      'c': '💻',
      'c++': '💻',
      'cpp': '💻',
      'java': '☕',
      'python': '🐍',
      'kotlin': '📱',
      'swift': '🏃‍♂️',
      'flutter': '🦋',
      'react': '⚛️',
      'react native': '⚛️',
      'javascript': '🟨',
      'html': '🌐',
      'css': '🎨',
      'aws': '☁️',
      'azure': '☁️',
      'gcp': '☁️',
      'web development': '🌐',
    };
    return topicAssetMap[normalizedName] || '📚';
  };

  const getColorForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    const categoryColors = {
      'c': 'from-blue-500 to-blue-600',
      'c++': 'from-blue-400 to-blue-500',
      'java': 'from-red-500 to-red-600',
      'python': 'from-green-500 to-green-600',
      'kotlin': 'from-purple-500 to-purple-600',
      'swift': 'from-orange-500 to-orange-600',
      'flutter': 'from-cyan-500 to-cyan-600',
      'react': 'from-cyan-400 to-blue-500',
      'javascript': 'from-yellow-500 to-yellow-600',
      'html': 'from-orange-400 to-red-500',
      'css': 'from-blue-400 to-purple-500',
      'aws': 'from-orange-500 to-yellow-500',
      'azure': 'from-blue-500 to-blue-700',
      'gcp': 'from-blue-400 to-green-500',
      'web development': 'from-teal-500 to-teal-600',
    };
    return categoryColors[normalizedName] || 'from-gray-500 to-gray-600';
  };

  const renderCategorySection = (categoryName) => {
    const items = prepData.categoryItems[categoryName] || [];
    if (items.length === 0) return null;

    const displayItems = items.slice(0, 6);

    return (
      <div key={categoryName} className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getCategoryIcon(categoryName)}</div>
            <h2 className="text-xl font-bold text-gray-900">{categoryName}</h2>
          </div>
          <button
            onClick={() => handleCategoryClick(categoryName)}
            className="flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors"
          >
            View all
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 px-4">
          {displayItems.map((item, index) => {
            const name = item.name || 'Unknown';
            const asset = getAssetForTopic(name);
            const gradient = getColorForTopic(name);

            return (
              <div
                key={index}
                onClick={() => handleSubcategoryClick(categoryName, name)}
                className={`min-w-[140px] bg-gradient-to-br ${gradient} rounded-2xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {asset}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                    {name}
                  </h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="text-white mx-auto" size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <div className="flex items-center justify-between mb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-4">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="min-w-[140px] h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="mb-8">
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl p-6 min-w-48 h-24 animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Unable to load content
          </div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const priorityCategories = [
    'Programming Language',
    'Web Development',
    'App Development',
    'Cloud Computing',
    'Database',
    'Machine Learning',
    'General Skills'
  ];

  const displayCategories = prepData.categoryTitles.filter(cat => 
    priorityCategories.includes(cat)
  ).sort((a, b) => {
    const aIndex = priorityCategories.indexOf(a);
    const bIndex = priorityCategories.indexOf(b);
    return aIndex - bIndex;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greetingIcon} {greeting}, {user?.username || 'User'}!
        </h1>
        <p className="text-gray-600 text-lg">Ready to enhance your skills today?</p>
      </div>

      <StatsRow />

      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Continue Learning</h2>
              <p className="text-purple-100 mb-4">
                Pick up where you left off and keep building your skills
              </p>
            </div>
            <div className="hidden md:block">
              <BookOpen className="w-16 h-16 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {displayCategories.length > 0 ? (
          displayCategories.map(renderCategorySection)
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No content available</h3>
            <p className="text-gray-500">
              {prepData.totalCategories === 0 
                ? "Loading content..." 
                : "Content will appear here once loaded."
              }
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Explore All Categories
          </h3>
          <p className="text-gray-600 mb-4">
            Discover more topics and expand your learning journey
          </p>
          <button
            onClick={() => navigate('/academics')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Browse All Topics
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;