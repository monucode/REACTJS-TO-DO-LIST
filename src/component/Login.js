import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [todos, setTodos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [todoInput, setTodoInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        navigate('/todo');
      }
    };
    checkSession();

    // Handle logout event: Save todos to Supabase
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (userId && todos.length > 0) {
          await supabase
            .from('todos')
            .upsert(
              todos.map(todo => ({
                ...todo,
                user_id: userId
              })),
              { onConflict: ['id'] }
            );
        }
        setUserId(null);
        setTodos([]);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate, userId, todos]);

  // Fetch todos after login
  useEffect(() => {
    const fetchTodos = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId);

        if (!error) setTodos(data || []);
      }
    };
    fetchTodos();
  }, [userId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('Invalid login credentials');
    } else {
      const user = data?.user;
      if (user) {
        setUserId(user.id);
        navigate('/todo');
      }
    }
  };

  const handleAddTodo = () => {
    if (todoInput.trim()) {
      setTodos([
        ...todos,
        { id: crypto.randomUUID(), text: todoInput.trim(), completed: false }
      ]);
      setTodoInput('');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Log In</button>

        <p>
          New user? <Link to="/signup">Sign Up</Link>
        </p>
      </form>

      {userId && (
        <div className="todo-section">
          <h3>Your To-Do List</h3>
          <input
            type="text"
            value={todoInput}
            onChange={e => setTodoInput(e.target.value)}
            placeholder="Add a new to-do"
          />
          <button type="button" onClick={handleAddTodo}>Add</button>
          <ul>
            {todos.map(todo => (
              <li key={todo.id}>{todo.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
