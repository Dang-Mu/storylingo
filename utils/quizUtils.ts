import { Sentence, QuizItem } from '../types';

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
    
    return {
      sentence,
      hiddenWord: targetWord,
      parts: [sentence.english, '', '']
    };
  }

  // We take the first match. 
  // parts[0] is prefix, parts[1] is the match (because of capturing group), parts[2...] is suffix
  const prefix = parts[0];
  const actualWordInSentence = parts[1];
  const suffix = parts.slice(2).join('');

  console.log('[quizUtils] Quiz item prepared:', {
    prefix: prefix.substring(0, 30) + '...',
    hiddenWord: actualWordInSentence,
    suffixLength: suffix.length
  });

  return {
    sentence,
    hiddenWord: actualWordInSentence,
    parts: [prefix, actualWordInSentence, suffix]
  };
};