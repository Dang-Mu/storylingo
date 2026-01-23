import { Story } from '../types';

// Available story files
export const AVAILABLE_STORIES = [
  { id: 'Cinderella', name: '신데렐라', filename: 'Cinderella.json' },
  { id: 'HanselAndGretel', name: '헨젤과 그레텔', filename: 'HanselAndGretel.json' },
  { id: 'LittleRedRidingHood', name: '빨간 모자', filename: 'LittleRedRidingHood.json' },
  { id: 'SnowWhite', name: '백설공주', filename: 'SnowWhite.json' },
  { id: 'TheThreeLittlePigs', name: '아기 돼지 삼형제', filename: 'TheThreeLittlePigs.json' },
  { id: 'HeungbuAndNolbu', name: '흥부와 놀부', filename: 'HeungbuAndNolbu.json' },
  { id: 'KongjwiAndPatjwi', name: '콩쥐 팥쥐', filename: 'KongjwiAndPatjwi.json' },
  { id: 'TheSunAndTheMoon', name: '해와 달', filename: 'TheSunAndTheMoon.json' },
  { id: 'TheFairyAndTheWoodcutter', name: '선녀와 나무꾼', filename: 'TheFairyAndTheWoodcutter.json' },
  { id: 'TheRabbitAndTheDragonKing', name: '토끼와 용왕', filename: 'TheRabbitAndTheDragonKing.json' },
  { id: 'SimCheong', name: '심청', filename: 'SimCheong.json' },
  { id: 'TheTigerAndTheDriedPersimmon', name: '호랑이와 곶감', filename: 'TheTigerAndTheDriedPersimmon.json' },
  { id: 'TheGoblinsMagicClub', name: '도깨비 방망이', filename: 'TheGoblinsMagicClub.json' },
  { id: 'TheSnailBride', name: '달봉이', filename: 'TheSnailBride.json' },
  { id: 'TheGreenFrog', name: '청개구리', filename: 'TheGreenFrog.json' },
] as const;

export type StoryId = typeof AVAILABLE_STORIES[number]['id'];

interface StoryFile {
  title: string;
  sentences: Array<{
    english: string;
    korean: string;
    targetWordEnglish: string;
    targetWordKorean: string;
    partOfSpeech?: string;
    wrongAnswers?: string[];
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
        partOfSpeech: s.partOfSpeech as any, // Optional field
        wrongAnswers: s.wrongAnswers, // Optional field
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
