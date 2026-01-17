import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
      <h2 className="text-xl font-bold text-indigo-900">Writing your story...</h2>
      <p className="text-indigo-500">Generating sentences and quizzes</p>
    </div>
  );
};
