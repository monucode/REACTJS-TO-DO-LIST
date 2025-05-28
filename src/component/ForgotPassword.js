import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Auth.css';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setMessage('Password reset link sent! Check your email.');
  };

  return (
    <div className="auth-container fade-in">
      <form className="auth-form bounce" onSubmit={handleResetPassword}>
        <h2>Forgot Password</h2>

        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>

        <p>
          Remember your password? <Link to="/">Log In</Link>
        </p>
      </form>
    </div>
  );
}
