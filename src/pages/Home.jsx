import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import StatCard from '../components/home/StatCard';
import { Coins, Zap, Flame, BookOpen, Play, ChevronRight } from 'lucide-react';
import UserDataDebug from '../components/debug/UserDataDebug';

const Home = () => {
  const { user } = useAuth();
  const { userStats, loading: userLoading, error: userError } = useUserData();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('');
  const [categoryTitles, setCategoryTitles] = useState([]);
  const [categorySubcategories, setCategorySubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);

  useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadCategoryTitles = async () => {
      try {
        setLoading(true);
        const titlesDoc = await getDoc(doc(db, 'prep', 'Title'));
        
        if (titlesDoc.exists()) {
          const data = titlesDoc.data();
          
          if (data && data.Title && Array.isArray(data.Title)) {
            setCategoryTitles(data.Title);
            console.log('Loaded category titles:', data.Title);
          }
        }
      } catch (error) {
        console.error('Error loading category titles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryTitles();
  }, []);

  useEffect(() => {
    const loadCategorySubcategories = async () => {
      if (!categoryTitles || categoryTitles.length === 0) return;

      setLoadingSubcategories(true);
      const subcategoriesData = {};
      
      for (const category of categoryTitles) {
        try {
          console.log(`Loading subcategories for ${category}`);
          
          const snapshot = await getDoc(doc(db, 'prep', 'Title', category, category));
          
          if (snapshot.exists()) {
            const data = snapshot.data();
            console.log(`${category} subcategories data:`, data);
            
            if (data && data[category] && Array.isArray(data[category])) {
              const items = data[category];
              const subcats = items.map(item => {
                if (typeof item === 'object' && item !== null) {
                  return item.name || Object.keys(item)[0] || 'Unknown';
                } else if (typeof item === 'string') {
                  return item;
                }
                return 'Unknown';
              });
              
              subcategoriesData[category] = subcats;
              console.log('Loaded subcategories for', category, ':', subcats);
            } else {
              subcategoriesData[category] = [];
            }
          } else {
            subcategoriesData[category] = [];
          }
        } catch (error) {
          console.error(`Error loading subcategories for ${category}:`, error);
          subcategoriesData[category] = [];
        }
      }
      
      setCategorySubcategories(subcategoriesData);
      setLoadingSubcategories(false);
    };

    loadCategorySubcategories();
  }, [categoryTitles]);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
      setGreetingIcon('🌅');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
      setGreetingIcon('☀️');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening');
      setGreetingIcon('🌆');
    } else {
      setGreeting('Good Night');
      setGreetingIcon('🌙');
    }
  };

  const categories = [
    {
      name: 'Programming Language',
      icon: '💻',
      gradient: 'purple'
    },
    {
      name: 'Web Development',
      icon: '🌐',
      gradient: 'blue'
    },
    {
      name: 'Cloud Computing',
      icon: '☁️',
      gradient: 'indigo'
    },
    {
      name: 'General Skills',
      icon: '🎯',
      gradient: 'green'
    },
    {
      name: 'App Development',
      icon: '📱',
      gradient: 'orange'
    }
  ];

  const getGradientClasses = (gradient) => {
    const gradients = {
      purple: 'from-purple-500 to-pink-500',
      blue: 'from-blue-500 to-cyan-500',
      indigo: 'from-indigo-500 to-purple-500',
      green: 'from-green-500 to-emerald-500',
      orange: 'from-orange-500 to-red-500'
    };
    return gradients[gradient] || gradients.purple;
  };

  const handleSubtopicClick = (categoryName, subtopic) => {
    navigate(`/list-topics/${encodeURIComponent(categoryName)}`, {
      state: {
        categoryName,
        categoryIcon: categories.find(c => c.name === categoryName)?.icon || '📚',
        initialExpandedTopic: subtopic
      }
    });
  };

  const handleViewAllClick = (categoryName) => {
    navigate(`/list-topics/${encodeURIComponent(categoryName)}`, {
      state: {
        categoryName,
        categoryIcon: categories.find(c => c.name === categoryName)?.icon || '📚'
      }
    });
  };

  const renderCategorySection = (category) => {
    const categoryData = categories.find(c => c.name === category.name);
    const subcategories = categorySubcategories[category.name] || [];
    const displaySubcategories = subcategories.slice(0, 8);

    if (loadingSubcategories) {
      return (
        <div key={category.name} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">{categoryData?.icon || '📚'}</div>
            <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (subcategories.length === 0) {
      return null;
    }

    return (
      <div key={category.name} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{categoryData?.icon || '📚'}</div>
            <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
          </div>
          <button 
            onClick={() => handleViewAllClick(category.name)}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
          >
            View All
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {displaySubcategories.map((subtopic, index) => (
            <div
              key={subtopic}
              onClick={() => handleSubtopicClick(category.name, subtopic)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300 cursor-pointer group transform hover:scale-105"
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClasses(categoryData?.gradient)} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <BookOpen className="text-white" size={20} />
                </div>
                <h3 className="font-medium text-gray-900 text-sm group-hover:text-purple-700 transition-colors leading-tight line-clamp-2">
                  {subtopic}
                </h3>
              </div>
              
              <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                  <Play size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <UserDataDebug />
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="flex items-center text-3xl font-bold mb-10">
        <span className="text-4xl mr-3 filter drop-shadow-lg">{greetingIcon}</span>
        <span className="bg-gradient-to-r from-pink-500 to-purple-700 bg-clip-text text-transparent">
          {greeting}, {user?.username || 'User'}!
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Coins"
          value={userStats.coins}
          icon={Coins}
          color="gold"
          delay={0}
        />
        <StatCard
          title="XP"
          value={userStats.xp}
          icon={Zap}
          color="purple"
          delay={200}
        />
        <StatCard
          title="Streaks"
          value={userStats.streaks}
          icon={Flame}
          color="orange"
          delay={400}
        />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore Learning Paths
          </h2>
          
          {categories.map((category) => 
            renderCategorySection(category)
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;