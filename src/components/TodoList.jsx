import { useState } from 'react';
import { useTodo } from '../hooks/useTodo';
import TodoItem from './TodoItem';
import { FaListUl, FaHourglass, FaCheckCircle, FaPlay, FaFilter, FaExclamation } from 'react-icons/fa';

const TodoList = () => {
  const { todos } = useTodo();
  const [filter, setFilter] = useState('all'); // 'all', 'todo', 'in-progress', 'done'

  // Calculate counts for all todos (regardless of filter)
  const todoCounts = {
    todo: todos.filter(todo => todo.status === 'todo').length,
    'in-progress': todos.filter(todo => todo.status === 'in-progress').length,
    done: todos.filter(todo => todo.status === 'done').length,
  };

  // Filter todos based on selected filter
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    return todo.status === filter;
  });

  // Group filtered todos by status for display
  const todosByStatus = {
    todo: filteredTodos.filter(todo => todo.status === 'todo'),
    'in-progress': filteredTodos.filter(todo => todo.status === 'in-progress'),
    done: filteredTodos.filter(todo => todo.status === 'done'),
  };

  return (
    <div className="todo-list-container">
      <div className="todo-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <FaListUl /> All ({todos.length})
        </button>
        <button
          className={`filter-btn ${filter === 'todo' ? 'active' : ''}`}
          onClick={() => setFilter('todo')}
        >
          <FaHourglass /> To Do ({todoCounts.todo})
        </button>
        <button
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          <FaPlay /> In Progress ({todoCounts['in-progress']})
        </button>
        <button
          className={`filter-btn ${filter === 'done' ? 'active' : ''}`}
          onClick={() => setFilter('done')}
        >
          <FaCheckCircle /> Done ({todoCounts.done})
        </button>
      </div>

      <div className="todo-lists">
        {filter === 'all' ? (
          <>
            {todosByStatus['in-progress'].length > 0 && (
              <div className="todo-section">
                <h2><FaPlay /> In Progress</h2>
                {todosByStatus['in-progress'].map(todo => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}

            {todosByStatus.todo.length > 0 && (
              <div className="todo-section">
                <h2><FaHourglass /> To Do</h2>
                {todosByStatus.todo.map(todo => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}

            {todosByStatus.done.length > 0 && (
              <div className="todo-section">
                <h2><FaCheckCircle /> Done</h2>
                {todosByStatus.done.map(todo => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="todo-section">
            {filteredTodos.length > 0 ? (
              filteredTodos.map(todo => (
                <TodoItem key={todo.id} todo={todo} />
              ))
            ) : (
              <p className="no-todos">
                <FaExclamation />
                No tasks found in this category.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
