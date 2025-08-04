import React from 'react';
import { Users, TrendingUp, Award } from 'lucide-react';
import Card from '../common/Card';

const StatsOverview = () => {
  const stats = [
    { icon: Users, label: 'Total Users', value: '29', color: 'text-blue-500' },
    { icon: TrendingUp, label: 'Active Users', value: '2', color: 'text-green-500' },
    { icon: Award, label: 'In Rankings', value: '29', color: 'text-orange-500' }
  ];

  return (
    <Card className="bg-white/20 backdrop-blur-md border-white/30">
      <div className="flex justify-between items-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className={`p-2 rounded-xl mb-2 ${stat.color.replace('text-', 'bg-')}/20`}>
              <stat.icon className={`${stat.color}`} size={20} />
            </div>
            <span className="text-white text-lg font-bold">{stat.value}</span>
            <span className="text-white/70 text-xs">{stat.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatsOverview;