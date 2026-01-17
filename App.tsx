import React from 'react';
import { AppState } from './types';
import { useAppState } from './hooks/useAppState';
import { HomeScreen } from './components/screens/HomeScreen';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { ErrorScreen } from './components/screens/ErrorScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { ReviewScreen } from './components/screens/ReviewScreen';
import { ResultScreen } from './components/screens/ResultScreen';

const App: React.FC = () => {
  const {
    appState,
    topic,
    story,
    currentQuizItems,
    currentIndex,
    userInput,
    feedback,
    stats,
    errorMsg,
    setAppState,
    setTopic,
    setUserInput,
    handleLoadStory,
    handleGenerate,
    checkAnswer,
    nextQuestion,
    restartQuiz,
    resetToHome,
  } = useAppState();

  const currentQuizItem = currentQuizItems[currentIndex];
  
  return (
    <div className="font-sans text-gray-900 antialiased selection:bg-indigo-100 selection:text-indigo-800">
      {appState === AppState.HOME && (
        <HomeScreen
          topic={topic}
          onTopicChange={setTopic}
          onGenerate={handleGenerate}
          onLoadStory={handleLoadStory}
        />
      )}
      
      {appState === AppState.LOADING && <LoadingScreen />}
      
      {appState === AppState.ERROR && (
        <ErrorScreen
          errorMsg={errorMsg}
          onRetry={() => setAppState(AppState.HOME)}
        />
      )}
      
      {appState === AppState.QUIZ && currentQuizItem && (
        <QuizScreen
          item={currentQuizItem}
          currentIndex={currentIndex}
          totalQuestions={currentQuizItems.length}
          userInput={userInput}
          feedback={feedback}
          stats={stats}
          onInputChange={setUserInput}
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