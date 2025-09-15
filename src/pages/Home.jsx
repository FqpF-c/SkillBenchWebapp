import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePrepData } from '../hooks/usePrepData';
import { useUserProgress } from '../hooks/useUserProgress';
import { BookOpen, Play, ChevronRight, ArrowRight, Sun, CheckCircle, Trophy, Clock, Coins, Flame, Zap } from 'lucide-react';
import CategoryGrid from '../components/CategoryGrid';
import CategoryCard from '../components/CategoryCard';
import OngoingPrograms from '../components/OngoingPrograms';

// Import programming language icons
import cIcon from '../assets/home_page/c.png';
import cppIcon from '../assets/home_page/cpp.png';
import javaIcon from '../assets/home_page/java.png';
import pythonIcon from '../assets/home_page/python.png';
import kotlinIcon from '../assets/home_page/kotlin.png';
import swiftIcon from '../assets/home_page/swift.png';
import flutterIcon from '../assets/home_page/flutter.png';
import reactIcon from '../assets/home_page/react.png';
import javascriptIcon from '../assets/home_page/javascript.png';
import htmlIcon from '../assets/home_page/html.png';
import cssIcon from '../assets/home_page/css.png';
import awsIcon from '../assets/home_page/aws.png';
import azureIcon from '../assets/home_page/azure.png';
import gcpIcon from '../assets/home_page/google-cloud.png';
import webDevIcon from '../assets/home_page/web_development.png';
import streakIcon from '../assets/home_page/streak.png';
import coinIcon from '../assets/home_page/coin.png';
import xpIcon from '../assets/home_page/xp.png';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { prepData, loading, error } = usePrepData();
  const { ongoingPrograms, loading: progressLoading } = useUserProgress();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    completed: 0,
    rankPosition: 1,
    studyHours: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate stats from user data and prep data
    if (user && prepData && !loading) {
      calculateStats();
    }
  }, [user, prepData, loading]);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('GOOD MORNING');
    } else if (hour < 17) {
      setGreeting('GOOD AFTERNOON');
    } else {
      setGreeting('GOOD EVENING');
    }
  };

  const calculateStats = async () => {
    setStatsLoading(true);
    try {
      // Calculate completed topics (placeholder logic - replace with actual Firebase queries)
      const completedTopics = 0; // This should be calculated from progress data
      
      // Calculate rank position (placeholder logic)
      const rankPosition = Math.floor(Math.random() * 100) + 1; // Replace with actual rank calculation
      
      // Get study hours from user data
      const studyHours = Math.floor((user?.studyHours || user?.study_hours || 0));
      
      setStats({
        completed: completedTopics,
        rankPosition,
        studyHours
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
    setStatsLoading(false);
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
    console.log('Looking for asset for:', topicName, 'normalized to:', normalizedName);
    
    const topicAssetMap = {
      'c': cIcon,
      'c++': cppIcon,
      'cpp': cppIcon,
      'java': javaIcon,
      'python': pythonIcon,
      'kotlin': kotlinIcon,
      'native android using kotlin': kotlinIcon,
      'swift': swiftIcon,
      'native ios using swift': swiftIcon,
      'flutter': flutterIcon,
      'react': reactIcon,
      'react native': reactIcon,
      'javascript': javascriptIcon,
      'html': htmlIcon,
      'css': cssIcon,
      'aws': awsIcon,
      'azure': azureIcon,
      'gcp': gcpIcon,
      'google cloud': gcpIcon,
      'web development': webDevIcon,
    };
    
    const result = topicAssetMap[normalizedName];
    console.log('Asset found:', result ? 'YES' : 'NO');
    return result || null;
  };

  const getDisplayName = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    console.log('Getting display name for:', topicName, 'normalized to:', normalizedName);
    
    const displayNameMap = {
      // Programming Languages
      'c': 'C',
      'c++': 'C++',
      'cpp': 'C++',
      'java': 'Java',
      'python': 'Python',
      'kotlin': 'Kotlin',
      'native android using kotlin': 'Kotlin',
      'swift': 'Swift',
      'native ios using swift': 'Swift',
      'flutter': 'Flutter',
      'react': 'React',
      'react native': 'React Native',
      'javascript': 'JavaScript',
      'html': 'HTML',
      'css': 'CSS',
      
      // Cloud Computing
      'aws': 'AWS',
      'azure': 'Azure',
      'gcp': 'Google Cloud',
      'google cloud': 'Google Cloud',
      
      // Web Development
      'web development': 'Web Development',
      
      // App Development
      'mobile development': 'Mobile Development',
      'ios development': 'iOS Development',
      'android development': 'Android Development',
      
      // Database
      'sql': 'SQL',
      'mysql': 'MySQL',
      'postgresql': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'database': 'Database',
      
      // Machine Learning
      'machine learning': 'Machine Learning',
      'ai': 'AI',
      'artificial intelligence': 'Artificial Intelligence',
      'data science': 'Data Science',
      
      // General Skills
      'problem solving': 'Problem Solving',
      'algorithms': 'Algorithms',
      'data structures': 'Data Structures',
      'git': 'Git',
      'github': 'GitHub',
    };
    
    const result = displayNameMap[normalizedName] || topicName;
    console.log('Display name result:', result);
    return result;
  };

  const getEmojiForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    const emojiMap = {
      // Programming Languages
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
      
      // Cloud Computing
      'aws': '☁️',
      'azure': '☁️',
      'gcp': '☁️',
      'google cloud': '☁️',
      
      // Web Development
      'web development': '🌐',
      
      // App Development
      'mobile development': '📱',
      'ios development': '📱',
      'android development': '📱',
      
      // Database
      'sql': '🗄️',
      'mysql': '🗄️',
      'postgresql': '🗄️',
      'mongodb': '🗄️',
      'database': '🗄️',
      
      // Machine Learning
      'machine learning': '🤖',
      'ai': '🤖',
      'artificial intelligence': '🤖',
      'data science': '📊',
      
      // General Skills
      'problem solving': '🧩',
      'algorithms': '⚡',
      'data structures': '🏗️',
      'git': '📝',
      'github': '📝',
    };
    return emojiMap[normalizedName] || '📚';
  };

  const getSimpleBackgroundForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    const backgroundColors = {
      // Programming Languages - Blue variants
      'c': '#EBF4FF',
      'c++': '#DBEAFE', 
      'cpp': '#DBEAFE',
      'java': '#FEF2F2',
      'python': '#F0FDF4',
      'kotlin': '#F3E8FF',
      'swift': '#FFF7ED',
      'flutter': '#ECFDF5',
      'react': '#EFF6FF',
      'javascript': '#FFFBEB',
      'html': '#FFF7ED',
      'css': '#EBF4FF',
      
      // Cloud Computing - Sky variants
      'aws': '#FFF7ED',
      'azure': '#EBF4FF',
      'gcp': '#F0FDF4',
      'google cloud': '#F0FDF4',
      
      // Default fallback
      'default': '#F8FAFC'
    };
    
    return backgroundColors[normalizedName] || backgroundColors.default;
  };




  // Welcome Header Component - Updated with new modern design
  const WelcomeHeader = () => (
    <motion.div 
      className="relative w-full rounded-3xl shadow-xl overflow-hidden bg-gradient-to-r from-[#2E0059] via-[#4B007D] to-[#602769]"
      style={{ 
        minHeight: '280px'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative circular overlays */}
      <div className="absolute top-6 right-6 opacity-10">
        <div className="w-20 h-20 border-2 border-white/30 rounded-full"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-2 border-white/40 rounded-full"></div>
        <div className="absolute top-1 right-1 w-6 h-6 bg-white/50 rounded-full"></div>
      </div>

      <div className="relative px-6 py-4 h-full flex flex-col justify-between">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end h-full">
          {/* Left column - Greeting + User Name */}
          <div className="flex flex-col">
            {/* User name section - FIXED POSITIONING */}
            <div className="mt-12 ml-8">
              {/* Greeting line - aligned directly above the name */}
              <div className="flex items-center gap-2 mb-6">
                <Sun size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80 tracking-wider uppercase">
                  {greeting}
                </span>
              </div>
              
              <div className="flex items-baseline mb-2">
                <span className="text-4xl md:text-5xl font-bold text-[#F871A0] mr-2">
                  Hi,
                </span>
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {user?.username || 'User'}!
                </span>
              </div>
              {/* Underline moved below the text */}
              <div className="w-16 h-0.5 bg-[#8B0073] rounded-full"></div>
            </div>
          </div>
          
          {/* Right column - Stats pills at bottom-right */}
          <motion.div 
            className="flex gap-3 mt-6 md:mt-0 md:-mb-16 relative"
            style={{ left: '-120px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="border border-[#783370] py-0.5 rounded-xl flex items-center">
              <img src={streakIcon} alt="Streak" className="w-8 h-8 ml-0.5" />
              <span className="text-white font-bold text-sm ml-4 mr-6">{user?.streaks || 0}</span>
            </div>
            <div className="border border-[#783370] py-0.5 rounded-xl flex items-center">
              <img src={coinIcon} alt="Coin" className="w-8 h-8 ml-0.5" />
              <span className="text-white font-bold text-sm ml-4 mr-6">{user?.coins || 0}</span>
            </div>
            <div className="border border-[#783370] py-0.5 rounded-xl flex items-center">
              <img src={xpIcon} alt="XP" className="w-8 h-8 ml-0.5" />
              <span className="text-white font-bold text-sm ml-4 mr-6">{user?.xp || 0}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced Stats Box Component with Glassmorphism
  const StatsBox = () => {
    const AnimatedNumber = ({ value, suffix = "" }) => {
      const [displayValue, setDisplayValue] = useState(0);
      
      useEffect(() => {
        if (value === 0) return;
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;
        
        let totalMiliseconds = 1500;
        let incrementTime = (totalMiliseconds / end) > 50 ? 50 : totalMiliseconds / end;
        
        let timer = setInterval(() => {
          start += Math.ceil(end / 30);
          if (start >= end) {
            clearInterval(timer);
            setDisplayValue(end);
          } else {
            setDisplayValue(start);
          }
        }, incrementTime);
        
        return () => clearInterval(timer);
      }, [value]);
      
      return <span>{displayValue}{suffix}</span>;
    };

    if (statsLoading) return (
      <motion.div 
        className="mx-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex-1 text-center">
              <div className="w-16 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mx-auto mb-2"></div>
              <div className="w-20 h-3 bg-gray-200 rounded-full mx-auto"></div>
            </div>
            <div className="w-px h-12 bg-gray-200 mx-4"></div>
            <div className="flex-1 text-center">
              <div className="w-12 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mx-auto mb-2"></div>
              <div className="w-16 h-3 bg-gray-200 rounded-full mx-auto"></div>
            </div>
            <div className="w-px h-12 bg-gray-200 mx-4"></div>
            <div className="flex-1 text-center">
              <div className="w-14 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mx-auto mb-2"></div>
              <div className="w-24 h-3 bg-gray-200 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );

    return (
      <motion.div 
        className="mx-2 sm:mx-4 mb-4 sm:mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/15 transition-all duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <motion.div 
              className="flex-1 text-center group cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className="flex items-center justify-center gap-2 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-400/30">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                  <AnimatedNumber value={stats.completed} />
                </div>
              </motion.div>
              <div className="text-xs font-semibold text-gray-600 tracking-wider uppercase opacity-75 group-hover:opacity-100 transition-opacity">
                Completed
              </div>
            </motion.div>

            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent hidden sm:block"></div>

            <motion.div 
              className="flex-1 text-center group cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className="flex items-center justify-center gap-2 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-600/20 border border-yellow-400/30">
                  <Trophy size={16} className="text-orange-600" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  #<AnimatedNumber value={stats.rankPosition} />
                </div>
              </motion.div>
              <div className="text-xs font-semibold text-gray-600 tracking-wider uppercase opacity-75 group-hover:opacity-100 transition-opacity">
                Rank
              </div>
            </motion.div>

            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent hidden sm:block"></div>

            <motion.div 
              className="flex-1 text-center group cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className="flex items-center justify-center gap-2 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-600/20 border border-blue-400/30">
                  <Clock size={16} className="text-purple-600" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  <AnimatedNumber value={stats.studyHours} suffix="h" />
                </div>
              </motion.div>
              <div className="text-xs font-semibold text-gray-600 tracking-wider uppercase opacity-75 group-hover:opacity-100 transition-opacity">
                Study Time
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCategorySection = (categoryName) => {
    const items = prepData.categoryItems[categoryName] || [];
    if (items.length === 0) return null;

    const displayItems = items.slice(0, 6);

    return (
      <motion.div 
        key={categoryName} 
        className="mb-8 overflow-visible"
        style={{ overflow: 'visible' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6 px-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{categoryName}</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">{displayItems.length} topics available</p>
          </div>
          <button
            onClick={() => handleCategoryClick(categoryName)}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-sm font-semibold rounded-2xl border border-primary/20 hover:from-primary/20 hover:to-secondary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/10"
          >
            View all
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="px-4 pb-8 pt-4 overflow-visible">
          <div className="flex flex-wrap justify-start gap-4 overflow-visible" style={{ overflow: 'visible' }}>
                         {displayItems.map((item, index) => {
               const name = item.name || 'Unknown';
               console.log('Processing item:', name, 'in category:', categoryName);
               
               // Simple, clean background colors
               const backgroundColors = {
                 'Programming Language': '#EBF4FF',
                 'Web Development': '#ECFDF5', 
                 'App Development': '#F3E8FF',
                 'Cloud Computing': '#EFF6FF',
                 'Database': '#FEF2F2',
                 'Machine Learning': '#FFFBEB',
                 'General Skills': '#F8FAFC'
               };
               
               const backgroundColor = backgroundColors[categoryName] || '#F8FAFC';
               
               // Try to get image asset first, fallback to emoji
               const iconSrc = getAssetForTopic(name);
               const icon = iconSrc ? null : getEmojiForTopic(name);

               return (
                 <motion.div 
                   key={index} 
                   className="overflow-visible flex-shrink-0"
                   style={{ 
                     overflow: 'visible', 
                     zIndex: 1,
                     width: '160px',
                     height: '180px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}
                   initial={{ opacity: 0, y: 30, scale: 0.8 }} 
                   animate={{ opacity: 1, y: 0, scale: 1 }} 
                   transition={{ 
                     delay: index * 0.1, 
                     duration: 0.6,
                     type: "spring",
                     stiffness: 150,
                     damping: 20,
                     ease: "easeOut"
                   }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <CategoryCard
                     title={getDisplayName(name)}
                     icon={icon}
                     iconSrc={iconSrc}
                     backgroundColor={backgroundColor}
                     onClick={() => handleSubcategoryClick(categoryName, name)}
                   />
                 </motion.div>
               );
             })}
          </div>
        </div>
      </motion.div>
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
      <div className="min-h-screen bg-white">
        <div 
          className="w-full rounded-b-[60px] animate-pulse"
          style={{ height: '265px', background: '#341B58' }}
        ></div>
        
        <div 
          className="w-full rounded-b-[48px] animate-pulse"
          style={{ 
            transform: 'translateY(-65px)',
            height: '120px',
            background: 'linear-gradient(to bottom, #E17DA8, #E15E89)'
          }}
        ></div>
        
        <motion.div 
          className="px-4"
          style={{ transform: 'translateY(-40px)' }}
        >
          {renderLoadingSkeleton()}
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <WelcomeHeader />
        <StatsBox />
        
        <motion.div 
          className="px-4"
          style={{ transform: 'translateY(-40px)' }}
        >
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
        </motion.div>
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
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50/40 via-white to-pink-50/25 pt-16 sm:pt-20 overflow-visible" style={{ overflow: 'visible' }}>
      <div className="px-4">
        <WelcomeHeader />
      </div>
      <StatsBox />
      
      <motion.div 
        className="px-2 sm:px-4 pb-32 mt-4 sm:mt-8 overflow-visible"
        style={{ overflow: 'visible' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >

        {/* Ongoing Programs Section */}
        <OngoingPrograms programs={ongoingPrograms} loading={progressLoading} />

        {/* Technologies Widget & Programming Languages */}
        <div className="space-y-6">
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
      </motion.div>
    </div>
  );
};

export default Home;