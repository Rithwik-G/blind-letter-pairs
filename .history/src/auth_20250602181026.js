import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = login, false = sign up

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
      alert(isLogin ? 'Logged in!' : 'Account created! Please check your email to confirm.');
    }

    setLoading(false);
  };

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Supabase + React</h1>
        <p className="description">
          {isLogin ? 'Sign in with your email and password' : 'Sign up with your email and password'}
        </p>
        <form className="form-widget" onSubmit={handleAuth}>
          <div>
            <input
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              className="inputField"
              type="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button className="button block" disabled={loading}>
              {loading ? <span>Loading...</span> : <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>}
            </button>
          </div>
        </form>
        <p className="toggle-auth">
          {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="link">
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </p>
      </div>
    </div>
  );
}
