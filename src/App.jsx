import { TodoProvider } from './context/TodoContext';
import Header from './components/Header';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Timer from './components/Timer';
import Stats from './components/Stats';
import './App.css';

function App() {
  return (
    <TodoProvider>
      <div className="app">
        <Header />
        <main className="app-main">
          <div className="left-panel">
            <TodoForm />
            <TodoList />
          </div>
          <div className="right-panel">
            <Timer />
            <Stats />
          </div>
        </main>
      </div>
    </TodoProvider>
  );
}

export default App;
