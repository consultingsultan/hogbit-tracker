import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme, isLoading } = useTheme();

  if (isLoading) {
    return (
      <div className={`theme-toggle ${className}`}>
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 dark:text-dark-muted" />
      )}
    </button>
  );
};

export default ThemeToggle;