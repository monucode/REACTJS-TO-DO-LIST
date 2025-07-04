// Login.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

// ➡️ centralise route here – change once if you rename the route later
const PROJECTS_ROUTE = '/projects'; // ⬅️ set this to whatever your Projects grid route is

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /* ------------------------------------------------------------
     If the user already has an active session we send them
     directly to the Projects grid instead of the Todo page.
  ------------------------------------------------------------ */
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate(PROJECTS_ROUTE, { replace: true });
        //     ^^^^^^^^^^^^^^^
        // user already logged-in → go straight to Projects grid
      }
    };

    checkSession();
  }, [navigate]);

  /* ------------------------------------------------------------
     Handle form submit → try to sign in → on success go to
     Projects grid. Any auth error is surfaced in <p.error>.
  ------------------------------------------------------------ */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Invalid login credentials');
    } else {
      navigate(PROJECTS_ROUTE, { replace: true });
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
    </div>
  );
}