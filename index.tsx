import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[index] Application starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[index] ERROR: Could not find root element');
  throw new Error("Could not find root element to mount to");
}

console.log('[index] Root element found, creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('[index] Rendering App component...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('[index] Application rendered successfully');