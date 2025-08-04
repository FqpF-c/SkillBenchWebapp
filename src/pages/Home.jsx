import React, { useEffect, useState } from 'react';
import { CheckCircle, Trophy, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/home/StatsCard';
import OngoingPrograms from '../components/home/OngoingPrograms';
import TechnologiesSection from '../components/home/TechnologiesSection';

const Home = () => {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState('🌞');
  const { user } = useAuth();

  const statsConfig = [
    { icon: CheckCircle, label: 'Completed', key: 'completed', color: 'text-green-600' },
    { icon: Trophy, label: 'Streaks', key: 'streaks', color: 'text-yellow-600' },
    { icon: Clock, label: 'XP Points', key: 'xp', color: 'text-purple-600' }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
      setIcon('🌞');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
      setIcon('☀️');
    } else {
      setGreeting('Good Evening');
      setIcon('🌙');
    }
  }, []);

  const getUserStats = () => {
    if (!user) return { completed: 0, streaks: 0, xp: 0 };
    
    return {
      completed: 12,
      streaks: user.streaks || 0,
      xp: user.xp || 0
    };
  };

  const userStats = getUserStats();

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
          <span className="text-4xl">{icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {user?.username || 'Student'}!
            </h1>
            <p className="text-gray-600">Ready to continue your learning journey?</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsConfig.map((stat, index) => (
          <StatsCard
            key={stat.key}
            icon={stat.icon}
            label={stat.label}
            value={userStats[stat.key]}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <OngoingPrograms />
        <TechnologiesSection />
      </div>
    </div>
  );
};

export default Home;