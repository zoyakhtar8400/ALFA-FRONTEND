import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiSettings, FiArrowRight, FiShield } from 'react-icons/fi';
import { handleEnterNavigation } from '../../utils/keyboardNavigation';
import { useAuth } from '../../context/AuthContext';
import { getServerUrl } from '../../config/apiConfig';
import ServerConfigModal from '../../components/common/ServerConfigModal';
import './Login.css';

const Login = ({ showToast }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState(() => getServerUrl());

  useEffect(() => {
    const handleServerChange = (e) => {
      if (e && e.detail) {
        setCurrentServer(e.detail);
      } else {
        setCurrentServer(getServerUrl());
      }
    };
    window.addEventListener('alfa_server_changed', handleServerChange);
    return () => window.removeEventListener('alfa_server_changed', handleServerChange);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      const toastFn = showToast || window.showToast;
      if (toastFn) toastFn('Please enter your username and password.', 'warning');
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
    <div className="alfa-login-wrapper">
      <div className="alfa-login-box">
        {/* Top Server Connection Badge */}
        <button
          type="button"
          onClick={() => setServerModalOpen(true)}
          className="alfa-server-badge"
          title="Click to configure backend server connection"
        >
          <span className="server-live-dot" />
          <span>Server:</span>
          <span className="server-label-url">{currentServer}</span>
          <FiSettings size={13} className="server-settings-icon" />
        </button>

        {/* Elevated Login Card */}
        <div className="alfa-card">
          <div className="alfa-card-header">
            <div className="alfa-logo-container">
              <img
                src="/logo/alfa-logo.png"
                alt="ALFA Logo"
                className="alfa-logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <h1 className="alfa-brand-title">Welcome to ALFA</h1>
            <p className="alfa-brand-desc">Restaurant Management System</p>
          </div>

          <form onKeyDown={handleEnterNavigation} className="alfa-form-body" onSubmit={handleSubmit}>
            <div className="alfa-field-group">
              <label className="alfa-field-label">Username</label>
              <div className="alfa-input-box">
                <FiUser className="alfa-field-icon" />
                <input
                  type="text"
                  className="alfa-input-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="alfa-field-group">
              <label className="alfa-field-label">Password</label>
              <div className="alfa-input-box">
                <FiLock className="alfa-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="alfa-input-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="alfa-toggle-password"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div className="alfa-form-actions-row">
              <label className="alfa-checkbox-wrap">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <span
                className="alfa-link-forgot"
                onClick={() =>
                  (showToast || window.showToast)?.(
                    'Please contact your system administrator to reset credentials.',
                    'info'
                  )
                }
              >
                Forgot password?
              </span>
            </div>

            <button type="submit" className="alfa-login-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="alfa-spinner-ring" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight size={16} className="alfa-btn-arrow" />
                </>
              )}
            </button>
          </form>

          <div className="alfa-bottom-security">
            <FiShield size={12} color="#10b981" />
            <span>Encrypted POS Terminal Session</span>
          </div>
        </div>

        <div className="alfa-footer-copyright">
          © {new Date().getFullYear()} ALFA Software. All rights reserved.
        </div>
      </div>

      {/* Server Configuration Modal */}
      <ServerConfigModal
        isOpen={serverModalOpen}
        onClose={() => setServerModalOpen(false)}
        onSaved={(newUrl) => {
          setCurrentServer(newUrl);
        }}
      />
    </div>
  );
};

export default Login;
