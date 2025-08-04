import React, { useState, useEffect } from 'react';
import { ChevronRight, Code2 } from 'lucide-react';

const ProgrammingLanguages = ({ 
  categoryItems, 
  categoryTitles, 
  displayTitles, 
  getAssetForTopic, 
  getColorForTopic 
}) => {
  const navigateToListTopics = (categoryId, expandedTopic = null) => {
    console.log('Navigate to topics:', categoryId, expandedTopic);
  };

  const renderCategoryGrid = (categoryId, items) => {
    const itemsToShow = items.slice(0, 6);
    const hasMore = items.length > 6;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {displayTitles[categoryId] || categoryId}
          </h3>
          <button
            onClick={() => navigateToListTopics(categoryId)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            View All
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {itemsToShow.map((item, index) => (
            <div
              key={index}
              onClick={() => navigateToListTopics(categoryId, item.name)}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 border border-gray-200 hover:border-purple-200">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-3 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: getColorForTopic(item.name) }}
                  >
                    <Code2 size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors line-clamp-2">
                    {item.name}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigateToListTopics(categoryId)}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
            >
              +{items.length - 6} more topics
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!categoryTitles || categoryTitles.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Programming Languages</h2>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code2 className="text-gray-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Programming Languages Found</h3>
          <p className="text-gray-600">Check browser console for debug information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Programming Languages</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryTitles.map((categoryId) => (
          categoryItems[categoryId] && categoryItems[categoryId].length > 0 && (
            <div key={categoryId}>
              {renderCategoryGrid(categoryId, categoryItems[categoryId])}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default ProgrammingLanguages;