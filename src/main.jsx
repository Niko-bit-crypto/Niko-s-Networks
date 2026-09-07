import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './index.css';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find #root container");
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (err) {
  console.error("Critical mounting error in Niko's Nightclub:", err);
  if (window.__NIKO_CRASH_HANDLER__) {
    window.__NIKO_CRASH_HANDLER__(err?.message || "Failed to initialize React");
  }
}

