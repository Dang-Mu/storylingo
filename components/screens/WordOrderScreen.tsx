import React from 'react';
import { WordOrderItem, UserStats } from '../../types';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { HighlightedText } from '../HighlightedText';
import { CheckIcon } from '../icons/CheckIcon';

interface WordOrderScreenProps {
  item: WordOrderItem;
  currentIndex: number;
  totalQuestions: number;
  selectedWords: number[]; // 선택된 단어들의 인덱스 배열
  feedback: 'idle' | 'correct' | 'incorrect';
  stats: UserStats;
  onWordSelect: (wordIndex: number) => void;
  onWordRemove: (position: number) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  onClose: () => void;
}

export const WordOrderScreen: React.FC<WordOrderScreenProps> = ({
  item,
  currentIndex,
  totalQuestions,
  selectedWords,
  feedback,
  stats,
  onWordSelect,
  onWordRemove,
  onCheckAnswer,
  onNextQuestion,
  onClose,
}) => {
  const isAnswered = feedback !== 'idle';
  const isCorrect = feedback === 'correct';

  // 사용 가능한 단어들 (아직 선택되지 않은 단어들)
  // selectedWords는 선택된 단어의 인덱스 배열이므로, 해당 인덱스의 단어들을 제외
  const availableWords = item.words
    .map((word, index) => ({ word, index }))
    .filter(({ index }) => !selectedWords.includes(index))
    .map(({ word, index }) => ({ word, originalIndex: index }));

  // 정답 문장 (원본 문장에서 구두점만 제거)
  const correctSentence = item.sentence.english.replace(/[.,!?;:]/g, '');

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
          단어 배열하기
        </h3>

        {/* Korean Hint */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <p className="text-2xl font-bold text-gray-800 leading-relaxed text-center break-keep">
            <HighlightedText 
              text={item.sentence.korean} 
              highlight={item.sentence.targetWordKorean} 
            />
          </p>
        </div>

        {/* Selected Words (User's Answer) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">문장 만들기</label>
          <div className="min-h-[80px] bg-white p-4 rounded-xl border-2 border-gray-200 flex flex-wrap gap-2 items-center">
            {selectedWords.length === 0 ? (
              <span className="text-gray-400 italic">단어를 선택하여 문장을 만드세요</span>
            ) : (
              selectedWords.map((wordIndex, position) => {
                const word = item.words[wordIndex];
                const isCorrectPosition =
                  isAnswered && (isCorrect || item.correctOrder[position] === wordIndex);
                const isWrongPosition = isAnswered && !isCorrectPosition;

                return (
                  <button
                    key={`${wordIndex}-${position}`}
                    onClick={() => !isAnswered && onWordRemove(position)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isAnswered
                        ? isCorrectPosition
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : isWrongPosition
                          ? 'bg-red-100 text-red-700 border-2 border-red-300 line-through'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                        : 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300 hover:bg-indigo-200 cursor-pointer'
                    }`}
                    disabled={isAnswered}
                  >
                    {word}
                    {!isAnswered && (
                      <span className="ml-2 text-indigo-500">×</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Available Words */}
        {!isAnswered && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">사용 가능한 단어</label>
            <div className="flex flex-wrap gap-2">
              {availableWords.map(({ word, originalIndex }) => (
                <button
                  key={`available-${originalIndex}`}
                  onClick={() => onWordSelect(originalIndex)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show Correct Answer */}
        {isAnswered && (
          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-2">정답:</p>
            <p className="text-lg font-bold text-green-700">{correctSentence}</p>
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
            disabled={selectedWords.length !== item.words.length}
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
