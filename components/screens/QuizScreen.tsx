import React from 'react';
import { QuizItem, UserStats } from '../../types';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { HighlightedText } from '../HighlightedText';
import { CheckIcon } from '../icons/CheckIcon';

interface QuizScreenProps {
  item: QuizItem;
  currentIndex: number;
  totalQuestions: number;
  selectedChoice: number | null;
  feedback: 'idle' | 'correct' | 'incorrect';
  stats: UserStats;
  onChoiceSelect: (index: number) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  onClose: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  item,
  currentIndex,
  totalQuestions,
  selectedChoice,
  feedback,
  stats,
  onChoiceSelect,
  onCheckAnswer,
  onNextQuestion,
  onClose,
}) => {
  const isAnswered = feedback !== 'idle';
  const isCorrect = feedback === 'correct';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-lg mx-auto shadow-xl">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 font-bold cursor-pointer" onClick={onClose}>✕</span>
          <div className="w-32">
            <ProgressBar current={currentIndex} total={totalQuestions} />
          </div>
        </div>
        <div className="flex items-center space-x-1 text-orange-500 font-bold">
          <span>🔥 {stats.streak}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-6 overflow-y-auto pb-40">
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide mb-6">
          Choose the correct answer
        </h3>

        {/* Korean Hint with Underline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <p className="text-2xl font-bold text-gray-800 leading-relaxed text-center break-keep">
            <HighlightedText 
              text={item.sentence.korean} 
              highlight={item.sentence.targetWordKorean} 
            />
          </p>
        </div>

        {/* English Sentence with Blank */}
        <div className="text-xl text-gray-700 leading-relaxed font-medium mb-8">
          <span>{item.parts[0]}</span>
          <span className="inline-block mx-1 relative">
             {isAnswered ? (
               <span className={`font-bold px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 line-through'}`}>
                 {isCorrect ? item.hiddenWord : (selectedChoice !== null ? item.choices[selectedChoice] : '')}
               </span>
             ) : (
               <span className="inline-block w-20 border-b-2 border-indigo-300 align-bottom h-6"></span>
             )}
          </span>
          <span>{item.parts[2]}</span>
          
          {/* Show correct answer if incorrect */}
          {feedback === 'incorrect' && (
            <div className="mt-2 text-green-600 font-bold text-lg animate-pulse">
              정답: {item.hiddenWord}
            </div>
          )}
        </div>

        {/* Multiple Choice Options */}
        {!isAnswered && (
          <div className="mt-auto space-y-3">
            {item.choices.map((choice, index) => {
              const isSelected = selectedChoice === index;
              return (
                <button
                  key={index}
                  onClick={() => onChoiceSelect(index)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg">{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Show selected answer when answered */}
        {isAnswered && selectedChoice !== null && (
          <div className="mt-4 space-y-3">
            {item.choices.map((choice, index) => {
              const isSelected = selectedChoice === index;
              const isCorrectChoice = index === item.correctIndex;
              const showAsCorrect = isCorrectChoice;
              const showAsWrong = isSelected && !isCorrectChoice;
              
              return (
                <div
                  key={index}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 ${
                    showAsCorrect
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : showAsWrong
                      ? 'border-red-500 bg-red-50 text-red-700 line-through'
                      : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                      showAsCorrect
                        ? 'bg-green-600 text-white'
                        : showAsWrong
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg">{choice}</span>
                    {showAsCorrect && <span className="ml-auto text-green-600 font-bold">✓ 정답</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className={`p-4 border-t sticky bottom-0 z-20 transition-colors duration-300 ${
        feedback === 'idle' ? 'bg-white border-gray-200' :
        feedback === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        {feedback === 'idle' ? (
          <Button 
            fullWidth 
            onClick={onCheckAnswer} 
            disabled={selectedChoice === null}
          >
            답안 확인
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {feedback === 'correct' ? <CheckIcon /> : <span className="text-xl font-bold px-1">✕</span>}
              </div>
              <div>
                <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                  {feedback === 'correct' ? '정답입니다!' : '오답입니다'}
                </p>
              </div>
            </div>
            <Button 
              onClick={onNextQuestion} 
              variant={feedback === 'correct' ? 'secondary' : 'danger'}
              className="px-8"
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
