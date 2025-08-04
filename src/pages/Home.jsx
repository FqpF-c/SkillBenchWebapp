import React, { useEffect, useState } from 'react';
import { CheckCircle, Trophy, Clock } from 'lucide-react';
import OngoingPrograms from '../components/home/OngoingPrograms';
import TechnologiesSection from '../components/home/TechnologiesSection';
import './Home.css';

const statsConfig = [
  { icon: CheckCircle, label: 'Completed', key: 'completed' },
  { icon: Trophy, label: 'Rank Position', key: 'rankPosition' },
  { icon: Clock, label: 'Study Hours', key: 'studyHours' }
];

export default function Home() {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState('🌞');
  const [user, setUser] = useState({ name: 'Tester' });
  const [userStats, setUserStats] = useState({ completed: 0, rankPosition: 0, studyHours: 0 });

  useEffect(() => {
    // Replace with real user/userStats fetch if needed
    setUser({ name: 'Tester' });
    setUserStats({ completed: 12, rankPosition: 5, studyHours: 42 });
    const hour = new Date().getHours();
    if (hour < 18) {
      setGreeting('Good Morning');
      setIcon('🌞');
    } else {
      setGreeting('Good Evening');
      setIcon('🌙');
    }
  }, []);

  return (
    <div className="home-root">
      <div className="greeting-section fade-in">
        <span className={`greeting-icon ${icon === '🌞' ? 'sun-glow' : 'moon-glow'}`}>{icon}</span>
        <span className="greeting-text">{greeting}, {user?.name}</span>
      </div>
      <div className="stat-row">
        {statsConfig.map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.key}
              className="stat-card"
              style={{ animationDelay: `${i * 0.12 + 0.2}s` }}
            >
              <span className="stat-icon"><StatIcon size={32} /></span>
              <span className="stat-value">{userStats[stat.key]}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          );
        })}
      </div>
      <div className="dashboard-sections">
        <OngoingPrograms />
        <TechnologiesSection />
      </div>
      {/* Optional: animated background shapes here */}
    </div>
  );
}