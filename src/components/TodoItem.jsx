import { useState } from 'react';
import { useTodo } from '../hooks/useTodo';
import { formatDistanceToNow } from 'date-fns';
import { FaEdit, FaTrash, FaCheck, FaPlay, FaClock, FaQuestion } from 'react-icons/fa';
import QuestionGenerator from './QuestionGenerator';

const TodoItem = ({ todo }) => {
  const { updateTodo, deleteTodo, completeTodo, startTodo, currentTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [showQuestionGenerator, setShowQuestionGenerator] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [editPriority, setEditPriority] = useState(todo.priority);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditPriority(todo.priority);
  };

  const handleUpdate = () => {
    if (!editTitle.trim()) return;

    updateTodo(todo.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatTimeSpent = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPriorityClass = () => {
    switch (todo.priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const isCurrentTodo = currentTodo && currentTodo.id === todo.id;

  if (isEditing) {
    return (
      <div className={`todo-item ${getPriorityClass()} editing`}>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="edit-title"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="edit-description"
        />
        <div className="priority-selector">
          <label>Priority:</label>
          <div className="priority-options">
            <label className={`priority-option ${editPriority === 'low' ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`priority-${todo.id}`}
                value="low"
                checked={editPriority === 'low'}
                onChange={() => setEditPriority('low')}
              />
              Low
            </label>
            <label className={`priority-option ${editPriority === 'medium' ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`priority-${todo.id}`}
                value="medium"
                checked={editPriority === 'medium'}
                onChange={() => setEditPriority('medium')}
              />
              Medium
            </label>
            <label className={`priority-option ${editPriority === 'high' ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`priority-${todo.id}`}
                value="high"
                checked={editPriority === 'high'}
                onChange={() => setEditPriority('high')}
              />
              High
            </label>
          </div>
        </div>
        <div className="edit-actions">
          <button onClick={handleUpdate} className="save-btn">Save</button>
          <button onClick={handleCancel} className="cancel-btn">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`todo-item ${getPriorityClass()} ${isCurrentTodo ? 'current-todo' : ''} ${todo.status}`}>
        <div className="todo-content">
          <h3 className="todo-title">{todo.title}</h3>
          {todo.description && <p className="todo-description">{todo.description}</p>}
          <div className="todo-meta">
            <span className="todo-created">
              Created {formatDistanceToNow(new Date(todo.createdAt), { addSuffix: true })}
            </span>
            {todo.timeSpent > 0 && (
              <span className="todo-time-spent">
                <FaClock /> {formatTimeSpent(todo.timeSpent)}
              </span>
            )}
            {todo.status === 'done' && todo.completedAt && (
              <span className="todo-completed">
                Completed {formatDistanceToNow(new Date(todo.completedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        <div className="todo-actions">
          {todo.status !== 'done' && (
            <>
              <button
                onClick={() => startTodo(todo.id)}
                className={`start-btn ${isCurrentTodo ? 'active' : ''}`}
                title="Start working on this task"
              >
                <FaPlay />
              </button>
              <button onClick={handleEdit} className="edit-btn" title="Edit task">
                <FaEdit />
              </button>
              <button onClick={() => completeTodo(todo.id)} className="complete-btn" title="Mark as complete">
                <FaCheck />
              </button>
            </>
          )}
          {/* Question Generator button - only show if task has content */}
          {(todo.description || todo.title.length > 10) && (
            <button
              onClick={() => setShowQuestionGenerator(true)}
              className="question-btn"
              title="Generate questions from this task"
            >
              <FaQuestion />
            </button>
          )}
          <button onClick={() => deleteTodo(todo.id)} className="delete-btn" title="Delete task">
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Question Generator Modal */}
      {showQuestionGenerator && (
        <div className="modal-overlay">
          <div className="modal-container">
            <QuestionGenerator
              taskContent={`${todo.title}${todo.description ? '\n\n' + todo.description : ''}`}
              onClose={() => setShowQuestionGenerator(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TodoItem;
