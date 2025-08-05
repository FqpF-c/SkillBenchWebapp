import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import TopicCard from './TopicCard';

const CategorySection = ({ category, topics = [], icon, gradient, maxTopics = 4 }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  const handleSubcategoryClick = (subcategory, category) => {
    // Navigate to category page with the subcategory pre-selected
    navigate(`/category/${encodeURIComponent(category)}?subcategory=${encodeURIComponent(subcategory)}`);
  };

  const getGradientClasses = () => {
    switch (gradient) {
      case 'purple':
        return 'from-purple-500 to-purple-600';
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'orange':
        return 'from-orange-500 to-orange-600';
      case 'pink':
        return 'from-pink-500 to-pink-600';
      case 'indigo':
        return 'from-indigo-500 to-indigo-600';
      case 'teal':
        return 'from-teal-500 to-teal-600';
      case 'red':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const displayedSubcategories = topics.slice(0, maxTopics);
  const hasMoreSubcategories = topics.length > maxTopics;

  return (
    <div className="mb-8">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br ${getGradientClasses()} rounded-lg p-3`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{category}</h3>
            <p className="text-gray-600 text-sm">
              {topics.length} {topics.length === 1 ? 'subcategory' : 'subcategories'} available
            </p>
          </div>
        </div>
        
        {/* View All Button */}
        <button
          onClick={handleViewAll}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
        >
          <Eye size={16} />
          <span className="font-medium">View All</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>

      {/* Subcategory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedSubcategories.map((subcategory, index) => (
          <TopicCard
            key={`${category}-${subcategory}-${index}`}
            topic={subcategory} // Using topic prop for subcategory
            category={category}
            icon={icon}
            gradient={gradient}
            onClick={handleSubcategoryClick}
          />
        ))}
      </div>

      {/* Show More Indicator */}
      {hasMoreSubcategories && (
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            +{topics.length - maxTopics} more subcategories available
          </p>
        </div>
      )}
    </div>
  );
};

export default CategorySection; 