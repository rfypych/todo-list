import { useState } from 'react';
import { useTodo } from '../hooks/useTodo';
import { FaPlus, FaArrowDown, FaArrowUp, FaFlag, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const TodoForm = () => {
  const { addTodo } = useTodo();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    addTodo(title, description, priority);

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setIsExpanded(false);
  };

  const getPriorityIcon = (level) => {
    switch(level) {
      case 'high':
        return <FaExclamationCircle />;
      case 'medium':
        return <FaFlag />;
      case 'low':
        return <FaInfoCircle />;
      default:
        return <FaFlag />;
    }
  };

  return (
    <div className="todo-form-container">
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="form-header">
          <input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="todo-input"
            onClick={() => setIsExpanded(true)}
          />
          <button type="submit" className="add-btn">
            <FaPlus /> Add
          </button>
        </div>

        {isExpanded && (
          <div className="form-details">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="todo-description"
            />

            <div className="priority-selector">
              <label>Priority:</label>
              <div className="priority-options">
                <label className={`priority-option priority-low ${priority === 'low' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={priority === 'low'}
                    onChange={() => setPriority('low')}
                  />
                  {getPriorityIcon('low')} Low
                </label>
                <label className={`priority-option priority-medium ${priority === 'medium' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={priority === 'medium'}
                    onChange={() => setPriority('medium')}
                  />
                  {getPriorityIcon('medium')} Medium
                </label>
                <label className={`priority-option priority-high ${priority === 'high' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={priority === 'high'}
                    onChange={() => setPriority('high')}
                  />
                  {getPriorityIcon('high')} High
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="collapse-form-btn"
                onClick={() => setIsExpanded(false)}
                title="Collapse form"
              >
                <FaArrowUp /> Collapse
              </button>
            </div>
          </div>
        )}

        {!isExpanded && (
          <button
            type="button"
            className="expand-form-btn"
            onClick={() => setIsExpanded(true)}
            title="Show more options"
          >
            <FaArrowDown /> More options
          </button>
        )}
      </form>
    </div>
  );
};

export default TodoForm;
