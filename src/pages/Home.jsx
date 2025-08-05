import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrepData } from '../hooks/usePrepData';
import { useUserData } from '../hooks/useUserData';
import StatCard from '../components/home/StatCard';
import CategorySection from '../components/home/CategorySection';
import { Coins, Zap, Flame } from 'lucide-react';
import FirebaseService from '../services/firebaseService';

const Home = () => {
  const { user } = useAuth();
  const { prepData, loading } = usePrepData();
  const { userStats, loading: userLoading, error: userError } = useUserData();
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('');
  const [categorySubcategories, setCategorySubcategories] = useState({});



  useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load subcategories for each category
  useEffect(() => {
    const loadCategorySubcategories = async () => {
      if (!prepData.categoryTitles || prepData.categoryTitles.length === 0) return;

      const subcategoriesData = {};
      
      for (const category of prepData.categoryTitles) {
        try {
          const subcategories = await FirebaseService.loadSubcategories(category);
          subcategoriesData[category] = subcategories;
        } catch (error) {
          subcategoriesData[category] = [];
        }
      }
      
      setCategorySubcategories(subcategoriesData);
    };

    if (!loading && prepData.categoryTitles) {
      loadCategorySubcategories();
    }
  }, [prepData.categoryTitles, loading]);

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

  // Define the 5 main categories with their icons and gradients
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
      {/* Greeting Header */}
      <div className="flex items-center text-3xl font-bold mb-10">
        <span className="text-4xl mr-3 filter drop-shadow-lg">{greetingIcon}</span>
        <span className="bg-gradient-to-r from-pink-500 to-purple-700 bg-clip-text text-transparent">
          {greeting}, {user?.username || 'User'}!
        </span>
      </div>

      {/* Stats Section */}
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

      {/* Category Sections */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore Learning Paths
          </h2>
          
          {categories.map((category) => {
            const categoryData = categories.find(c => c.name === category.name);
            const subcategories = categorySubcategories[category.name] || [];
            
            return (
              <CategorySection
                key={category.name}
                category={category.name}
                topics={subcategories} // Now using subcategories instead of topics
                icon={categoryData?.icon || '📚'}
                gradient={categoryData?.gradient || 'gray'}
                maxTopics={4}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;