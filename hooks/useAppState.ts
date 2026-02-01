import { useState, useCallback } from 'react';
import { generateStory } from '../services/geminiService';
import { getStoryById, StoryId } from '../services/storyService';
import { prepareQuizItem, prepareWordOrderItem } from '../utils/quizUtils';
import { Story, QuizItem, WordOrderItem, AppState, UserStats, PartOfSpeech, QuizType } from '../types';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [topic, setTopic] = useState<string>('The Little Prince');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('all');
  const [quizType, setQuizType] = useState<QuizType>('multipleChoice');
  const [selectedStoryId, setSelectedStoryId] = useState<StoryId | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [currentQuizItems, setCurrentQuizItems] = useState<QuizItem[]>([]);
  const [currentWordOrderItems, setCurrentWordOrderItems] = useState<WordOrderItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<number[]>([]); // 단어 배열 문제용
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
      
      if (quizType === 'wordOrder') {
        const items = filteredSentences.map(prepareWordOrderItem);
        setCurrentWordOrderItems(items);
        setCurrentQuizItems([]);
      } else {
        const items = filteredSentences.map(prepareQuizItem);
        setCurrentQuizItems(items);
        setCurrentWordOrderItems([]);
      }
      setCurrentIndex(0);
      setSelectedChoice(null);
      setSelectedWords([]);
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
  }, [partOfSpeech, quizType]);

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
      
      if (quizType === 'wordOrder') {
        const items = generatedStory.sentences.map(prepareWordOrderItem);
        setCurrentWordOrderItems(items);
        setCurrentQuizItems([]);
      } else {
        const items = generatedStory.sentences.map(prepareQuizItem);
        setCurrentQuizItems(items);
        setCurrentWordOrderItems([]);
      }
      setCurrentIndex(0);
      setSelectedChoice(null);
      setSelectedWords([]);
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
  }, [topic, partOfSpeech, quizType, selectedStoryId, handleLoadStory]);

  const checkAnswer = useCallback(() => {
    if (quizType === 'wordOrder') {
      if (!currentWordOrderItems[currentIndex] || selectedWords.length === 0) {
        return;
      }

      const currentItem = currentWordOrderItems[currentIndex];
      const isArticle = (w: string) => ['a', 'an', 'the'].includes(w.toLowerCase());
      const correctWords = currentItem.correctOrder.map((i) => currentItem.words[i]);
      const userWords = selectedWords.map((i) => currentItem.words[i]);

      // 관사(the, a, an)만 순서 유연. 나머지(had·had 같은 동일 단어 포함)는 위치별로 정확히 일치해야 함.
      const isCorrect = (() => {
        if (correctWords.length !== userWords.length) return false;
        for (let i = 0; i < correctWords.length; i++) {
          if (!isArticle(correctWords[i])) {
            if (userWords[i] !== correctWords[i]) return false;
          } else {
            if (!isArticle(userWords[i])) return false;
          }
        }
        const correctArticles = correctWords.filter(isArticle).map((w) => w.toLowerCase()).sort();
        const userArticles = userWords.filter(isArticle).map((w) => w.toLowerCase()).sort();
        if (correctArticles.length !== userArticles.length) return false;
        return correctArticles.every((a, i) => a === userArticles[i]);
      })();

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
    } else {
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
    }
  }, [quizType, currentQuizItems, currentWordOrderItems, currentIndex, selectedChoice, selectedWords]);

  const nextQuestion = useCallback(() => {
    setSelectedChoice(null);
    setSelectedWords([]);
    setFeedback('idle');
    
    const totalItems = quizType === 'wordOrder' ? currentWordOrderItems.length : currentQuizItems.length;
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setAppState(AppState.RESULT);
    }
  }, [currentIndex, quizType, currentQuizItems.length, currentWordOrderItems.length]);

  const restartQuiz = useCallback(() => {
    setStats({ totalQuestions: 0, correctAnswers: 0, streak: 0 });
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSelectedWords([]);
    setFeedback('idle');
    setAppState(AppState.QUIZ);
  }, []);

  const handleWordSelect = useCallback((wordIndex: number) => {
    setSelectedWords(prev => [...prev, wordIndex]);
  }, []);

  const handleWordRemove = useCallback((position: number) => {
    setSelectedWords(prev => prev.filter((_, idx) => idx !== position));
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
    quizType,
    selectedStoryId,
    story,
    currentQuizItems,
    currentWordOrderItems,
    currentIndex,
    selectedChoice,
    selectedWords,
    feedback,
    stats,
    errorMsg,
    // Setters
    setAppState,
    setTopic,
    setPartOfSpeech,
    setQuizType,
    setSelectedChoice,
    // Actions
    handleSelectStory,
    handleLoadStory,
    handleGenerate,
    checkAnswer,
    nextQuestion,
    restartQuiz,
    resetToHome,
    handleWordSelect,
    handleWordRemove,
  };
};
