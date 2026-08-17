import React, { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronRight, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function InterviewModal({ isOpen, onClose, rawResumeText }) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(0);

  useEffect(() => {
    if (isOpen && questions.length === 0) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/interview-prep', {
        resumeText: rawResumeText || '',
        jobTitle: 'Software Engineer'
      });
      if (res.data && res.data.prepData && res.data.prepData.questions) {
        setQuestions(res.data.prepData.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="glass-card">
        <div style={styles.modalHeader}>
          <div style={styles.modalTitleGroup}>
            <HelpCircle size={22} color="#06b6d4" />
            <h3 style={styles.modalTitle}>AI Interview Prep & Question Generator</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <p style={styles.desc}>
            These custom interview questions are tailored to your resume's experience and skill gaps. Practice these with the provided STAR framing tips.
          </p>

          {isLoading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={24} className="spin" color="#06b6d4" />
              <span>Generating targeted interview questions...</span>
            </div>
          ) : (
            <div style={styles.questionsList}>
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.qCard,
                    ...(expandedIdx === idx ? styles.qCardActive : {})
                  }}
                  onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                >
                  <div style={styles.qHeader}>
                    <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                      {q.type || 'Interview Question'}
                    </span>
                    <h4 style={styles.qText}>{q.question}</h4>
                  </div>

                  {expandedIdx === idx && q.tip && (
                    <div style={styles.tipBox}>
                      <div style={styles.tipHeader}>
                        <Lightbulb size={16} color="#fbbf24" />
                        <span>Recommended Answer Strategy:</span>
                      </div>
                      <p style={styles.tipText}>{q.tip}</p>
                    </div>
                  )}
                </div>
              ))}
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
    maxWidth: '720px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '1.75rem',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  modalTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  modalTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.25rem',
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
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  desc: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    margin: 0,
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '3rem',
    color: '#06b6d4',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  qCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  qCardActive: {
    borderColor: 'rgba(6, 182, 212, 0.4)',
    background: 'rgba(15, 23, 42, 0.85)',
  },
  qHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  qText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f8fafc',
    margin: 0,
    lineHeight: '1.4',
  },
  tipBox: {
    marginTop: '0.85rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  tipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.825rem',
    fontWeight: '600',
    color: '#fbbf24',
  },
  tipText: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    lineHeight: '1.5',
    margin: 0,
  }
};
