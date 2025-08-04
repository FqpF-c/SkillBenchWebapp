import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsRow from '../components/home/StatsRow';
import OngoingPrograms from '../components/home/OngoingPrograms';
import Technologies from '../components/home/Technologies';
import ProgrammingLanguages from '../components/home/ProgrammingLanguages';
import PrepService from '../services/PrepService';

const Home = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [prepData, setPrepData] = useState({
    categoryTitles: [],
    categoryItems: {},
    displayTitles: {}
  });

  const topicAssetMap = {
    'c': '/assets/home_page/c.png',
    'cpp': '/assets/home_page/cpp.png',
    'c++': '/assets/home_page/cpp.png',
    'java': '/assets/home_page/java.png',
    'python': '/assets/home_page/python.png',
    'kotlin': '/assets/home_page/kotlin.png',
    'swift': '/assets/home_page/swift.png',
    'flutter': '/assets/home_page/flutter.png',
    'react': '/assets/home_page/react.png',
    'react native': '/assets/home_page/react.png',
    'web development': '/assets/home_page/web_development.png',
    'aws': '/assets/home_page/aws.png',
    'amazon web services': '/assets/home_page/aws.png',
    'google cloud': '/assets/home_page/google-cloud.png',
    'gcp': '/assets/home_page/google-cloud.png',
    'azure': '/assets/home_page/azure.png',
    'microsoft azure': '/assets/home_page/azure.png',
    'excel': '/assets/home_page/excel.png',
    'microsoft excel': '/assets/home_page/excel.png',
    'css': '/assets/home_page/css.png',
    'css3': '/assets/home_page/css.png',
    'javascript': '/assets/home_page/javascript.png',
    'js': '/assets/home_page/javascript.png',
    'powerpoint': '/assets/home_page/powerpoint.png',
    'microsoft powerpoint': '/assets/home_page/powerpoint.png',
    'ppt': '/assets/home_page/powerpoint.png',
    'html': '/assets/home_page/html.png',
    'html5': '/assets/home_page/html.png'
  };

  const topicColorMap = {
    'c': '#00599C',
    'cpp': '#00599C',
    'c++': '#00599C',
    'java': '#ED8B00',
    'python': '#3776AB',
    'kotlin': '#7F52FF',
    'swift': '#FA7343',
    'flutter': '#02569B',
    'react': '#61DAFB',
    'react native': '#61DAFB',
    'web development': '#E34F26',
    'aws': '#FF9900',
    'amazon web services': '#FF9900',
    'google cloud': '#4285F4',
    'gcp': '#4285F4',
    'azure': '#0078D4',
    'microsoft azure': '#0078D4',
    'excel': '#217346',
    'microsoft excel': '#217346',
    'css': '#1572B6',
    'css3': '#1572B6',
    'javascript': '#F7DF1E',
    'js': '#F7DF1E',
    'powerpoint': '#B7472A',
    'microsoft powerpoint': '#B7472A',
    'ppt': '#B7472A',
    'html': '#E34F26',
    'html5': '#E34F26'
  };

  useEffect(() => {
    updateGreeting();
    loadData();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('🏠 Home page loading data...');
      
      const data = await PrepService.loadAllData();
      setPrepData(data);
      
      console.log('🏠 Home page data loaded:', data);
    } catch (error) {
      console.error('🏠 Home page data load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAssetForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    
    if (topicAssetMap[normalizedName]) {
      return topicAssetMap[normalizedName];
    }
    
    for (const key in topicAssetMap) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return topicAssetMap[key];
      }
    }
    
    return '/assets/home_page/default.png';
  };

  const getColorForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    
    if (topicColorMap[normalizedName]) {
      return topicColorMap[normalizedName];
    }
    
    for (const key in topicColorMap) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return topicColorMap[key];
      }
    }
    
    const colors = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    const hash = topicName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
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
      <div className="flex items-center text-3xl font-bold mb-10">
        <span className="text-4xl mr-3 filter drop-shadow-lg">{greetingIcon}</span>
        <span className="bg-gradient-to-r from-pink-500 to-purple-700 bg-clip-text text-transparent">
          {greeting}, {user?.username || 'User'}!
        </span>
      </div>

      <StatsRow />

      <OngoingPrograms 
        categoryItems={prepData.categoryItems}
        getAssetForTopic={getAssetForTopic}
        getColorForTopic={getColorForTopic}
      />

      <Technologies 
        categoryItems={prepData.categoryItems}
        categoryTitles={prepData.categoryTitles}
        displayTitles={prepData.displayTitles}
        getAssetForTopic={getAssetForTopic}
        getColorForTopic={getColorForTopic}
      />

      <ProgrammingLanguages 
        categoryItems={prepData.categoryItems}
        categoryTitles={prepData.categoryTitles}
        displayTitles={prepData.displayTitles}
        getAssetForTopic={getAssetForTopic}
        getColorForTopic={getColorForTopic}
      />
    </div>
  );
};

export default Home;