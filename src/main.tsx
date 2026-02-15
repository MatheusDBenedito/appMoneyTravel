import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('Main.tsx: Starting application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Main.tsx: Root element not found!');
  } else {
    console.log('Main.tsx: Root element found, mounting React...');
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
    console.log('Main.tsx: Render called.');
  }
} catch (err) {
  console.error('Main.tsx: Exception during startup:', err);
}

