'use client';
// @AI-HINT: This is the ThemeSwitcher button for toggling light/dark mode. Must be a client component.
import { useTheme } from '../../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

import './ThemeSwitcher.common.css';
import './ThemeSwitcher.light.css';
import './ThemeSwitcher.dark.css';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="ThemeSwitcher">
      <button
        className="ThemeSwitcher-button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>
    </div>
  );
}
