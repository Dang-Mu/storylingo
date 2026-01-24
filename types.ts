export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'all';
export type QuizType = 'multipleChoice' | 'wordOrder';

export interface Sentence {
  english: string;
  korean: string;
  targetWordEnglish: string;
  targetWordKorean: string;
  partOfSpeech?: PartOfSpeech; // 품사 정보 (선택적)
  wrongAnswers?: string[]; // 오답 선택지 (3개)
}

export interface Story {
  title: string;
  topic: string;
  sentences: Sentence[];
}

export interface QuizItem {
  sentence: Sentence;
  hiddenWord: string;
  parts: string[]; // [prefix, hidden, suffix]
  choices: string[]; // 4개의 선택지 (정답 포함)
  correctIndex: number; // 정답의 인덱스 (0-3)
}

export interface WordOrderItem {
  sentence: Sentence;
  words: string[]; // 문장을 단어로 분리한 배열 (섞인 상태)
  correctOrder: number[]; // 정답 순서 (인덱스 배열)
}

export enum AppState {
  HOME = 'HOME',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  REVIEW = 'REVIEW',
  ERROR = 'ERROR'
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
}