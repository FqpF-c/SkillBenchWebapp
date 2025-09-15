import React from 'react';
import CategoryCard from './CategoryCard';

const CategoryGrid = ({ items, onItemClick, tileColorByCategory, gradientColors }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item, idx) => (
        <CategoryCard
          key={idx}
          title={item.name || item.title || 'Item'}
          iconSrc={item.iconSrc}
          icon={item.icon}
          tileClassName={tileColorByCategory}
          gradientColors={gradientColors}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;


