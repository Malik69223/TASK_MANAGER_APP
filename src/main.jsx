import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Service worker caching and registration will be handled by vite-plugin-pwa

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
