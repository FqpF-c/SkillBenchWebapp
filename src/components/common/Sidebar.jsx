import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Trophy, User, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'academics', label: 'Academics', icon: GraduationCap, path: '/academics' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="text-white" size={20} />
        ) : (
          <Menu className="text-white" size={20} />
        )}
      </button>

      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static top-0 left-0 h-screen w-72 bg-gradient-to-b from-pink-50 via-white to-purple-50 
        shadow-xl border-r border-purple-100 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-6 border-b border-purple-100">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SkillBench
              </h1>
              <p className="text-xs text-gray-500">Learn & Excel</p>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`
                        w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group
                        ${active 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                          : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:text-purple-700'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${active 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-purple-100'
                        }
                      `}>
                        <Icon 
                          size={20} 
                          className={`
                            transition-all duration-300
                            ${active ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'}
                          `} 
                        />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-purple-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;