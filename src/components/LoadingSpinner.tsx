import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'default' | 'dots' | 'pulse';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  variant = 'default'
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16',
    large: 'h-24 w-24'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full h-full w-full flex items-center justify-center">
              <span className="text-white text-xl">📈</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative">
            {/* 外圈 */}
            <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
            {/* 内圈 - 旋转的渐变圈 */}
            <div className={`${sizeClasses[size]} absolute top-0 left-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin`}></div>
            {/* 中心图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-pulse">💰</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-4 p-8">
      {renderSpinner()}
      {message && (
        <div className="text-center">
          <p className="text-white/80 font-medium text-sm md:text-base animate-pulse">
            {message}
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;