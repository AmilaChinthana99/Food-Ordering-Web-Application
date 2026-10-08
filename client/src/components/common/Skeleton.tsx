import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 p-4 space-y-4">
      <div className="skeleton h-44 w-full rounded-xl"></div>
      <div className="space-y-2">
        <div className="skeleton h-5 w-3/4"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="skeleton h-6 w-20"></div>
        <div className="skeleton h-8 w-24 rounded-lg"></div>
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
