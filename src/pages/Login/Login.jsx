import { handleEnterNavigation } from '../../utils/keyboardNavigation';
import React, { useState } from 'react';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = ({ showToast }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      const toastFn = showToast || window.showToast;
      if (toastFn) toastFn('Please enter username/email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password, showToast);
    } catch (err) {
      console.error('Login submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo/alfa-logo.png" alt="Logo" className="login-logo" />
          <h2 className="login-title">ALFA HMS LOGIN</h2>
          <p className="login-subtitle">Sign in to manage your hotel operations</p>
        </div>

        <form onKeyDown={handleEnterNavigation} className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label className="login-label">Username or Email</label>
            <div className="login-input-wrapper">
              <FaUser className="login-input-icon" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter username or email"
                autoComplete="username"
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
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <span className="login-forgot" onClick={() => (showToast || window.showToast)?.("Please contact your system administrator to reset password.")}>
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
      </div>
    </div>
  );
};

export default Login;
