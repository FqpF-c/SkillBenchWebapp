import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Trophy, User, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'home',
      label: 'Home', 
      icon: Home, 
      path: '/'
    },
    { 
      id: 'academics',
      label: 'Academics', 
      icon: GraduationCap, 
      path: '/academics'
    },
    { 
      id: 'leaderboard',
      label: 'Leaderboard', 
      icon: Trophy, 
      path: '/leaderboard'
    },
    { 
      id: 'profile',
      label: 'Profile', 
      icon: User, 
      path: '/profile'
    }
  ];

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="text-white" size={20} />
        ) : (
          <Menu className="text-white" size={20} />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 h-screen w-72 bg-gradient-to-b from-pink-50 via-white to-purple-50 
        shadow-xl border-r border-purple-100 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex flex-col items-center py-8 px-6">
          {/* Logo */}
          <div className="relative mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full border-2 border-white" />
          </div>

          {/* Brand Name */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8 tracking-wide">
            SkillBench
          </h1>

          {/* Navigation */}
          <nav className="w-full space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`
                    group relative w-full flex items-center gap-4 p-4 rounded-2xl font-medium
                    transition-all duration-300 ease-in-out transform hover:scale-105
                    ${active 
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-primary shadow-lg border border-purple-200' 
                      : 'text-gray-600 hover:text-primary hover:bg-purple-50'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-secondary to-primary rounded-r-full" />
                  )}

                  {/* Icon Container */}
                  <div className={`
                    relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${active 
                      ? 'bg-gradient-to-br from-primary/10 to-secondary/10' 
                      : 'bg-gray-100 group-hover:bg-purple-100'
                    }
                  `}>
                    <Icon 
                      size={20} 
                      className={`
                        transition-all duration-300
                        ${active ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}
                      `} 
                    />
                    
                    {/* Glow Effect */}
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl blur-sm" />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`
                    transition-all duration-300 font-medium
                    ${active ? 'text-primary font-semibold' : 'group-hover:text-primary'}
                  `}>
                    {item.label}
                  </span>

                  {/* Hover Effect */}
                  <div className={`
                    absolute inset-0 rounded-2xl transition-opacity duration-300
                    ${active 
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 opacity-100' 
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-50'
                    }
                    -z-10
                  `} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-4 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl" />
        <div className="absolute bottom-8 left-4 w-16 h-16 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-xl" />
      </aside>
    </>
  );
};

export default Sidebar;