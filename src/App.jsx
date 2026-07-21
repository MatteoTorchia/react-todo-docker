import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Errore nel recupero dei Todo:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = todoInput.trim();
    if (!text) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setTodoInput('');
    } catch (err) {
      console.error("Errore nell'aggiunta del Todo:", err);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (err) {
      console.error("Errore nell'aggiornamento:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error("Errore nell'eliminazione:", err);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="todo-container">
      <h1>Todo List</h1>

      <form onSubmit={handleSubmit} id="todo-form">
        <input 
          type="text" 
          value={todoInput}
          onChange={(e) => setTodoInput(e.target.value)}
          placeholder="Aggiungi una nuova nota..." 
          required 
        />
        <button className="button" type="submit">Aggiungi</button>    
      </form>

      <div className="filters">
        <button 
          className={`button ${currentFilter === 'all' ? 'active-filter' : ''}`} 
          onClick={() => setCurrentFilter('all')}
        >
          Tutti
        </button>
        <button 
          className={`button ${currentFilter === 'active' ? 'active-filter' : ''}`} 
          onClick={() => setCurrentFilter('active')}
        >
          Da completare
        </button>
        <button 
          className={`button ${currentFilter === 'completed' ? 'active-filter' : ''}`} 
          onClick={() => setCurrentFilter('completed')}
        >
          Completati
        </button>
      </div>

      <ul id="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div>
              <input 
                type="checkbox" 
                checked={todo.completed} 
                onChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span>{todo.text}</span>
            </div>
            <button className="button delete-button" onClick={() => deleteTodo(todo.id)}>
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}