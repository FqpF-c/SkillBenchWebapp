import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-2xl shadow-lg border border-gray-100 p-6';
  const hoverStyles = hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-300' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;