import React from 'react';
import { Story, UserStats } from '../../types';
import { Button } from '../Button';

interface ResultScreenProps {
  story: Story | null;
  stats: UserStats;
  onReviewStory: () => void;
  onTryAgain: () => void;
  onNewTopic: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  story,
  stats,
  onReviewStory,
  onTryAgain,
  onNewTopic,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white max-w-lg mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block p-4 rounded-full bg-yellow-100 mb-6">
           <span className="text-6xl">🏆</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Story Completed!</h2>
        <p className="text-gray-500 text-lg">You studied "{story?.title}"</p>
      </div>

      <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <span className="text-gray-600">Total Questions</span>
          <span className="font-bold text-gray-900">{stats.totalQuestions}</span>
        </div>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <span className="text-gray-600">Correct Answers</span>
          <span className="font-bold text-green-600">{stats.correctAnswers}</span>
        </div>
        <div className="flex justify-between items-center">
           <span className="text-gray-600">Accuracy</span>
           <span className="font-bold text-indigo-600">
             {stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0}%
           </span>
        </div>
      </div>

      <div className="w-full space-y-3">
        <Button fullWidth onClick={onReviewStory} variant="secondary">
          Review Story
        </Button>
        <Button fullWidth onClick={onTryAgain} variant="outline">
          Try Again
        </Button>
        <Button fullWidth onClick={onNewTopic} variant="outline" className="border-gray-300 text-gray-500 hover:bg-gray-50">
          New Topic
        </Button>
      </div>
    </div>
  );
};
