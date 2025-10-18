// ============================================================================
// COMPONENT: Loading.jsx – Moderne loading states
// ============================================================================
import React from "react";

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`spinner ${sizes[size]} ${className}`}
      style={{
        borderTopColor: "#8b5cf6",
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
};

export const LoadingOverlay = ({ message = "Laster..." }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
};

export const SkeletonCard = ({ className = "" }) => {
  return (
    <div className={`skeleton rounded-xl ${className}`}>
      <div className="w-full h-48 bg-gray-800/50 rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-700/50 rounded w-3/4" />
        <div className="h-3 bg-gray-700/50 rounded w-1/2" />
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default LoadingSpinner;