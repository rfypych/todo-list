import { useTodo } from '../hooks/useTodo';
import {
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartLine,
  FaListAlt,
  FaRegClock
} from 'react-icons/fa';

const Stats = () => {
  const { todos } = useTodo();

  // Calculate total time spent on all tasks
  const totalTimeSpent = todos.reduce((total, todo) => total + todo.timeSpent, 0);

  // Calculate completed tasks count
  const completedTasks = todos.filter(todo => todo.status === 'done').length;

  // Calculate in-progress tasks count
  const inProgressTasks = todos.filter(todo => todo.status === 'in-progress').length;

  // Calculate total tasks count
  const totalTasks = todos.length;

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="stats-container">
      <h2><FaChartLine /> Productivity Stats</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatTime(totalTimeSpent)}</div>
            <div className="stat-label">Total Focus Time</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{completedTasks}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <FaHourglassHalf />
          </div>
          <div className="stat-content">
            <div className="stat-value">{inProgressTasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <FaListAlt />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        {totalTimeSpent > 0 && completedTasks > 0 && (
          <div className="stat-item">
            <div className="stat-icon">
              <FaRegClock />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatTime(Math.floor(totalTimeSpent / Math.max(1, completedTasks)))}</div>
              <div className="stat-label">Avg. Time per Task</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
