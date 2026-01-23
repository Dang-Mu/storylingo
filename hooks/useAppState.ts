import { useState, useCallback } from 'react';
import { generateStory } from '../services/geminiService';
import { getStoryById, StoryId } from '../services/storyService';
import { prepareQuizItem } from '../utils/quizUtils';
import { Story, QuizItem, AppState, UserStats, PartOfSpeech } from '../types';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [topic, setTopic] = useState<string>('The Little Prince');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('all');
  const [selectedStoryId, setSelectedStoryId] = useState<StoryId | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [currentQuizItems, setCurrentQuizItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [stats, setStats] = useState<UserStats>({ totalQuestions: 0, correctAnswers: 0, streak: 0 });
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSelectStory = useCallback((storyId: StoryId) => {
    // 같은 스토리를 다시 클릭하면 선택 해제
    if (selectedStoryId === storyId) {
      setSelectedStoryId(null);
      setTopic('The Little Prince'); // 기본값으로 복원
    } else {
      setSelectedStoryId(storyId);
      setTopic(''); // 스토리 선택 시 topic 초기화
    }
  }, [selectedStoryId]);

  const handleLoadStory = useCallback(async (storyId: StoryId) => {
    setAppState(AppState.LOADING);
    setErrorMsg('');

    try {
      const loadedStory = await getStoryById(storyId);
      
      setStory(loadedStory);
      setTopic(loadedStory.title);
      
      // 품사 필터링 적용
      let filteredSentences = loadedStory.sentences;
      if (partOfSpeech !== 'all') {
        filteredSentences = loadedStory.sentences.filter(s => 
          s.partOfSpeech === partOfSpeech || !s.partOfSpeech // 품사 정보가 없으면 포함
        );
        // 필터링 후 문장이 없으면 원본 사용
        if (filteredSentences.length === 0) {
          filteredSentences = loadedStory.sentences;
        }
      }
      
      const items = filteredSentences.map(prepareQuizItem);
      setCurrentQuizItems(items);
      setCurrentIndex(0);
      setSelectedChoice(null);
      setFeedback('idle');
      setAppState(AppState.QUIZ);
    } catch (err) {
      let errorMessage = "Failed to load story. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      
      setErrorMsg(errorMessage);
      setAppState(AppState.ERROR);
    }
  }, [partOfSpeech]);

  const handleGenerate = useCallback(async () => {
    // 선택된 스토리가 있으면 스토리 로드
    if (selectedStoryId) {
      await handleLoadStory(selectedStoryId);
      return;
    }
    
    // topic이 없으면 리턴
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
        generateStory(topic, partOfSpeech),
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
      setSelectedChoice(null);
      setFeedback('idle');
      setAppState(AppState.QUIZ);
    } catch (err) {
      let errorMessage = "Failed to generate story. Please check your connection and try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      
      setErrorMsg(errorMessage);
      setAppState(AppState.ERROR);
    }
  }, [topic, partOfSpeech, selectedStoryId, handleLoadStory]);

  const checkAnswer = useCallback(() => {
    if (!currentQuizItems[currentIndex] || selectedChoice === null) {
      return;
    }

    const currentItem = currentQuizItems[currentIndex];
    const isCorrect = selectedChoice === currentItem.correctIndex;

    if (isCorrect) {
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
  }, [currentQuizItems, currentIndex, selectedChoice]);

  const nextQuestion = useCallback(() => {
    setSelectedChoice(null);
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
    setSelectedChoice(null);
    setFeedback('idle');
    setAppState(AppState.QUIZ);
  }, []);

  const resetToHome = useCallback(() => {
    setStats({ totalQuestions: 0, correctAnswers: 0, streak: 0 });
    setTopic('');
    setSelectedStoryId(null);
    setAppState(AppState.HOME);
  }, []);

  return {
    // State
    appState,
    topic,
    partOfSpeech,
    selectedStoryId,
    story,
    currentQuizItems,
    currentIndex,
    selectedChoice,
    feedback,
    stats,
    errorMsg,
    // Setters
    setAppState,
    setTopic,
    setPartOfSpeech,
    setSelectedChoice,
    // Actions
    handleSelectStory,
    handleLoadStory,
    handleGenerate,
    checkAnswer,
    nextQuestion,
    restartQuiz,
    resetToHome,
  };
};
