import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Global error handler for non-React errors (e.g. import failures, syntax errors in other files)
window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
        <div style="background:#0f172a;color:#ef4444;padding:20px;height:100vh;font-family:monospace;overflow:auto;">
          <h1>Global/System Error</h1>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Source:</strong> ${source}</p>
          <p><strong>Line:</strong> ${lineno}:${colno}</p>
          <pre style="background:#1e293b;padding:10px;margin-top:10px;border-radius:4px;">${error ? error.stack : 'No stack trace'}</pre>
          <button onclick="localStorage.clear();window.location.reload()" style="margin-top:20px;padding:10px 20px;background:#ef4444;color:white;border:none;border-radius:4px;">Reset & Reload</button>
        </div>
      `;
  }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

console.log("Main mounting...");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
);
