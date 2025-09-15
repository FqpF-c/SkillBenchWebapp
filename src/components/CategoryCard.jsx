import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ title, iconSrc, icon, backgroundColor, onClick, href }) => {
  const Wrapper = href ? Link : 'button';
  const wrapperProps = href ? { to: href } : { type: 'button', onClick };

  // Clean background style
  const backgroundStyle = backgroundColor 
    ? { backgroundColor: backgroundColor }
    : { backgroundColor: '#F8FAFC' };

  return (
    <Wrapper
      aria-label={title}
      className="group relative w-[160px] h-[180px] flex-shrink-0 rounded-3xl bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-105 hover:border-white/50 focus-visible:ring-2 focus-visible:ring-primary/30 flex flex-col items-center justify-center p-6 active:scale-[0.95] overflow-visible z-10"
      style={{
        ...backgroundStyle,
        background: `linear-gradient(135deg, ${backgroundColor || '#F8FAFC'} 0%, rgba(255,255,255,0.8) 100%)`,
        transformOrigin: 'center',
        willChange: 'transform, box-shadow',
        width: '160px',
        height: '180px',
        minWidth: '160px',
        maxWidth: '160px',
        minHeight: '180px',
        maxHeight: '180px',
        flexShrink: 0,
        flexGrow: 0,
        boxSizing: 'border-box'
      }}
      {...wrapperProps}
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm shadow-xl border border-white/60 flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-2xl">
        {iconSrc ? (
          <img src={iconSrc} alt={title} className="w-10 h-10 object-contain transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span className="text-3xl filter drop-shadow-lg transition-transform duration-500 group-hover:scale-110">{icon || '📚'}</span>
        )}
      </div>
      
      <div className="relative z-10 text-sm font-bold text-gray-800 text-center line-clamp-2 leading-tight tracking-wide transition-colors duration-300 group-hover:text-gray-900">
        {title}
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse"></div>
      <div className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 group-hover:animate-pulse"></div>
    </Wrapper>
  );
};

export default CategoryCard;


