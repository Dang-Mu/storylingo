import { Story } from '../types';

// Available story files
export const AVAILABLE_STORIES = [
  { id: 'Cinderella', name: 'Cinderella', filename: 'Cinderella.json' },
  { id: 'HanselAndGretel', name: 'Hansel and Gretel', filename: 'HanselAndGretel.json' },
  { id: 'LittleRedRidingHood', name: 'Little Red Riding Hood', filename: 'LittleRedRidingHood.json' },
  { id: 'SnowWhite', name: 'Snow White', filename: 'SnowWhite.json' },
  { id: 'TheThreeLittlePigs', name: 'The Three Little Pigs', filename: 'TheThreeLittlePigs.json' },
  { id: 'HeungbuAndNolbu', name: 'Heungbu and Nolbu', filename: 'HeungbuAndNolbu.json' },
  { id: 'KongjwiAndPatjwi', name: 'Kongjwi and Patjwi', filename: 'KongjwiAndPatjwi.json' },
  { id: 'TheSunAndTheMoon', name: 'The Sun and the Moon', filename: 'TheSunAndTheMoon.json' },
  { id: 'TheFairyAndTheWoodcutter', name: 'The Fairy and the Woodcutter', filename: 'TheFairyAndTheWoodcutter.json' },
  { id: 'TheRabbitAndTheDragonKing', name: 'The Rabbit and the Dragon King', filename: 'TheRabbitAndTheDragonKing.json' },
  { id: 'SimCheong', name: 'Sim Cheong', filename: 'SimCheong.json' },
  { id: 'TheTigerAndTheDriedPersimmon', name: 'The Tiger and the Dried Persimmon', filename: 'TheTigerAndTheDriedPersimmon.json' },
  { id: 'TheGoblinsMagicClub', name: 'The Goblin\'s Magic Club', filename: 'TheGoblinsMagicClub.json' },
  { id: 'TheSnailBride', name: 'The Snail Bride', filename: 'TheSnailBride.json' },
  { id: 'TheGreenFrog', name: 'The Green Frog', filename: 'TheGreenFrog.json' },
] as const;

export type StoryId = typeof AVAILABLE_STORIES[number]['id'];

interface StoryFile {
  title: string;
  sentences: Array<{
    english: string;
    korean: string;
    targetWordEnglish: string;
    targetWordKorean: string;
  }>;
}

/**
 * Load a story from a JSON file
 */
export const loadStoryFromFile = async (filename: string): Promise<Story> => {
  try {
    const response = await fetch(`/data/${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load story file: ${response.statusText}`);
    }
    
    const data: StoryFile = await response.json();
    
    // Validate the loaded data
    if (!data.title || !data.sentences || !Array.isArray(data.sentences)) {
      throw new Error('Invalid story file format: missing title or sentences');
    }
    
    if (data.sentences.length === 0) {
      throw new Error('Story file contains no sentences');
    }
    
    // Convert to Story type (add topic field)
    const story: Story = {
      title: data.title,
      topic: data.title, // Use title as topic for JSON stories
      sentences: data.sentences.map(s => ({
        english: s.english,
        korean: s.korean,
        targetWordEnglish: s.targetWordEnglish,
        targetWordKorean: s.targetWordKorean,
      })),
    };
    
    return story;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`스토리 파일 로드 실패: ${error.message}`);
    }
    throw new Error('스토리 파일을 로드하는 중 알 수 없는 오류가 발생했습니다.');
  }
};

/**
 * Get story by ID
 */
export const getStoryById = async (storyId: StoryId): Promise<Story> => {
  const storyInfo = AVAILABLE_STORIES.find(s => s.id === storyId);
  
  if (!storyInfo) {
    throw new Error(`Story with ID "${storyId}" not found`);
  }
  
  return loadStoryFromFile(storyInfo.filename);
};
