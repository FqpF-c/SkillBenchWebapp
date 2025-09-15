import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, BarChart3 } from 'lucide-react';

const WelcomeHubCard = ({ stats, isLoading = false }) => {
  const statsData = [
    {
      label: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500'
    },
    {
      label: 'Active Users',
      value: stats?.active_users || 0,
      icon: MapPin,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500'
    },
    {
      label: 'In Rankings',
      value: stats?.filtered_users || 0,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-6 lg:px-8 mt-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 mt-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <motion.div 
            key={index} 
            className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl hover:border-purple-200/50 hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 150,
              damping: 20
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300`}>
                <stat.icon className="text-white" size={20} />
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium mb-1 group-hover:text-gray-700 transition-colors duration-300">
                  {stat.label}
                </p>
                <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                  {stat.value.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeHubCard;