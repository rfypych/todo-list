import { useTodo } from '../hooks/useTodo';
import { FaMoon, FaSun, FaCheckCircle, FaClock, FaListUl } from 'react-icons/fa';
import GitHubSettings from './GitHubSettings';

const Header = () => {
  const { darkMode, toggleDarkMode } = useTodo();

  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-icon"><FaListUl /></span>
        <h1>Todo List with Timer</h1>
      </div>
      <div className="header-actions">
        <GitHubSettings />
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </header>
  );
};

export default Header;
