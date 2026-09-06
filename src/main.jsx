import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Clear outdated service worker caches to force immediate update in user browsers
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    }).catch(() => {});
  }
} catch (e) {
  console.warn('Cache clearing notice:', e);
}

// Purge any cached demo token/tasks from previous preview sessions
try {
  if (localStorage.getItem('taskmanager_auth_token') === 'mock_jwt_token_demo') {
    localStorage.removeItem('taskmanager_auth_token');
    localStorage.removeItem('taskmanager_auth_user');
  }
} catch (e) {}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
