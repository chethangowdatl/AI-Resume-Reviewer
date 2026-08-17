import React, { useState, useEffect } from 'react';
import { X, History, FileText, Trash2, ArrowRight, Clock, Award, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function HistoryModal({ isOpen, onClose, onSelectReview }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/history');
      if (res.data && res.data.data) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this review from your history?')) return;

    setDeletingId(id);
    try {
      await axios.delete(`/api/history/${id}`);
      setHistoryList(prev => prev.filter(item => (item._id || item.id) !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="glass-card">
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <History size={22} color="#818cf8" />
            <h3 style={styles.title}>Your Resume Review History</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {isLoading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={24} className="spin" color="#818cf8" />
              <span>Loading saved reviews...</span>
            </div>
          ) : historyList.length === 0 ? (
            <div style={styles.emptyState}>
              <FileText size={48} color="#64748b" />
              <h4>No Saved Reviews Found</h4>
              <p>Upload a PDF resume while logged in to automatically save your reviews here!</p>
            </div>
          ) : (
            <div style={styles.list}>
              {historyList.map((item) => {
                const itemId = item._id || item.id;
                const score = item.ats_score || 0;
                let badgeClass = 'badge-green';
                if (score < 65) badgeClass = 'badge-red';
                else if (score < 80) badgeClass = 'badge-amber';

                return (
                  <div
                    key={itemId}
                    style={styles.card}
                    onClick={() => {
                      onSelectReview(item, item.fileName);
                      onClose();
                    }}
                  >
                    <div style={styles.cardTop}>
                      <div style={styles.fileInfo}>
                        <FileText size={18} color="#818cf8" />
                        <span style={styles.fileName}>{item.fileName || 'Resume_Review.pdf'}</span>
                      </div>
                      <div style={styles.cardActions}>
                        <span className={`badge ${badgeClass}`}>
                          {score} / 100
                        </span>
                        <button
                          style={styles.deleteBtn}
                          onClick={(e) => handleDelete(itemId, e)}
                          disabled={deletingId === itemId}
                        >
                          <Trash2 size={14} color="#f87171" />
                        </button>
                      </div>
                    </div>

                    <p style={styles.summary}>{item.summary}</p>

                    <div style={styles.cardFooter}>
                      <span style={styles.date}>
                        <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span style={styles.openLink}>
                        Open Full Report <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
    maxWidth: '640px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.75rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '1rem',
    marginBottom: '1.25rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  title: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  body: {
    overflowY: 'auto',
    flex: 1,
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '3rem',
    color: '#818cf8',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#94a3b8',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.65rem',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fileName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  deleteBtn: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '6px',
    padding: '0.3rem 0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  summary: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    lineHeight: '1.5',
    margin: '0 0 0.85rem 0',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#94a3b8',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '0.65rem',
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  openLink: {
    color: '#818cf8',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  }
};
