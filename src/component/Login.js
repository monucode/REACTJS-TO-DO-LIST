import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserId(session.user.id);
        await fetchTodos(session.user.id);
        navigate('/todo');
      }
    };
    checkSession();

    // Auth state change listener (logout cleanup)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserId(null);
        setTodos([]);
      }
      if (event === 'SIGNED_IN') {
        setUserId(session.user.id);
        await fetchTodos(session.user.id);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch todos from supabase for the given user id
  const fetchTodos = async (uid) => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
      return;
    }
    setTodos(data || []);
  };

  // Save todos array to Supabase for current user
  const saveTodos = async (newTodos) => {
    if (!userId) return;

    // Upsert todos for the user by todo id
    const { error } = await supabase.from('todos').upsert(
      newTodos.map((todo) => ({
        id: todo.id,
        user_id: userId,
        text: todo.text,
        completed: todo.completed || false,
        created_at: todo.created_at || new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Error saving todos:', error);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
    } else if (data.user) {
      setUserId(data.user.id);
      await fetchTodos(data.user.id);
      navigate('/todo');
    }
  };

  // Add todo handler
  const handleAddTodo = async () => {
    if (!todoInput.trim()) return;

    const newTodo = {
      id: crypto.randomUUID(),
      text: todoInput.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      user_id: userId,
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setTodoInput('');
    await saveTodos(updatedTodos);
  };

  // Toggle todo completed status (optional)
  const toggleTodoCompleted = async (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  // Delete todo handler (optional)
  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      console.error('Error deleting todo:', error);
      return;
    }
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  return (
    <div className="auth-container">
      {!userId ? (
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
      ) : (
        <div className="todo-section">
          <h3>Your To-Do List</h3>
          <input
            type="text"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            placeholder="Add a new to-do"
          />
          <button type="button" onClick={handleAddTodo}>
            Add
          </button>

          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodoCompleted(todo.id)}
                />
                <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: '1rem' }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setUserId(null);
              setTodos([]);
              navigate('/');
            }}
            style={{ marginTop: '2rem' }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
