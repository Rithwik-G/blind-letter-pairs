import { useState } from 'react';
import { supabase } from './supabaseClient';
import './auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    const { error } = result;
    if (error) {
      alert(error.message);
    } else {
      if (!isLogin) {
        alert('Account created! Please check your email to confirm.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-header">Create Blindsolving Letter Pairs</h1>
        <p className="auth-description">
          {isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to get started'}
        </p>
        <form className="auth-form" onSubmit={handleAuth}>
          <div className="input-group">
            <input
              className="auth-input"
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              className="auth-input"
              type="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="auth-button" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        <p className="auth-toggle">
          {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="auth-link">
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </p>
      </div>
    </div>
  );
}
