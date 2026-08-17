import React, { useEffect, useState, useContext } from 'react';
import { Sparkles, RefreshCw, Zap, User, LogIn, LogOut, History } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Header({ onReset, hasResults, onOpenAuth, onOpenHistory }) {
  const { user, logout } = useContext(AuthContext);
  const [providerInfo, setProviderInfo] = useState('Checking Engine...');

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const res = await axios.get('/api/health');
      setProviderInfo(res.data.provider || 'AI Engine Ready');
    } catch (e) {
      setProviderInfo('Built-in Free Local Engine');
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logoGroup} onClick={onReset}>
          <div style={styles.iconBox}>
            <Sparkles size={24} color="#818cf8" />
          </div>
          <div>
            <h1 style={styles.title}>
              Resume<span style={styles.gradientText}>AI</span> Reviewer
            </h1>
            <p style={styles.subtitle}>Smart ATS Score & Career Copilot</p>
          </div>
        </div>

        <div style={styles.actions}>
          <div style={styles.engineBadge}>
            <Zap size={14} color="#38bdf8" />
            <span>{providerInfo}</span>
          </div>

          {user ? (
            <>
              <button style={styles.historyBtn} onClick={onOpenHistory}>
                <History size={16} color="#c084fc" />
                <span>History</span>
              </button>

              <div style={styles.userProfile}>
                <div style={styles.avatar}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={styles.userName}>{user.name}</span>
                <button style={styles.logoutBtn} onClick={logout} title="Sign Out">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <button style={styles.loginBtn} onClick={onOpenAuth}>
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          )}

          {hasResults && (
            <button style={styles.resetBtn} onClick={onReset}>
              <RefreshCw size={16} />
              <span>New Review</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(9, 13, 22, 0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    padding: '0.9rem 1.5rem',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    cursor: 'pointer',
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
    border: '1px solid rgba(99,102,241,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.35rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: '#f8fafc',
    margin: 0,
    lineHeight: '1.2',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  engineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '9999px',
    background: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#38bdf8',
  },
  historyBtn: {
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    color: '#c084fc',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
  },
  loginBtn: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
    border: '1px solid rgba(99, 102, 241, 0.4)',
    color: '#f8fafc',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '9999px',
    padding: '0.25rem 0.65rem 0.25rem 0.35rem',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0.1rem',
    marginLeft: '0.2rem',
  },
  resetBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f8fafc',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
  }
};
