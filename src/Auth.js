import { useState } from 'react';
import { supabase } from './supabaseClient';
import './auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    const { error } = result;
    if (error) {
      setMessage(error.message);
    } else if (!isLogin) {
      setMessage('Check your email to confirm your account.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <span className="auth-wordmark">memo</span>
        <h1 className="auth-header">Blind Letter Pairs</h1>
        <p className="auth-description">
          {isLogin ? 'Sign in to continue.' : 'Create an account.'}
        </p>
        <form className="auth-form" onSubmit={handleAuth}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="auth-button" disabled={loading}>
            {loading ? 'Please wait…' : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>
        {message && <p className="auth-message" role="status">{message}</p>}
        <p className="auth-toggle">
          {isLogin ? 'New here?' : 'Already registered?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="auth-link">
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
