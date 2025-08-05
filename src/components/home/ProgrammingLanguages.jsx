import React, { useState, useEffect } from 'react';
import { usePrepData } from '../../hooks/usePrepData';
import { useAuth } from '../../context/AuthContext';

const ProgrammingLanguages = () => {
  const { prepData, loading } = usePrepData();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Programming Language');

  // Filter for programming languages only
  const programmingCategories = prepData.categoryTitles.filter(category => 
    category.toLowerCase().includes('programming') || 
    category.toLowerCase().includes('language')
  );

  const getAssetForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    
    const topicAssetMap = {
      'c': '/assets/programming/c.png',
      'c++': '/assets/programming/cpp.png',
      'cpp': '/assets/programming/cpp.png',
      'java': '/assets/programming/java.png',
      'python': '/assets/programming/python.png',
      'kotlin': '/assets/programming/kotlin.png',
      'swift': '/assets/programming/swift.png',
      'flutter': '/assets/programming/flutter.png',
      'react': '/assets/programming/react.png',
      'react native': '/assets/programming/react.png',
      'web development': '/assets/programming/web_development.png',
      'web': '/assets/programming/web_development.png',
      'aws': '/assets/programming/aws.png',
      'javascript': '/assets/programming/javascript.png',
      'js': '/assets/programming/javascript.png',
      'html': '/assets/programming/html.png',
      'css': '/assets/programming/css.png',
    };
    
    return topicAssetMap[normalizedName] || '/assets/programming/default.png';
  };

  const getColorForTopic = (topicName) => {
    const normalizedName = topicName.toLowerCase().trim();
    
    const categoryColors = {
      'c': '#5C6BC0',
      'c++': '#42A5F5',
      'java': '#EF5350',
      'python': '#66BB6A',
      'kotlin': '#AB47BC',
      'swift': '#FF7043',
      'flutter': '#29B6F6',
      'react': '#26C6DA',
      'web development': '#26A69A',
      'aws': '#FF9800',
      'javascript': '#F7DF1E',
      'html': '#E34F26',
      'css': '#1572B6',
    };
    
    return categoryColors[normalizedName] || '#366D9C';
  };

  const getLanguageBackgroundGradient = (language) => {
    const gradients = {
      'swift': ['#FFE0D5', '#FFF5F2'],
      'dart': ['#D6E8FF', '#F2F7FF'],
      'python': ['#D9EBFF', '#F5F9FF'],
      'javascript': ['#FFF6D6', '#FFFDF5'],
      'js': ['#FFF6D6', '#FFFDF5'],
      'java': ['#FFDDDD', '#FFF5F5'],
      'c#': ['#EADDFF', '#F9F5FF'],
      'csharp': ['#EADDFF', '#F9F5FF'],
      'c++': ['#D6EBFF', '#F2F8FF'],
      'cpp': ['#D6EBFF', '#F2F8FF'],
      'c': ['#E0E7FF', '#F4F7FF'],
      'ruby': ['#FFDDE3', '#FFF5F7'],
      'go': ['#D6F5FA', '#F2FDFF'],
      'golang': ['#D6F5FA', '#F2FDFF'],
      'kotlin': ['#E4DDFF', '#F7F5FF'],
      'typescript': ['#D6E5F9', '#F2F8FF'],
      'php': ['#DDE1FF', '#F5F7FF'],
      'r': ['#DEEBFF', '#F7FAFF'],
      'html': ['#FFE8D9', '#FFF9F5'],
      'html5': ['#FFE8D9', '#FFF9F5'],
      'css': ['#D9F0FF', '#F5FAFF'],
      'css3': ['#D9F0FF', '#F5FAFF'],
      'react': ['#D9F8FF', '#F4FDFF'],
      'react.js': ['#D9F8FF', '#F4FDFF'],
      'angular': ['#FFDADA', '#FFF5F5'],
      'vue': ['#DFFCE9', '#F6FFF9'],
      'vue.js': ['#DFFCE9', '#F6FFF9'],
      'node': ['#E2FFD9', '#F7FFF5'],
      'node.js': ['#E2FFD9', '#F7FFF5'],
      'aws': ['#FFECD6', '#FFF9F0'],
      'amazon web services': ['#FFECD6', '#FFF9F0'],
      'azure': ['#D6E5FF', '#F5F9FF'],
      'microsoft azure': ['#D6E5FF', '#F5F9FF'],
      'gcp': ['#F5E6FF', '#FBF5FF'],
      'google cloud': ['#F5E6FF', '#FBF5FF'],
      'docker': ['#D9F2FF', '#F5FBFF'],
      'kubernetes': ['#D9EAFF', '#F5F9FF'],
      'k8s': ['#D9EAFF', '#F5F9FF'],
      'android': ['#E5FFD9', '#F9FFF5'],
      'ios': ['#EBEBFF', '#F7F7FF'],
      'flutter': ['#D9EDFF', '#F5FAFF'],
      'react native': ['#D9F8FF', '#F4FDFF'],
      'xamarin': ['#D9E6FF', '#F5F9FF'],
      'ui/ux': ['#FBE2FF', '#FEF7FF'],
      'ui': ['#FBE2FF', '#FEF7FF'],
      'ux': ['#FBE2FF', '#FEF7FF'],
      'database': ['#E5E2FF', '#F9F8FF'],
      'sql': ['#E5E2FF', '#F9F8FF'],
      'devops': ['#FFE2DF', '#FFF7F6'],
      'machine learning': ['#E2F8FF', '#F7FDFF'],
      'ml': ['#E2F8FF', '#F7FDFF'],
      'ai': ['#E2F8FF', '#F7FDFF'],
      'data science': ['#E8E2FF', '#F9F7FF'],
      'blockchain': ['#FFEED9', '#FFFAF5'],
      'web development': ['#D9EEFF', '#F5FAFF'],
      'app development': ['#E0FFEC', '#F5FFF9'],
      'cloud computing': ['#E7F0FF', '#F9FBFF'],
      'general skills': ['#F5E8FF', '#FCF7FF'],
      'excel': ['#E8F5E8', '#F7FDF7'],
      'microsoft excel': ['#E8F5E8', '#F7FDF7'],
      'powerpoint': ['#FFE4D6', '#FFF7F2'],
      'microsoft powerpoint': ['#FFE4D6', '#FFF7F2'],
      'ppt': ['#FFE4D6', '#FFF7F2'],
    };

    return gradients[language.toLowerCase()] || ['#EDE5F4', '#F9F5FF'];
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    // Navigate to topics list
    console.log('Navigating to category:', categoryId);
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
        <p className="text-gray-600">Please log in to view programming languages</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {programmingCategories.map((categoryId) => {
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
                const gradient = getLanguageBackgroundGradient(name);

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

export default ProgrammingLanguages;