import React from 'react';
import { Story } from '../../types';
import { Button } from '../Button';
import { HighlightedText } from '../HighlightedText';

interface ReviewScreenProps {
  story: Story;
  onClose: () => void;
  onRestartQuiz: () => void;
  onNewTopic: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  story,
  onClose,
  onRestartQuiz,
  onNewTopic,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-lg mx-auto shadow-xl">
      <div className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 truncate pr-4">{story.title}</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 font-medium"
        >
          Close
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto pb-24">
        {story.sentences.map((sentence, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-lg text-gray-800 mb-3 leading-relaxed">
               <HighlightedText 
                  text={sentence.english} 
                  highlight={sentence.targetWordEnglish} 
               />
            </div>
            <div className="text-base text-gray-500 font-medium border-t border-gray-100 pt-3">
              <HighlightedText 
                  text={sentence.korean} 
                  highlight={sentence.targetWordKorean} 
               />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white sticky bottom-0 z-20 space-y-3">
        <Button fullWidth onClick={onRestartQuiz}>
          Retake Quiz
        </Button>
        <Button fullWidth variant="outline" onClick={onNewTopic}>
          New Topic
        </Button>
      </div>
    </div>
  );
};
