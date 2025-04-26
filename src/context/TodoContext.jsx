import { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import githubService from '../services/GitHubService';

export const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  // Get todos from localStorage or initialize with empty array
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  // Current selected todo for the timer
  const [currentTodo, setCurrentTodo] = useState(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add a new todo
  const addTodo = (title, description = '', priority = 'medium') => {
    const newTodo = {
      id: uuidv4(),
      title,
      description,
      priority,
      status: 'todo', // 'todo', 'in-progress', 'done'
      createdAt: new Date().toISOString(),
      timeSpent: 0, // in seconds
      completedAt: null,
    };
    setTodos([...todos, newTodo]);
    return newTodo;
  };

  // Update a todo
  const updateTodo = (id, updatedTodo) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, ...updatedTodo } : todo))
    );

    // If the current todo is updated, update the current todo as well
    if (currentTodo && currentTodo.id === id) {
      setCurrentTodo({ ...currentTodo, ...updatedTodo });
    }
  };

  // Delete a todo
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));

    // If the current todo is deleted, set current todo to null
    if (currentTodo && currentTodo.id === id) {
      setCurrentTodo(null);
    }
  };

  // Mark a todo as complete
  const completeTodo = async (id) => {
    // Find the todo to complete
    const todoToComplete = todos.find(todo => todo.id === id);

    if (!todoToComplete) {
      console.log('Todo not found:', id);
      return;
    }

    console.log('Completing todo:', todoToComplete.title);

    // Update the todo in state
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, status: 'done', completedAt: new Date().toISOString() }
          : todo
      )
    );

    // If the current todo is completed, set current todo to null
    if (currentTodo && currentTodo.id === id) {
      setCurrentTodo(null);
    }

    // Make a GitHub commit if GitHub integration is enabled
    const isGitHubInitialized = githubService.isInitialized();
    console.log('GitHub integration initialized:', isGitHubInitialized);

    if (isGitHubInitialized) {
      try {
        const result = await githubService.commitTaskCompletion(todoToComplete.title);
        if (result) {
          console.log('GitHub contribution recorded for task:', todoToComplete.title);
        } else {
          console.log('Failed to record GitHub contribution for task:', todoToComplete.title);
        }
      } catch (error) {
        console.error('Failed to record GitHub contribution:', error);
      }
    }
  };

  // Set a todo as in-progress and make it the current todo for the timer
  const startTodo = (id) => {
    const todoToStart = todos.find((todo) => todo.id === id);
    if (todoToStart) {
      updateTodo(id, { status: 'in-progress' });
      setCurrentTodo(todoToStart);
    }
  };

  // Update time spent on a todo
  const updateTimeSpent = (id, seconds) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, timeSpent: todo.timeSpent + seconds }
          : todo
      )
    );

    // Update current todo if it's the one being updated
    if (currentTodo && currentTodo.id === id) {
      setCurrentTodo({
        ...currentTodo,
        timeSpent: currentTodo.timeSpent + seconds,
      });
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        currentTodo,
        darkMode,
        addTodo,
        updateTodo,
        deleteTodo,
        completeTodo,
        startTodo,
        updateTimeSpent,
        toggleDarkMode,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
