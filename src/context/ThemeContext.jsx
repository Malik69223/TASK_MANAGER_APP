import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

// Available color accent themes
export const COLOR_THEMES = [
  {
    id: 'indigo',
    label: 'Indigo Purple',
    description: 'Default professional theme',
    gradient: 'from-indigo-500 to-purple-600',
    preview: ['#6366f1', '#818cf8'],
  },
  {
    id: 'rose',
    label: 'Pink · Red',
    description: 'Bold pink-to-red gradient',
    gradient: 'from-pink-500 to-rose-600',
    preview: ['#f43f5e', '#fb7185'],
  },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('taskmanager_theme') || 'dark';
  });

  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('habittracker_color_theme') || 'indigo';
  });

  // Apply dark/light class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('taskmanager_theme', theme);
  }, [theme]);

  // Apply color theme data attribute on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-theme', colorTheme);
    localStorage.setItem('habittracker_color_theme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const switchColorTheme = (id) => {
    setColorTheme(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, colorTheme, switchColorTheme, COLOR_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
