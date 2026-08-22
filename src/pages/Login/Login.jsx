import { handleEnterNavigation } from '../../utils/keyboardNavigation';
import React, { useState } from 'react';
import { FaUser, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = ({ showToast }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="login-split-wrapper">
      <div className="login-split-container">
        {/* Left Side: Brand Panel */}
        <div className="login-left-brand">
          <div className="brand-overlay" />
          <div className="brand-content">
            <div className="brand-icon">🏨</div>
            <h1 className="brand-title">ALFA HMS</h1>
            <p className="brand-desc">Enterprise-grade Hospitality Management System. Streamlining Front Desk, Restaurant POS, Housekeeping, and Room Service in one powerful platform.</p>
            <div className="brand-footer">
              <span>© {new Date().getFullYear()} Alfa Technologies. All rights reserved.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="login-right-form">
          <div className="login-card-minimal">
            <div className="login-header-minimal">
              <img src="/logo/alfa-logo.png" alt="Logo" className="login-logo" />
              <h2 className="login-title-minimal">Welcome Back</h2>
              <p className="login-subtitle-minimal">Please enter your credentials to access your account</p>
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
                    placeholder="Enter your username or email"
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="password-toggle-btn"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="login-remember">
                  <input type="checkbox" defaultChecked />
                  <span>Keep me signed in</span>
                </label>
                <span className="login-forgot" onClick={() => (showToast || window.showToast)?.("Please contact your system administrator to reset password.")}>
                  Forgot Password?
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
      </div>
    </div>
  );
};

export default Login;
