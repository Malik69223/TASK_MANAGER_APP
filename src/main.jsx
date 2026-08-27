import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Purge any cached demo token/tasks from previous preview sessions
if (localStorage.getItem('taskmanager_auth_token') === 'mock_jwt_token_demo') {
  localStorage.removeItem('taskmanager_auth_token');
  localStorage.removeItem('taskmanager_auth_user');
}
const cachedTasks = localStorage.getItem('taskmanager_tasks_data');
if (cachedTasks && (cachedTasks.includes('task_1') || cachedTasks.includes('System Architecture'))) {
  localStorage.setItem('taskmanager_tasks_data', JSON.stringify([]));
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
