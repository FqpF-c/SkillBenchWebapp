import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Trophy, User } from 'lucide-react';

const BottomNav = ({ currentIndex = 0, onChange, items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use provided items or default tabs
  const tabs = items || [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'academics', label: 'Academics', icon: GraduationCap, path: '/academics' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl px-3 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (onChange) {
                    onChange(tabs.indexOf(tab));
                  } else {
                    navigate(tab.path);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-purple-900 text-white shadow-md'
                    : 'text-primary/80 hover:bg-black/5'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;