import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Coins, Flame, Zap, Trophy } from 'lucide-react';

const StatsRow = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    coins: 0,
    streaks: 0,
    xp: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setStats({
        coins: user.coins || 0,
        streaks: user.streaks || 0,
        xp: user.xp || 0
      });
      setIsLoading(false);
    }
  }, [user]);

  const statItems = [
    {
      icon: Coins,
      value: stats.coins,
      label: 'Coins',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Flame,
      value: stats.streaks,
      label: 'Streaks',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Zap,
      value: stats.xp,
      label: 'XP',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-2xl p-6 min-w-48 h-24 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 mb-8">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 min-w-48 group"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className={`${item.color}`} size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {item.value.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${item.color}`}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;