import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/todo');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('Invalid login credentials');
    } else {
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
    </div>
  );
}
