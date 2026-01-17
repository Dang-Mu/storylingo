import { useState, useCallback } from 'react';
import { generateStory } from '../services/geminiService';
import { getStoryById, StoryId } from '../services/storyService';
import { prepareQuizItem } from '../utils/quizUtils';
import { Story, QuizItem, AppState, UserStats } from '../types';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [topic, setTopic] = useState<string>('The Little Prince');
  const [story, setStory] = useState<Story | null>(null);
  const [currentQuizItems, setCurrentQuizItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [stats, setStats] = useState<UserStats>({ totalQuestions: 0, correctAnswers: 0, streak: 0 });
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLoadStory = useCallback(async (storyId: StoryId) => {
    setAppState(AppState.LOADING);
    setErrorMsg('');

    try {
      const loadedStory = await getStoryById(storyId);
      
      setStory(loadedStory);
      setTopic(loadedStory.title);
      
      const items = loadedStory.sentences.map(prepareQuizItem);
      setCurrentQuizItems(items);
      setCurrentIndex(0);
      setAppState(AppState.QUIZ);
    } catch (err) {
      let errorMessage = "Failed to load story. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      
      setErrorMsg(errorMessage);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      return;
    }
    
    setAppState(AppState.LOADING);
    setErrorMsg('');

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('API 호출 타임아웃: 30초 이내에 응답을 받지 못했습니다.'));
        }, 30000);
      });
      
      const generatedStory = await Promise.race([
        generateStory(topic),
        timeoutPromise
      ]) as Story;
      
      // Validate the generated story before using it
      if (!generatedStory || !generatedStory.sentences || !Array.isArray(generatedStory.sentences)) {
        throw new Error('생성된 스토리가 올바른 형식이 아닙니다. sentences 배열이 없습니다.');
      }
      
      if (generatedStory.sentences.length === 0) {
        throw new Error('생성된 스토리에 문장이 없습니다.');
      }
      
      setStory(generatedStory);
      
      const items = generatedStory.sentences.map(prepareQuizItem);
      setCurrentQuizItems(items);
      setCurrentIndex(0);
      setAppState(AppState.QUIZ);
    } catch (err) {
      let errorMessage = "Failed to generate story. Please check your connection and try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      
      setErrorMsg(errorMessage);
      setAppState(AppState.ERROR);
    }
  }, [topic]);

  const checkAnswer = useCallback(() => {
    if (!currentQuizItems[currentIndex]) {
      return;
    }

    const target = currentQuizItems[currentIndex].hiddenWord.trim().toLowerCase();
    const input = userInput.trim().toLowerCase();

    if (input === target) {
      setFeedback('correct');
      setStats(prev => ({
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + 1,
        streak: prev.streak + 1
      }));
    } else {
      setFeedback('incorrect');
      setStats(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        streak: 0
      }));
    }
  }, [currentQuizItems, currentIndex, userInput]);

  const nextQuestion = useCallback(() => {
    setUserInput('');
    setFeedback('idle');
    
    if (currentIndex < currentQuizItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setAppState(AppState.RESULT);
    }
  }, [currentIndex, currentQuizItems.length]);

  const restartQuiz = useCallback(() => {
    setStats({ totalQuestions: 0, correctAnswers: 0, streak: 0 });
    setCurrentIndex(0);
    setFeedback('idle');
    setUserInput('');
    setAppState(AppState.QUIZ);
  }, []);

  const resetToHome = useCallback(() => {
    setStats({ totalQuestions: 0, correctAnswers: 0, streak: 0 });
    setTopic('');
    setAppState(AppState.HOME);
  }, []);

  return {
    // State
    appState,
    topic,
    story,
    currentQuizItems,
    currentIndex,
    userInput,
    feedback,
    stats,
    errorMsg,
    // Setters
    setAppState,
    setTopic,
    setUserInput,
    // Actions
    handleLoadStory,
    handleGenerate,
    checkAnswer,
    nextQuestion,
    restartQuiz,
    resetToHome,
  };
};
