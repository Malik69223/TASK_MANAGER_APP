import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { useAuth } from './hooks/useAuth';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Toast } from './components/common/Toast';
import { TaskModal } from './components/tasks/TaskModal';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Analytics } from './pages/Analytics';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';

// Application Main Layout Wrapper
const ProtectedLayout = ({ children, onOpenAddTask, onEditTask }) => {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar onOpenAddTask={onOpenAddTask} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenAddTask={onOpenAddTask} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav />
    </div>
  );
};


export const AppContent = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);

  // Open add-habit modal, optionally with a pre-filled due date (from Calendar)
  const handleOpenAddTask = (prefilledDate = null) => {
    setTaskToEdit(null);
    setDefaultDate(prefilledDate || null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setDefaultDate(null);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
    setDefaultDate(null);
  };

  return (
    <BrowserRouter>
      {/* Global Toast Notification */}
      <Toast />

      {/* Global Add / Edit Habit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        taskToEdit={taskToEdit}
        defaultDate={defaultDate}
      />

      <Routes>
        {/* Auth Routes redirected directly to Dashboard */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />


        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedLayout onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask}>
              <Dashboard onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedLayout onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask}>
              <Tasks onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedLayout onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask}>
              <Calendar onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedLayout onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask}>
              <Analytics />
            </ProtectedLayout>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedLayout onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask}>
              <Categories />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout onOpenAddTask={handleOpenAddTask} onEditTask={handleEditTask}>
              <Settings />
            </ProtectedLayout>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
