import React from 'react';
import { AppState } from './types';
import { useAppState } from './hooks/useAppState';
import { HomeScreen } from './components/screens/HomeScreen';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { ErrorScreen } from './components/screens/ErrorScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { WordOrderScreen } from './components/screens/WordOrderScreen';
import { ReviewScreen } from './components/screens/ReviewScreen';
import { ResultScreen } from './components/screens/ResultScreen';

const App: React.FC = () => {
  const {
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
    setAppState,
    setTopic,
    setPartOfSpeech,
    setQuizType,
    setSelectedChoice,
    handleSelectStory,
    handleGenerate,
    checkAnswer,
    nextQuestion,
    restartQuiz,
    resetToHome,
    handleWordSelect,
    handleWordRemove,
  } = useAppState();

  const currentQuizItem = currentQuizItems[currentIndex];
  const currentWordOrderItem = currentWordOrderItems[currentIndex];
  
  return (
    <div className="font-sans text-gray-900 antialiased selection:bg-indigo-100 selection:text-indigo-800">
      {appState === AppState.HOME && (
        <HomeScreen
          topic={topic}
          partOfSpeech={partOfSpeech}
          quizType={quizType}
          selectedStoryId={selectedStoryId}
          onTopicChange={setTopic}
          onPartOfSpeechChange={setPartOfSpeech}
          onQuizTypeChange={setQuizType}
          onGenerate={handleGenerate}
          onSelectStory={handleSelectStory}
        />
      )}
      
      {appState === AppState.LOADING && <LoadingScreen />}
      
      {appState === AppState.ERROR && (
        <ErrorScreen
          errorMsg={errorMsg}
          onRetry={() => setAppState(AppState.HOME)}
        />
      )}
      
      {appState === AppState.QUIZ && quizType === 'multipleChoice' && currentQuizItem && (
        <QuizScreen
          item={currentQuizItem}
          currentIndex={currentIndex}
          totalQuestions={currentQuizItems.length}
          selectedChoice={selectedChoice}
          feedback={feedback}
          stats={stats}
          onChoiceSelect={setSelectedChoice}
          onCheckAnswer={checkAnswer}
          onNextQuestion={nextQuestion}
          onClose={() => setAppState(AppState.HOME)}
        />
      )}

      {appState === AppState.QUIZ && quizType === 'wordOrder' && currentWordOrderItem && (
        <WordOrderScreen
          item={currentWordOrderItem}
          currentIndex={currentIndex}
          totalQuestions={currentWordOrderItems.length}
          selectedWords={selectedWords}
          feedback={feedback}
          stats={stats}
          onWordSelect={handleWordSelect}
          onWordRemove={handleWordRemove}
          onCheckAnswer={checkAnswer}
          onNextQuestion={nextQuestion}
          onClose={() => setAppState(AppState.HOME)}
        />
      )}
      
      {appState === AppState.RESULT && story && (
        <ResultScreen
          story={story}
          stats={stats}
          onReviewStory={() => setAppState(AppState.REVIEW)}
          onTryAgain={restartQuiz}
          onNewTopic={resetToHome}
        />
      )}
      
      {appState === AppState.REVIEW && story && (
        <ReviewScreen
          story={story}
          onClose={() => setAppState(AppState.RESULT)}
          onRestartQuiz={restartQuiz}
          onNewTopic={resetToHome}
        />
      )}
    </div>
  );
};

export default App;