import React, { useState, useContext } from 'react';
import { X, Lock, Mail, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="glass-card">
        <div style={styles.header}>
          <div style={styles.tabContainer}>
            <button
              style={{ ...styles.tab, ...(isLoginMode ? styles.tabActive : {}) }}
              onClick={() => { setIsLoginMode(true); setErrorMsg(''); }}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              style={{ ...styles.tab, ...(!isLoginMode ? styles.tabActive : {}) }}
              onClick={() => { setIsLoginMode(false); setErrorMsg(''); }}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.title}>
            {isLoginMode ? 'Welcome Back!' : 'Create Your Account'}
          </h3>
          <p style={styles.subtitle}>
            {isLoginMode
              ? 'Log in to access your saved resume reviews & ATS history.'
              : 'Sign up to automatically save reviews and track your ATS score progress.'}
          </p>

          {errorMsg && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isLoginMode && (
            <div>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="#818cf8" style={styles.inputIcon} />
                <input
                  type="text"
                  style={styles.input}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#818cf8" style={styles.inputIcon} />
              <input
                type="email"
                style={styles.input}
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#818cf8" style={styles.inputIcon} />
              <input
                type="password"
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
          >
            {isLoading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Free Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(6px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  modal: {
    width: '100%',
    maxWidth: '440px',
    padding: '1.75rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  tabContainer: {
    display: 'flex',
    gap: '0.4rem',
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '0.25rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tab: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  tabActive: {
    background: 'rgba(99, 102, 241, 0.25)',
    color: '#818cf8',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.4',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  label: {
    fontSize: '0.825rem',
    color: '#cbd5e1',
    fontWeight: '500',
    marginBottom: '0.35rem',
    display: 'block',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.85rem',
  },
  input: {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '0.75rem 0.85rem 0.75rem 2.6rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    outline: 'none',
  }
};
