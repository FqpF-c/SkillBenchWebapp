import React from 'react';

const StatsCard = ({ icon: Icon, label, value, color = "text-purple-600" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${color.replace('text-', 'bg-').replace('-600', '-100')} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`${color} w-6 h-6`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

export default StatsCard;