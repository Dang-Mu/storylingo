import React from 'react';
import { Button } from '../Button';
import { BookIcon } from '../icons/BookIcon';
import { AVAILABLE_STORIES, StoryId } from '../../services/storyService';

interface HomeScreenProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onGenerate: () => void;
  onLoadStory: (storyId: StoryId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ topic, onTopicChange, onGenerate, onLoadStory }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      <div className="w-full max-w-md flex flex-col items-center">
        <BookIcon />
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">StoryLingo</h1>
        <p className="text-gray-500 mb-8 text-center">Learn English through stories. Enter a topic or choose a classic.</p>

        <div className="w-full space-y-4">
          {/* Classic Stories Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classic Stories</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_STORIES.map(story => (
                <button
                  key={story.id}
                  onClick={() => onLoadStory(story.id)}
                  className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 border border-indigo-200 transition-colors text-center"
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
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Custom Topic Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Create Your Own Story</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              placeholder="e.g. A space adventure, A detective story"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg transition-colors bg-white text-gray-900"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {['Fairy Tales', 'Travel', 'Business', 'Sci-Fi'].map(tag => (
              <button 
                key={tag}
                onClick={() => onTopicChange(tag)}
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
            disabled={!topic.trim()}
          >
            Generate Story
          </Button>
        </div>
      </div>
    </div>
  );
};
