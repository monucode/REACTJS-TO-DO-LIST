import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [todos, setTodos] = useState([]); // Store user's to-do list
  const [userId, setUserId] = useState(null); // Track logged-in user id
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

    // Listen for logout events
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Store todos in Supabase on logout
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('Invalid login credentials');
    } else {
      // Check if profile exists, if not, create it
      const user = data?.user;
      if (user) {
        setUserId(user.id);
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profile && !profileError) {
          // Insert new profile
          await supabase.from('profiles').insert([
            { id: user.id, email: user.email }
          ]);
        }
      }
      setMessage('Login successful!');
      navigate('/todo');
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) setError(resetError.message);
    else setMessage('Password reset link sent! Check your email.');
  };

  // Example UI for adding todos (simple input and list)
  // You can move this to a separate component if needed
  const [todoInput, setTodoInput] = useState('');
  const handleAddTodo = () => {
    if (todoInput.trim()) {
      setTodos([...todos, { id: Date.now(), text: todoInput.trim(), completed: false }]);
      setTodoInput('');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}

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
          <button type="button" onClick={handleResetPassword} className="forgot-link">
            Forgot Password?
          </button>
        </p>

        <p>
          New user? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
      {/* Show todo input if logged in */}
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
