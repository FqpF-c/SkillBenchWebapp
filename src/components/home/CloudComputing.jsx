import React, { useState } from 'react';
import { usePrepData } from '../../hooks/usePrepData';
import { useAuth } from '../../context/AuthContext';

const CloudComputing = () => {
  const { prepData, loading } = usePrepData();
  const { isAuthenticated } = useAuth();

  // Filter for cloud computing categories
  const cloudCategories = prepData.categoryTitles.filter(category => 
    category.toLowerCase().includes('cloud') || 
    category.toLowerCase().includes('aws') ||
    category.toLowerCase().includes('azure') ||
    category.toLowerCase().includes('gcp')
  );

  const getAssetForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    
    const topicAssetMap = {
      'aws': '/assets/programming/aws.png',
      'azure': '/assets/programming/azure.png',
      'gcp': '/assets/programming/google-cloud.png',
      'docker': '/assets/programming/docker.png',
      'kubernetes': '/assets/programming/kubernetes.png',
      'terraform': '/assets/programming/terraform.png',
      'jenkins': '/assets/programming/jenkins.png',
      'gitlab': '/assets/programming/gitlab.png',
      'github': '/assets/programming/github.png',
    };
    
    return topicAssetMap[normalizedName] || '/assets/programming/default.png';
  };

  const getColorForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    
    const categoryColors = {
      'aws': '#FF9800',
      'azure': '#0078D4',
      'gcp': '#4285F4',
      'docker': '#2496ED',
      'kubernetes': '#326CE5',
      'terraform': '#7B42BC',
      'jenkins': '#D33833',
      'gitlab': '#FC6D26',
      'github': '#181717',
    };
    
    return categoryColors[normalizedName] || '#366D9C';
  };

  const getCloudBackgroundGradient = (service) => {
    const gradients = {
      'aws': ['#FFECD6', '#FFF9F0'],
      'azure': ['#D6E5FF', '#F5F9FF'],
      'gcp': ['#F5E6FF', '#FBF5FF'],
      'docker': ['#D9F2FF', '#F5FBFF'],
      'kubernetes': ['#D9EAFF', '#F5F9FF'],
      'terraform': ['#E8E2FF', '#F9F7FF'],
      'jenkins': ['#FFE2DF', '#FFF7F6'],
      'gitlab': ['#FFE2DF', '#FFF7F6'],
      'github': ['#FFE2DF', '#FFF7F6'],
    };

    return gradients[service.toLowerCase()] || ['#E7F0FF', '#F9FBFF'];
  };

  const handleCategoryClick = (categoryId) => {
    console.log('Navigating to cloud category:', categoryId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view cloud computing services</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cloudCategories.map((categoryId) => {
        const items = prepData.categoryItems[categoryId] || [];
        const title = prepData.displayTitles[categoryId] || categoryId;

        if (items.length === 0) return null;

        return (
          <div key={categoryId} className="space-y-4">
            <div className="flex justify-between items-center px-5">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={() => handleCategoryClick(categoryId)}
                className="text-sm text-purple-600 font-medium hover:text-purple-700"
              >
                View all
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 px-5">
              {items.map((item, index) => {
                const name = item.name || 'Unknown';
                const color = item.color || getColorForTopic(name);
                const gradient = getCloudBackgroundGradient(name);

                return (
                  <div
                    key={index}
                    onClick={() => handleCategoryClick(categoryId)}
                    className="flex-shrink-0 w-48 h-36 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className="w-12 h-12 mb-3">
                        <img
                          src={getAssetForTopic(name)}
                          alt={name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-full h-full items-center justify-center text-2xl"
                          style={{ display: 'none', color }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 text-center leading-tight">
                        {name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CloudComputing; 