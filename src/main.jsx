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
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: #07040d; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; font-family: monospace; text-align: center;">
        <h2 style="color: #ff007f;">ARCADE INITIALIZATION ERROR</h2>
        <p style="color: #00f0ff;">${err?.message || 'Error initializing application'}</p>
        <button onclick="localStorage.clear(); window.location.reload();" style="margin-top: 16px; padding: 10px 20px; background: #39ff14; color: #000; font-weight: bold; border: none; cursor: pointer;">REBOOT ARCADE</button>
      </div>
    `;
  }
}

