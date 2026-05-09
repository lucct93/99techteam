// Problem 2: currency swap form. Vite + React + TS.
// Run: `npm install && npm run dev`. Build: `npm run build`.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
