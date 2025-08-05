import React, { useState, useEffect } from 'react';
import { Coins, Zap, Flame } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(interval);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [isVisible, value]);

  const getIconColor = () => {
    switch (color) {
      case 'gold':
        return 'text-yellow-500';
      case 'purple':
        return 'text-purple-500';
      case 'orange':
        return 'text-orange-500';
      default:
        return 'text-blue-500';
    }
  };

  const getBgColor = () => {
    switch (color) {
      case 'gold':
        return 'bg-yellow-50 border-yellow-200';
      case 'purple':
        return 'bg-purple-50 border-purple-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`${getBgColor()} border rounded-2xl p-6 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{animatedValue}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white shadow-sm ${getIconColor()}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard; 