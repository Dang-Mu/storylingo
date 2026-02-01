import { Sentence, QuizItem, WordOrderItem } from '../types';

// 간단한 오답 생성 함수 (wrongAnswers가 없을 때 사용)
const generateWrongAnswers = (correctAnswer: string, partOfSpeech?: string): string[] => {
  // 기본 오답 리스트 (품사별)
  const defaultWrongAnswers: Record<string, string[]> = {
    noun: ['thing', 'place', 'person', 'object', 'item', 'stuff', 'matter', 'subject'],
    verb: ['do', 'make', 'get', 'take', 'go', 'come', 'see', 'know'],
    adjective: ['good', 'bad', 'big', 'small', 'new', 'old', 'nice', 'fine'],
    adverb: ['well', 'badly', 'quickly', 'slowly', 'carefully', 'easily', 'hardly', 'really'],
  };

  const wrongAnswers = partOfSpeech && defaultWrongAnswers[partOfSpeech] 
    ? defaultWrongAnswers[partOfSpeech] 
    : ['thing', 'do', 'good', 'well'];

  // 정답과 다른 단어들만 필터링
  const filtered = wrongAnswers.filter(w => w.toLowerCase() !== correctAnswer.toLowerCase());
  
  // 3개만 반환
  return filtered.slice(0, 3);
};

// 선택지를 섞는 함수 (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const prepareQuizItem = (sentence: Sentence): QuizItem => {
  console.log('[quizUtils] prepareQuizItem called for sentence:', {
    english: sentence.english.substring(0, 50) + '...',
    targetWord: sentence.targetWordEnglish
  });

  const targetWord = sentence.targetWordEnglish;

  // Split the original sentence by the target word to create parts
  // We use a regex to capture the word to ensure we match the right instance
  // escapeRegExp logic for safety
  const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTarget})`, 'i');
  
  console.log('[quizUtils] Escaped target word:', escapedTarget);
  const parts = sentence.english.split(regex);
  console.log('[quizUtils] Sentence split into', parts.length, 'parts');
  
  // If split didn't work as expected (e.g. word not found exactly), handle gracefully
  if (parts.length < 3) {
    console.warn('[quizUtils] WARNING: Target word not found properly. Parts length:', parts.length);
    console.warn('[quizUtils] Sentence:', sentence.english);
    console.warn('[quizUtils] Target word:', targetWord);
    
    // 오답 생성
    let wrongAnswers = sentence.wrongAnswers || generateWrongAnswers(targetWord, sentence.partOfSpeech);
    
    // wrongAnswers가 배열이 아니거나 길이가 3이 아니면 재생성
    if (!Array.isArray(wrongAnswers) || wrongAnswers.length !== 3) {
      wrongAnswers = generateWrongAnswers(targetWord, sentence.partOfSpeech);
    }
    
    // 정답과 같은 단어 제거
    wrongAnswers = wrongAnswers.filter(w => w.toLowerCase() !== targetWord.toLowerCase());
    
    // 정확히 3개가 되도록 조정
    while (wrongAnswers.length < 3) {
      const additionalWrong = generateWrongAnswers(targetWord, sentence.partOfSpeech);
      for (const w of additionalWrong) {
        if (wrongAnswers.length >= 3) break;
        if (w.toLowerCase() !== targetWord.toLowerCase() && !wrongAnswers.includes(w)) {
          wrongAnswers.push(w);
        }
      }
      // 무한 루프 방지
      if (wrongAnswers.length < 3) {
        wrongAnswers.push('option1', 'option2', 'option3');
        break;
      }
    }
    wrongAnswers = wrongAnswers.slice(0, 3);
    
    const allChoices = [targetWord, ...wrongAnswers];
    const shuffledChoices = shuffleArray(allChoices);
    const correctIndex = shuffledChoices.findIndex(c => c.toLowerCase() === targetWord.toLowerCase());
    
    return {
      sentence,
      hiddenWord: targetWord,
      parts: [sentence.english, '', ''],
      choices: shuffledChoices,
      correctIndex: correctIndex >= 0 ? correctIndex : 0
    };
  }

  // We take the first match. 
  // parts[0] is prefix, parts[1] is the match (because of capturing group), parts[2...] is suffix
  const prefix = parts[0];
  const actualWordInSentence = parts[1];
  const suffix = parts.slice(2).join('');

  // 오답 생성
  let wrongAnswers = sentence.wrongAnswers || generateWrongAnswers(actualWordInSentence, sentence.partOfSpeech);
  
  // wrongAnswers가 배열이 아니거나 길이가 3이 아니면 재생성
  if (!Array.isArray(wrongAnswers) || wrongAnswers.length !== 3) {
    wrongAnswers = generateWrongAnswers(actualWordInSentence, sentence.partOfSpeech);
  }
  
  // 정답과 같은 단어 제거
  wrongAnswers = wrongAnswers.filter(w => w.toLowerCase() !== actualWordInSentence.toLowerCase());
  
  // 정확히 3개가 되도록 조정
  while (wrongAnswers.length < 3) {
    const additionalWrong = generateWrongAnswers(actualWordInSentence, sentence.partOfSpeech);
    for (const w of additionalWrong) {
      if (wrongAnswers.length >= 3) break;
      if (w.toLowerCase() !== actualWordInSentence.toLowerCase() && !wrongAnswers.includes(w)) {
        wrongAnswers.push(w);
      }
    }
    // 무한 루프 방지
    if (wrongAnswers.length < 3) {
      wrongAnswers.push('option1', 'option2', 'option3');
      break;
    }
  }
  wrongAnswers = wrongAnswers.slice(0, 3);
  
  // 정답과 오답을 합쳐서 섞기
  const allChoices = [actualWordInSentence, ...wrongAnswers];
  const shuffledChoices = shuffleArray(allChoices);
  
  // 정답의 인덱스 찾기
  const correctIndex = shuffledChoices.findIndex(c => c.toLowerCase() === actualWordInSentence.toLowerCase());

  console.log('[quizUtils] Quiz item prepared:', {
    prefix: prefix.substring(0, 30) + '...',
    hiddenWord: actualWordInSentence,
    suffixLength: suffix.length,
    choices: shuffledChoices,
    correctIndex
  });

  return {
    sentence,
    hiddenWord: actualWordInSentence,
    parts: [prefix, actualWordInSentence, suffix],
    choices: shuffledChoices,
    correctIndex: correctIndex >= 0 ? correctIndex : 0
  };
};

/**
 * 문장을 단어 배열 문제로 변환
 */
export const prepareWordOrderItem = (sentence: Sentence): WordOrderItem => {
  console.log('[quizUtils] prepareWordOrderItem called for sentence:', {
    english: sentence.english.substring(0, 50) + '...',
  });

  // 문장을 단어로 분리 (구두점 제거 후 공백으로 분리)
  const words = sentence.english
    .replace(/[.,!?;:]/g, '') // 구두점 제거
    .split(/\s+/) // 공백으로 분리
    .filter(word => word.length > 0); // 빈 문자열 제거

  // 단어 배열 섞기
  const shuffledWords = shuffleArray([...words]);

  // 섞인 배열 각 위치의 원본 인덱스: origIndexByShuffledPos[i] = 원본에서의 인덱스
  const origIndexByShuffledPos: number[] = [];
  const usedIndices = new Set<number>();
  for (const shuffledWord of shuffledWords) {
    for (let i = 0; i < words.length; i++) {
      if (words[i] === shuffledWord && !usedIndices.has(i)) {
        origIndexByShuffledPos.push(i);
        usedIndices.add(i);
        break;
      }
    }
  }

  // 정답 선택 순서: 출력 위치 j에 선택해야 할 섞인 배열 인덱스 (UI·채점에서 사용)
  const correctOrder = Array.from(
    { length: origIndexByShuffledPos.length },
    (_, j) => origIndexByShuffledPos.indexOf(j)
  );

  console.log('[quizUtils] Word order item prepared:', {
    originalWords: words,
    shuffledWords: shuffledWords,
    correctOrder
  });

  return {
    sentence,
    words: shuffledWords,
    correctOrder
  };
};