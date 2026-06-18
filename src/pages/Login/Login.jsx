import React, { useState } from 'react';
import { FaUser, FaLock, FaSignInAlt, FaInfoCircle } from 'react-icons/fa';

const Login = ({ onLogin, showToast }) => {
  const [email, setEmail] = useState('admin@alfahms.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a premium mock loading experience
    setTimeout(() => {
      setLoading(false);
      if (email === 'admin@alfahms.com' && password === 'password') {
        onLogin();
        showToast("Welcome back, Zoya! Logged in successfully. 🎉");
      } else {
        alert("Invalid email or password (Try admin@alfahms.com / password)!");
      }
    }, 1200);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo/hotel-logo.png" alt="Logo" className="login-logo" />
          <h2 className="login-title">ALFA HMS LOGIN</h2>
          <p className="login-subtitle">Sign in to manage your hotel operations</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrapper">
              <FaUser className="login-input-icon" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alfahms.com" 
                required 
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <FaLock className="login-input-icon" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <span className="login-forgot" onClick={() => showToast("Password reset link sent (Dummy Action)")}>
              Forgot password?
            </span>
          </div>

          <button type="submit" className="login-btn-submit" disabled={loading}>
            {loading ? (
              <div className="login-loader"></div>
            ) : (
              <>
                <span>Sign In</span>
                <FaSignInAlt />
              </>
            )}
          </button>
        </form>

        <div className="login-help-note">
          <FaInfoCircle />
          <span>Demo Credentials: <strong>admin@alfahms.com</strong> / <strong>password</strong></span>
        </div>
      </div>
    </div>
  );
};

export default Login;
