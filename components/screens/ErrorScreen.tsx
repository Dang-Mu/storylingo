import React from 'react';
import { Button } from '../Button';

interface ErrorScreenProps {
  errorMsg: string;
  onRetry: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorMsg, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="text-red-500 text-6xl mb-4">!</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
      <p className="text-gray-600 mb-6">{errorMsg}</p>
      <Button onClick={onRetry} variant="secondary">Try Again</Button>
    </div>
  );
};
