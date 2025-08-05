import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const TopicCard = ({ topic, category, icon, gradient, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(topic, category);
    } else {
      // Default navigation to category page with topic pre-selected
      navigate(`/category/${encodeURIComponent(category)}?topic=${encodeURIComponent(topic)}`);
    }
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
      className={`bg-gradient-to-br ${getGradientClasses()} rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-1">{topic}</h4>
            <p className="text-white/80 text-xs">{category}</p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="text-white" size={20} />
        </div>
      </div>
    </div>
  );
};

export default TopicCard; 