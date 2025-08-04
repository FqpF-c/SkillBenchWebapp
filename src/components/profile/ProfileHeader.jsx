import React, { useState } from 'react';
import { Settings, Camera, Edit3, X } from 'lucide-react';

const ProfileHeader = () => {
  const [showImageSelector, setShowImageSelector] = useState(false);
  
  const user = {
    username: 'Tester',
    profileImage: null
  };

  const ImageSelectorModal = () => {
    if (!showImageSelector) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
        <div className="bg-white rounded-t-3xl w-full max-w-md">
          <div className="flex justify-center pt-4 pb-6">
            <div className="w-12 h-1.5 bg-secondary rounded-full" />
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">Choose Profile Picture</h3>
              <button
                onClick={() => setShowImageSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="text-gray-500" size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 8 }, (_, i) => i + 1).map((index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log(`Selected profile ${index}`);
                    setShowImageSelector(false);
                  }}
                  className="w-16 h-16 bg-accent-light rounded-full overflow-hidden border-2 border-secondary/30 hover:border-secondary transition-colors"
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                    <span className="text-primary font-bold">{index}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="text-center text-sm text-gray-600 mb-4">
                Or upload a custom image
              </p>
              
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => {
                    console.log('Camera selected');
                    setShowImageSelector(false);
                  }}
                  className="flex flex-col items-center gap-2 p-3 bg-accent-light rounded-lg hover:bg-accent-pink/50 transition-colors"
                >
                  <Camera className="text-secondary" size={24} />
                  <span className="text-sm font-medium text-primary">Camera</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('Gallery selected');
                    setShowImageSelector(false);
                  }}
                  className="flex flex-col items-center gap-2 p-3 bg-accent-light rounded-lg hover:bg-accent-pink/50 transition-colors"
                >
                  <Edit3 className="text-secondary" size={24} />
                  <span className="text-sm font-medium text-primary">Gallery</span>
                </button>
              </div>

              <button
                onClick={() => setShowImageSelector(false)}
                className="w-full py-3 bg-gray-100 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative gradient-pink rounded-b-[55px] pt-16 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-white/30 rounded-full"
                style={{
                  width: `${(i + 1) * 40}px`,
                  height: `${(i + 1) * 40}px`,
                  top: '30%',
                  right: '30%',
                  transform: 'translate(50%, -50%)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Settings Button */}
        <button className="absolute top-16 right-6 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
          <Settings className="text-white" size={20} />
        </button>

        {/* Profile Image - Positioned to overlap */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="relative">
            <div className="w-32 h-32 bg-accent-light rounded-full border-4 border-white shadow-xl overflow-hidden">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                  <span className="text-primary font-bold text-4xl">{user.username.charAt(0)}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowImageSelector(true)}
              className="absolute bottom-2 right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-secondary-dark transition-colors"
            >
              <Camera className="text-white" size={16} />
            </button>
          </div>
        </div>
      </div>

      <ImageSelectorModal />
    </>
  );
};

export default ProfileHeader;