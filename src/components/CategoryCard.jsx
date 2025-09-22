import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryCard = ({ title, iconSrc, icon, backgroundColor, onClick, href }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const Wrapper = href ? Link : motion.button;
  const wrapperProps = href ? { to: href } : { type: 'button', onClick };

  // Clean background style
  const backgroundStyle = backgroundColor
    ? { backgroundColor: backgroundColor }
    : { backgroundColor: '#F8FAFC' };

  // Floating animation variants
  const floatingAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      className="relative"
      animate={floatingAnimation}
      whileHover={{
        y: -12,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <Wrapper
        aria-label={title}
        className="group relative w-[160px] h-[180px] flex-shrink-0 rounded-3xl bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-primary/30 flex flex-col items-center justify-center p-6 overflow-visible z-10 cursor-pointer"
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          rotateX: 5,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
        {...wrapperProps}
      >
        {/* Mouse follow gradient */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.3) 0%, transparent 70%)`
              : 'transparent'
          }}
        />

        {/* Glass morphism overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Enhanced icon container */}
        <motion.div
          className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm shadow-xl border border-white/60 flex items-center justify-center mb-5"
          whileHover={{
            scale: 1.2,
            rotate: 6,
            y: -4,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          animate={{
            boxShadow: isHovered
              ? "0 20px 40px -12px rgba(0, 0, 0, 0.25)"
              : "0 10px 20px -8px rgba(0, 0, 0, 0.15)"
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.2 }
            }}
          >
            {iconSrc ? (
              <img src={iconSrc} alt={title} className="w-10 h-10 object-contain" />
            ) : (
              <span className="text-3xl filter drop-shadow-lg">{icon || '📚'}</span>
            )}
          </motion.div>
        </motion.div>

        {/* Enhanced title */}
        <motion.div
          className="relative z-10 text-sm font-bold text-gray-800 text-center line-clamp-2 leading-tight tracking-wide"
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
        >
          {title}
        </motion.div>

        {/* Animated particles */}
        <motion.div
          className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{
            opacity: [0, 1, 0.7, 1],
            scale: [0, 1.2, 0.8, 1],
            transition: { duration: 0.6, ease: "easeOut" }
          }}
        />

        <motion.div
          className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{
            opacity: [0, 1, 0.8, 1],
            scale: [0, 1.3, 0.9, 1],
            transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
          }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
            backgroundSize: '200% 200%'
          }}
          whileHover={{
            opacity: 1,
            backgroundPosition: ['0% 0%', '100% 100%'],
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
        />
      </Wrapper>
    </motion.div>
  );
};

export default CategoryCard;


