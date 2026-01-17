import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Debug: Log environment variable loading
    console.log('[vite.config] Loading environment variables...');
    console.log('[vite.config] GEMINI_API_KEY found:', !!env.GEMINI_API_KEY);
    console.log('[vite.config] GEMINI_API_KEY length:', env.GEMINI_API_KEY?.length || 0);
    
    if (!env.GEMINI_API_KEY) {
      console.warn('[vite.config] WARNING: GEMINI_API_KEY is not set in .env file!');
      console.warn('[vite.config] Please create a .env file with GEMINI_API_KEY=your_key_here');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
