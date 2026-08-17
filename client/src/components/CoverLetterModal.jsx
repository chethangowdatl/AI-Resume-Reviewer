import React, { useState } from 'react';
import { X, Copy, Check, FileText, Sparkles, Send } from 'lucide-react';
import axios from 'axios';

export default function CoverLetterModal({ isOpen, onClose, rawResumeText }) {
  const [jobTitle, setJobTitle] = useState('Full Stack Engineer');
  const [companyName, setCompanyName] = useState('Tech Innovators Inc.');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.post('/api/cover-letter', {
        resumeText: rawResumeText || '',
        jobTitle,
        companyName
      });
      if (res.data && res.data.coverLetter) {
        setCoverLetter(res.data.coverLetter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className="glass-card">
        <div style={styles.modalHeader}>
          <div style={styles.modalTitleGroup}>
            <FileText size={22} color="#a855f7" />
            <h3 style={styles.modalTitle}>Tailored AI Cover Letter Generator</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.inputGrid}>
            <div>
              <label style={styles.label}>Target Job Title</label>
              <input
                style={styles.input}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div>
              <label style={styles.label}>Target Company Name</label>
              <input
                style={styles.input}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Generating Letter...' : 'Generate Cover Letter'}</span>
            </button>
          </div>

          {coverLetter && (
            <div style={styles.letterContainer}>
              <div style={styles.letterHeader}>
                <span style={styles.letterTag}>Generated Cover Letter</span>
                <button style={styles.copyBtn} onClick={handleCopy}>
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
              <textarea
                style={styles.letterTextarea}
                rows={12}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
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
    maxWidth: '680px',
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
    marginBottom: '1.25rem',
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
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: '0.35rem',
    display: 'block',
  },
  input: {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    outline: 'none',
  },
  letterContainer: {
    marginTop: '1.25rem',
    background: 'rgba(15, 23, 42, 0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1rem',
  },
  letterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  letterTag: {
    fontSize: '0.8rem',
    color: '#c084fc',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  copyBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f8fafc',
    borderRadius: '6px',
    padding: '0.3rem 0.65rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  letterTextarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'Inter, sans-serif',
  }
};
