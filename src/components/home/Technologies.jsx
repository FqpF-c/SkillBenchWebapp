import React from 'react';
import { ChevronRight, Code2 } from 'lucide-react';

const Technologies = ({ 
  categoryItems, 
  categoryTitles, 
  displayTitles,
  getAssetForTopic, 
  getColorForTopic 
}) => {
  const navigateToTechnology = (categoryId, technologyName) => {
    console.log('Navigate to technology:', categoryId, technologyName);
  };

  const getCategoryIdForTechnology = (technologyName) => {
    const normalizedTech = technologyName.toLowerCase();
    
    for (const categoryId of categoryTitles) {
      const items = categoryItems[categoryId] || [];
      const foundItem = items.find(item => 
        item.name && item.name.toLowerCase().includes(normalizedTech)
      );
      if (foundItem) {
        return categoryId;
      }
    }
    
    return categoryTitles[0] || 'Technologies';
  };

  const getTechnologiesFromCategories = () => {
    const allTechnologies = [];
    
    Object.entries(categoryItems).forEach(([categoryId, items]) => {
      if (categoryId !== 'ProgrammingLanguage') {
        items.forEach(item => {
          allTechnologies.push({
            ...item,
            categoryId,
            categoryName: displayTitles[categoryId] || categoryId
          });
        });
      }
    });
    
    return allTechnologies.slice(0, 8);
  };

  const technologies = getTechnologiesFromCategories();

  if (!technologies || technologies.length === 0) {
    return (
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Technologies</h2>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code2 className="text-gray-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Technologies Found</h3>
          <p className="text-gray-600">Technology topics will appear here when available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Technologies</h2>
        <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
          View All
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {technologies.map((tech, index) => (
          <div
            key={index}
            onClick={() => navigateToTechnology(tech.categoryId, tech.name)}
            className="group cursor-pointer"
            style={{
              animation: `fadeInUp 0.6s ease forwards`,
              animationDelay: `${index * 0.1}s`,
              opacity: 0
            }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: getColorForTopic(tech.name) }}
                >
                  <Code2 size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 text-base group-hover:text-purple-700 transition-colors mb-2">
                  {tech.name}
                </h4>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {tech.categoryName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1; 
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Technologies;