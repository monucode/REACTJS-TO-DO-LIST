// src/component/Signup.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return regex.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // ✅ Add a client-side check for password length
    if (password.length < 8) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // ✅ Display the specific error message from Supabase
      setError(signUpError.message || 'Database error saving new user');
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email.toLowerCase(),
        });
    }

    // ✅ Let the user know they need to confirm their email
    alert(
      'Signup successful! Please check your email to confirm your account before logging in.'
    );
    navigate('/login', { state: { fromSignup: true } });   // ✅ always go to login page
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Sign Up</h2>
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
        <button type="submit">Sign Up</button>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
