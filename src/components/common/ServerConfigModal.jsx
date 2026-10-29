import React, { useState, useEffect } from 'react';
import { 
  FaServer, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaNetworkWired, 
  FaDesktop, 
  FaTimes, 
  FaStop, 
  FaPlay, 
  FaPowerOff 
} from 'react-icons/fa';
import { getServerUrl } from '../../config/apiConfig';

/**
 * Normalizes input server text into a full valid URL with port 8000 fallback
 */
export const normalizeServerUrl = (input) => {
  let val = (input || '').trim();
  if (!val) return 'http://localhost:8000';

  // Add http:// protocol if missing
  if (!/^https?:\/\//i.test(val)) {
    val = `http://${val}`;
  }

  // Remove trailing slashes
  val = val.replace(/\/+$/, '');

  // Check if port is specified. If not, default to :8000
  try {
    const parsed = new URL(val);
    if (!parsed.port) {
      parsed.port = '8000';
      val = parsed.origin;
    }
  } catch (e) {
    if (!/:\d+$/.test(val)) {
      val = `${val}:8000`;
    }
  }

  return val;
};

const ServerConfigModal = ({ isOpen, onClose, onSaved, isInitialSetup = false }) => {
  const [mode, setMode] = useState('local'); // 'local' or 'remote'
  const [remoteIp, setRemoteIp] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [saving, setSaving] = useState(false);
  const [serverState, setServerState] = useState({ checked: false, isRunning: false });
  const [actionLoading, setActionLoading] = useState(false);

  const getEffectiveUrl = () => {
    if (mode === 'local') {
      return 'http://localhost:8000';
    }
    return normalizeServerUrl(remoteIp || '192.168.1.100');
  };

  const checkLiveServer = async () => {
    const target = getEffectiveUrl();
    try {
      // 1. Electron check
      if (window.electronAPI && typeof window.electronAPI.checkBackendStatus === 'function') {
        const res = await window.electronAPI.checkBackendStatus();
        setServerState({ checked: true, isRunning: Boolean(res && res.isListening) });
        return;
      }

      // 2. Browser check
      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 2000);
      try {
        const resp = await fetch(`${target}/api/system/status`, { signal: ctrl.signal });
        clearTimeout(tId);
        setServerState({ checked: true, isRunning: resp.ok });
      } catch (e) {
        clearTimeout(tId);
        setServerState({ checked: true, isRunning: false });
      }
    } catch (e) {
      setServerState({ checked: true, isRunning: false });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const current = getServerUrl();
      if (current.includes('localhost') || current.includes('127.0.0.1')) {
        setMode('local');
        setRemoteIp('');
      } else {
        setMode('remote');
        setRemoteIp(current.replace(/^https?:\/\//i, ''));
      }
      setTestResult(null);
      checkLiveServer();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      checkLiveServer();
    }
  }, [mode]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    const target = getEffectiveUrl();
    setTesting(true);
    setTestResult(null);

    try {
      // 1. Electron Native IPC probe (bypasses browser CORS / sandbox completely)
      if (window.electronAPI && typeof window.electronAPI.testConnection === 'function') {
        const res = await window.electronAPI.testConnection(target);
        setTestResult(res);
        setServerState({ checked: true, isRunning: Boolean(res && res.success) });
        return;
      }

      // 2. Browser Environment Probe
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        await fetch(`${target}/api/company-profile`, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        setTestResult({
          success: true,
          cleanUrl: target,
          message: `Server is online and responding at ${target}`
        });
        setServerState({ checked: true, isRunning: true });
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        setServerState({ checked: true, isRunning: false });
        if (fetchErr.name === 'AbortError') {
          setTestResult({
            success: false,
            message: `Connection timed out after 4 seconds at ${target}. Make sure backend is running and firewall allows port 8000.`
          });
        } else {
          setTestResult({
            success: false,
            message: `Unable to reach ${target}. Verify that the backend server is running.`
          });
        }
      }
    } catch (err) {
      setServerState({ checked: true, isRunning: false });
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleStopServer = async () => {
    setActionLoading(true);
    setTestResult(null);
    const target = getEffectiveUrl();

    try {
      // 1. Electron stop
      if (window.electronAPI && typeof window.electronAPI.stopLocalBackend === 'function') {
        await window.electronAPI.stopLocalBackend();
      }

      // 2. Direct HTTP stop endpoint
      try {
        await fetch(`${target}/api/system/stop-server`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (fetchErr) {
        // Expected network termination
      }

      setServerState({ checked: true, isRunning: false });
      setTestResult({
        success: true,
        message: 'Backend server has been stopped.'
      });
      if (window.showToast) window.showToast('Server stopped successfully', 'info');
    } catch (err) {
      setTestResult({
        success: false,
        message: `Failed to stop server: ${err.message}`
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartServer = async () => {
    setActionLoading(true);
    setTestResult(null);

    try {
      if (window.electronAPI && typeof window.electronAPI.startLocalBackend === 'function') {
        await window.electronAPI.startLocalBackend();
      } else {
        setTestResult({
          success: false,
          message: 'Browser Mode: Run ALFA_Backend.exe or start-backend.bat in your backend folder to start the server.'
        });
        setActionLoading(false);
        return;
      }

      setTestResult({
        success: true,
        message: 'Starting local backend in background...'
      });

      setTimeout(async () => {
        await checkLiveServer();
        setActionLoading(false);
      }, 2500);
    } catch (err) {
      setTestResult({
        success: false,
        message: `Failed to start server: ${err.message}`
      });
      setActionLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const target = getEffectiveUrl();
    setSaving(true);
    try {
      // 1. Electron persistent config
      if (window.electronAPI && typeof window.electronAPI.saveConfig === 'function') {
        await window.electronAPI.saveConfig({ serverUrl: target });
      }

      // 2. Browser localStorage persistence
      localStorage.setItem('alfa_server_url', target);

      // 3. Dispatch global event
      window.dispatchEvent(new CustomEvent('alfa_server_changed', { detail: target }));

      if (window.showToast) {
        window.showToast(`Server connected to ${target}`, 'success');
      }

      if (onSaved) onSaved(target);
      if (onClose) onClose();
    } catch (err) {
      setTestResult({ success: false, message: `Failed to save: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              backgroundColor: '#51a699',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaServer size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Server Connection & Control
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Configure connection and manage background backend process
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Server Process Management Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: serverState.isRunning ? '#10b981' : '#ef4444',
                boxShadow: serverState.isRunning ? '0 0 8px #10b981' : 'none'
              }} />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                  {serverState.isRunning ? 'Backend Server: Active' : 'Backend Server: Inactive'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {serverState.isRunning ? 'Listening on Port 8000' : 'Port 8000 is stopped'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {serverState.isRunning ? (
                <button
                  type="button"
                  onClick={handleStopServer}
                  disabled={actionLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    color: '#b91c1c',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                  title="Shut down the running backend server process"
                >
                  {actionLoading ? <FaSpinner className="animate-spin" /> : <FaStop size={11} />}
                  <span>Stop Server</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartServer}
                  disabled={actionLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    color: '#15803d',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                  title="Start backend server process"
                >
                  {actionLoading ? <FaSpinner className="animate-spin" /> : <FaPlay size={11} />}
                  <span>Start Server</span>
                </button>
              )}
            </div>
          </div>

          <p style={{ fontSize: '12.5px', color: '#475569', marginTop: 0, marginBottom: '14px' }}>
            Choose where this terminal connects to for data:
          </p>

          {/* Mode Selection Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            {/* Single Computer Mode */}
            <div
              onClick={() => {
                setMode('local');
                setTestResult(null);
              }}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: mode === 'local' ? '2px solid #51a699' : '1px solid #cbd5e1',
                backgroundColor: mode === 'local' ? '#f0fdf9' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: mode === 'local' ? '#1b4b44' : '#0f172a', fontSize: '13px' }}>
                <FaDesktop color="#51a699" /> Single Computer
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
                Backend runs locally (localhost:8000)
              </div>
            </div>

            {/* Separate Server Mode */}
            <div
              onClick={() => {
                setMode('remote');
                setTestResult(null);
              }}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: mode === 'remote' ? '2px solid #51a699' : '1px solid #cbd5e1',
                backgroundColor: mode === 'remote' ? '#f0fdf9' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: mode === 'remote' ? '#1b4b44' : '#0f172a', fontSize: '13px' }}>
                <FaNetworkWired color="#51a699" /> Separate Server
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
                Connect over LAN to a central server PC
              </div>
            </div>
          </div>

          {/* Input details based on selected mode */}
          {mode === 'local' ? (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', marginBottom: '2px' }}>
                Connection Target:
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#1b4b44',
                fontWeight: '700'
              }}>
                http://localhost:8000
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Server IP Address or Hostname:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={remoteIp}
                  onChange={(e) => {
                    setRemoteIp(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="e.g. 192.168.1.100 or 192.168.1.100:8000"
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                Port 8000 is automatically appended if omitted.
              </p>
            </div>
          )}

          {/* Test Connection Button */}
          <div style={{ marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              style={{
                width: '100%',
                padding: '9px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '12.5px',
                color: '#1e293b',
                cursor: testing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              {testing ? <FaSpinner className="animate-spin" /> : '⚡ Test Connection to ' + getEffectiveUrl()}
            </button>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div style={{
              padding: '11px 14px',
              borderRadius: '8px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`,
              color: testResult.success ? '#15803d' : '#b91c1c'
            }}>
              {testResult.success ? <FaCheckCircle size={15} /> : <FaTimesCircle size={15} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Persistent Location Notice */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '11.5px',
            color: '#64748b',
            lineHeight: 1.45
          }}>
            🔒 <strong>Saved Permanently:</strong> Preserved across computer restarts and software updates outside application folder.
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#51a699',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(81, 166, 153, 0.4)'
            }}
          >
            {saving ? <FaSpinner className="animate-spin" /> : 'Save Connection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerConfigModal;
