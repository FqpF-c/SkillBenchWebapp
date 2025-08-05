import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const TechnologyCard = ({ category, icon, gradient, itemCount = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${encodeURIComponent(category)}`);
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

  return (
    <div
      onClick={handleClick}
      className={`bg-gradient-to-br ${getGradientClasses()} rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{category}</h3>
            <p className="text-white/80 text-sm">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};

export default TechnologyCard; 