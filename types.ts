export interface Sentence {
  english: string;
  korean: string;
  targetWordEnglish: string;
  targetWordKorean: string;
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