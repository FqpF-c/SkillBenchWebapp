import React from 'react';
import { Sun, Moon, Flame, DollarSign, Star } from 'lucide-react';

const WelcomeHeader = () => {
  const userStats = {
    xp: 46,
    coins: 0,
    streaks: 0
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'GOOD MORNING', icon: Sun };
    if (hour < 17) return { text: 'GOOD AFTERNOON', icon: Sun };
    return { text: 'GOOD EVENING', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="relative gradient-purple rounded-b-[60px] px-6 pt-16 pb-32 overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/20 rounded-full animate-pulse"
              style={{
                width: `${(i + 1) * 48}px`,
                height: `${(i + 1) * 48}px`,
                top: '15%',
                right: '15%',
                transform: 'translate(50%, -50%)',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-8 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-32 right-20 w-3 h-3 bg-accent-pink/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute top-48 left-16 w-2 h-2 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10">
        {/* Greeting Section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <GreetingIcon className="text-accent-pink" size={18} />
          </div>
          <span className="text-accent-pink text-sm font-semibold tracking-wider">
            {greeting.text}
          </span>
        </div>

        {/* User Name Section */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-secondary text-3xl font-medium">Hi,</span>
          <span className="text-white text-3xl font-semibold">Tester</span>
        </div>

        {/* Decorative Line */}
        <div className="relative mb-12">
          <div className="w-24 h-1.5 bg-secondary rounded-full" />
          <div className="absolute top-0 left-0 w-12 h-1.5 bg-white/30 rounded-full animate-pulse" />
        </div>

        {/* Enhanced Stats Pills */}
        <div className="flex items-center justify-between gap-4">
          <div className="stat-pill group hover:scale-105 transition-transform duration-200">
            <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Flame className="text-orange-300" size={14} />
            </div>
            <span className="font-bold">{userStats.streaks}</span>
            <span className="text-xs opacity-80">Streak</span>
          </div>
          
          <div className="stat-pill group hover:scale-105 transition-transform duration-200">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-300" size={14} />
            </div>
            <span className="font-bold">{userStats.coins}</span>
            <span className="text-xs opacity-80">Coins</span>
          </div>
          
          <div className="stat-pill group hover:scale-105 transition-transform duration-200">
            <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Star className="text-purple-300" size={14} />
            </div>
            <span className="font-bold">{userStats.xp}</span>
            <span className="text-xs opacity-80">XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;