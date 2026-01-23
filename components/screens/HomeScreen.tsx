import React from 'react';
import { Button } from '../Button';
import { BookIcon } from '../icons/BookIcon';
import { AVAILABLE_STORIES, StoryId } from '../../services/storyService';
import { PartOfSpeech } from '../../types';

interface HomeScreenProps {
  topic: string;
  partOfSpeech: PartOfSpeech;
  selectedStoryId: StoryId | null;
  onTopicChange: (topic: string) => void;
  onPartOfSpeechChange: (pos: PartOfSpeech) => void;
  onGenerate: () => void;
  onSelectStory: (storyId: StoryId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  topic, 
  partOfSpeech,
  selectedStoryId,
  onTopicChange, 
  onPartOfSpeechChange,
  onGenerate, 
  onSelectStory 
}) => {
  const partOfSpeechOptions: { value: PartOfSpeech; label: string; emoji: string }[] = [
    { value: 'all', label: '전체', emoji: '📚' },
    { value: 'noun', label: '명사', emoji: '🏷️' },
    { value: 'verb', label: '동사', emoji: '⚡' },
    { value: 'adjective', label: '형용사', emoji: '✨' },
    { value: 'adverb', label: '부사', emoji: '🌟' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      <div className="w-full max-w-md flex flex-col items-center">
        <BookIcon />
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">StoryLingo</h1>
        <p className="text-gray-500 mb-8 text-center">스토리로 영어를 배워보세요. 주제를 입력하거나 클래식을 선택하세요.</p>

        <div className="w-full space-y-4">
          {/* Part of Speech Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">품사 선택</label>
            <div className="grid grid-cols-5 gap-2">
              {partOfSpeechOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onPartOfSpeechChange(option.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    partOfSpeech === option.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                  title={option.label}
                >
                  <div className="text-lg mb-1">{option.emoji}</div>
                  <div className="text-xs">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Classic Stories Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">클래식 스토리</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_STORIES.map(story => (
                <button
                  key={story.id}
                  onClick={() => {
                    // 같은 스토리를 다시 클릭하면 선택 해제
                    if (selectedStoryId === story.id) {
                      onSelectStory(story.id); // handleSelectStory에서 null로 처리하도록 수정 필요
                    } else {
                      onSelectStory(story.id);
                    }
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors border text-center ${
                    selectedStoryId === story.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {story.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Custom Topic Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">나만의 스토리 만들기</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                onTopicChange(e.target.value);
                // topic 입력 시 선택된 스토리 해제
                if (selectedStoryId) {
                  // 같은 스토리를 다시 클릭하면 해제되는 효과
                  onSelectStory(selectedStoryId);
                }
              }}
              placeholder="예: 우주 모험, 탐정 이야기"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg transition-colors bg-white text-gray-900"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {['동화', '여행', '비즈니스', 'SF'].map(tag => (
              <button 
                key={tag}
                onClick={() => {
                  onTopicChange(tag);
                  // 태그 선택 시 선택된 스토리 해제
                  if (selectedStoryId) {
                    // 같은 스토리를 다시 클릭하면 해제되는 효과
                    onSelectStory(selectedStoryId);
                  }
                }}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200"
              >
                {tag}
              </button>
            ))}
          </div>

          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onGenerate();
            }} 
            fullWidth 
            disabled={!topic.trim() && !selectedStoryId}
          >
            {selectedStoryId ? '스토리 시작' : '스토리 생성'}
          </Button>
        </div>
      </div>
    </div>
  );
};
