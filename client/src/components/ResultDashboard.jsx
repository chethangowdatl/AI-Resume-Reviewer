import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, Key, Sparkles, Copy, Check, 
  ArrowRight, Code, Briefcase, FileText, HelpCircle, Lightbulb,
  Award, TrendingUp, Layers, CheckCircle2
} from 'lucide-react';
import ScoreRing from './ScoreRing';
import ExportReport from './ExportReport';
import CoverLetterModal from './CoverLetterModal';
import InterviewModal from './InterviewModal';

export default function ResultDashboard({ data, fileName, onReset }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bullets', 'grammar_projects', 'job_match'
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  if (!data) return null;

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  const rawResumeText = data.extracted_info?.raw_text_preview || '';

  return (
    <div style={styles.container} id="report-dashboard-content">
      {/* Top Banner Row */}
      <div style={styles.topRow}>
        <div>
          <div style={styles.fileLabel}>
            <FileText size={14} color="#818cf8" />
            <span>Analysis for: <strong>{fileName || 'Uploaded_Resume.pdf'}</strong></span>
          </div>
          <h2 style={styles.dashboardTitle}>ATS Optimization Report</h2>
        </div>

        <div style={styles.topActions}>
          <ExportReport data={data} fileName={fileName} />
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div style={styles.overviewGrid}>
        {/* Score Ring Widget */}
        <ScoreRing score={data.ats_score} verdict={data.verdict} />

        {/* Executive Summary Card */}
        <div className="glass-card" style={styles.summaryCard}>
          <div style={styles.summaryHeader}>
            <div style={styles.summaryIconBox}>
              <Award size={20} color="#a855f7" />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Executive AI Assessment</h3>
              <p style={styles.cardSubtitle}>Key insights from automated scanner</p>
            </div>
          </div>

          <p style={styles.summaryText}>{data.summary}</p>

          {data.final_recommendation && (
            <div style={styles.recBox}>
              <Lightbulb size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>Strategic Action Step:</strong>
                <p style={styles.recText}>{data.final_recommendation}</p>
              </div>
            </div>
          )}

          {/* Action Modals Launcher Bar */}
          <div style={styles.modalLaunchers}>
            <button style={styles.launcherBtn} onClick={() => setIsCoverModalOpen(true)}>
              <FileText size={15} color="#c084fc" />
              <span>Generate AI Cover Letter</span>
            </button>

            <button style={styles.launcherBtn} onClick={() => setIsInterviewModalOpen(true)}>
              <HelpCircle size={15} color="#38bdf8" />
              <span>Practice Interview Questions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={styles.tabsBar}>
        <button
          style={{ ...styles.tabItem, ...(activeTab === 'overview' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={16} />
          <span>Strengths & Gaps</span>
        </button>

        <button
          style={{ ...styles.tabItem, ...(activeTab === 'bullets' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('bullets')}
        >
          <Sparkles size={16} />
          <span>Bullet Point Optimizer ({data.improved_bullet_points?.length || 0})</span>
        </button>

        <button
          style={{ ...styles.tabItem, ...(activeTab === 'grammar_projects' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('grammar_projects')}
        >
          <Code size={16} />
          <span>Grammar & Portfolio Projects</span>
        </button>

        {data.job_match && (
          <button
            style={{ ...styles.tabItem, ...(activeTab === 'job_match' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('job_match')}
          >
            <Briefcase size={16} />
            <span>Job Match ({data.job_match.match_percentage}%)</span>
          </button>
        )}
      </div>

      {/* Tab Content Container */}
      <div style={styles.tabContent}>
        {/* TAB 1: OVERVIEW & STRENGTHS/WEAKNESSES */}
        {activeTab === 'overview' && (
          <div style={styles.grid2Col}>
            {/* Strengths Card */}
            <div className="glass-card" style={styles.contentCard}>
              <div style={styles.sectionHeader}>
                <CheckCircle size={20} color="#10b981" />
                <h3 style={styles.sectionTitle}>Key Strengths</h3>
              </div>
              <ul style={styles.list}>
                {(data.strengths || []).map((item, idx) => (
                  <li key={idx} style={styles.listItemGreen}>
                    <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="glass-card" style={styles.contentCard}>
              <div style={styles.sectionHeader}>
                <AlertTriangle size={20} color="#f59e0b" />
                <h3 style={styles.sectionTitle}>Critical Weaknesses & Gaps</h3>
              </div>
              <ul style={styles.list}>
                {(data.weaknesses || []).map((item, idx) => (
                  <li key={idx} style={styles.listItemAmber}>
                    <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Skills Card */}
            <div className="glass-card" style={{ ...styles.contentCard, gridColumn: '1 / -1' }}>
              <div style={styles.sectionHeader}>
                <Key size={20} color="#a855f7" />
                <h3 style={styles.sectionTitle}>Recommended ATS Technical Skills to Add</h3>
              </div>
              <div style={styles.skillsTagWrapper}>
                {(data.missing_skills || []).map((skill, idx) => (
                  <span key={idx} className="badge badge-purple" style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BULLET REWRITER */}
        {activeTab === 'bullets' && (
          <div style={styles.bulletsList}>
            <div style={styles.tabBanner}>
              <Sparkles size={18} color="#a855f7" />
              <span>
                These high-impact rewrites replace passive statements with quantifiable metric achievements and strong action verbs.
              </span>
            </div>

            {(data.improved_bullet_points || []).map((bullet, idx) => (
              <div key={idx} className="glass-card" style={styles.bulletCard}>
                <div style={styles.bulletDiffGrid}>
                  {/* Before / Original */}
                  <div style={styles.bulletOriginalBox}>
                    <div style={styles.bulletBoxHeader}>
                      <span className="badge badge-red">Before (Original)</span>
                    </div>
                    <p style={styles.bulletOriginalText}>"{bullet.original}"</p>
                  </div>

                  {/* Arrow Indicator */}
                  <div style={styles.arrowCol}>
                    <ArrowRight size={20} color="#818cf8" />
                  </div>

                  {/* After / Improved */}
                  <div style={styles.bulletImprovedBox}>
                    <div style={styles.bulletBoxHeader}>
                      <span className="badge badge-green">After (Optimized)</span>
                      <button
                        style={styles.copyBulletBtn}
                        onClick={() => handleCopyBullet(bullet.improved, idx)}
                      >
                        {copiedIdx === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedIdx === idx ? 'Copied!' : 'Copy Bullet'}</span>
                      </button>
                    </div>
                    <p style={styles.bulletImprovedText}>"{bullet.improved}"</p>

                    {bullet.reasoning && (
                      <div style={styles.reasoningBox}>
                        <strong>Why it works:</strong> {bullet.reasoning}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GRAMMAR & PROJECTS */}
        {activeTab === 'grammar_projects' && (
          <div style={styles.grid2Col}>
            {/* Grammar Fixes */}
            <div className="glass-card" style={styles.contentCard}>
              <div style={styles.sectionHeader}>
                <CheckCircle size={20} color="#06b6d4" />
                <h3 style={styles.sectionTitle}>Grammar & Phrasing Refinements</h3>
              </div>

              {(data.grammar_fixes || []).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No critical grammar errors detected. Great phrasing!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {data.grammar_fixes.map((g, idx) => (
                    <div key={idx} style={styles.grammarBox}>
                      <div style={{ color: '#f87171', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                        {g.original}
                      </div>
                      <div style={{ color: '#34d399', fontWeight: '500', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                        ✓ {g.corrected}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio Projects */}
            <div className="glass-card" style={styles.contentCard}>
              <div style={styles.sectionHeader}>
                <Code size={20} color="#a855f7" />
                <h3 style={styles.sectionTitle}>Recommended Portfolio Projects</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(data.recommended_projects || []).map((proj, idx) => (
                  <div key={idx} style={styles.projCard}>
                    <h4 style={styles.projTitle}>{proj.title}</h4>
                    <p style={styles.projDesc}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: JOB MATCH */}
        {activeTab === 'job_match' && data.job_match && (
          <div className="glass-card" style={styles.contentCard}>
            <div style={styles.sectionHeader}>
              <Briefcase size={20} color="#38bdf8" />
              <h3 style={styles.sectionTitle}>Target Job Description Match Analysis</h3>
            </div>

            <div style={styles.matchStatsGrid}>
              <div style={styles.matchStatBox}>
                <span style={styles.matchPct}>{data.job_match.match_percentage}%</span>
                <span style={styles.matchLabel}>Keyword Coverage</span>
              </div>
              <div style={styles.adviceBox}>
                <strong>Recruiter Recommendation:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  {data.job_match.advice}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Matched Keywords</h4>
                <div style={styles.skillsTagWrapper}>
                  {(data.job_match.matching_keywords || []).map((k, i) => (
                    <span key={i} className="badge badge-green">{k}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Missing Job Keywords</h4>
                <div style={styles.skillsTagWrapper}>
                  {(data.job_match.missing_keywords || []).map((k, i) => (
                    <span key={i} className="badge badge-red">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CoverLetterModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        rawResumeText={rawResumeText}
      />

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        rawResumeText={rawResumeText}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1180px',
    margin: '2rem auto 5rem auto',
    padding: '0 1.5rem',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginBottom: '0.25rem',
  },
  dashboardTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.85rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    marginBottom: '1rem',
  },
  summaryIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(168, 85, 247, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
  },
  summaryText: {
    fontSize: '0.95rem',
    color: '#cbd5e1',
    lineHeight: '1.6',
    margin: 0,
  },
  recBox: {
    marginTop: '1rem',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  recText: {
    fontSize: '0.85rem',
    color: '#fef3c7',
    margin: '0.2rem 0 0 0',
  },
  modalLaunchers: {
    marginTop: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  launcherBtn: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#f8fafc',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    fontSize: '0.825rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
  },
  tabsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '0.5rem',
    marginBottom: '1.5rem',
    overflowX: 'auto',
  },
  tabItem: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    padding: '0.65rem 1.1rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  tabContent: {
    minHeight: '300px',
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  contentCard: {
    padding: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItemGreen: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    fontSize: '0.9rem',
    color: '#e2e8f0',
    lineHeight: '1.5',
  },
  listItemAmber: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    fontSize: '0.9rem',
    color: '#e2e8f0',
    lineHeight: '1.5',
  },
  skillsTagWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
  },
  tabBanner: {
    padding: '0.85rem 1.25rem',
    background: 'rgba(168, 85, 247, 0.1)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '12px',
    fontSize: '0.875rem',
    color: '#c084fc',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '1.5rem',
  },
  bulletsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  bulletCard: {
    padding: '1.25rem',
  },
  bulletDiffGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 30px 1fr',
    gap: '1rem',
    alignItems: 'center',
  },
  bulletOriginalBox: {
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    padding: '1rem',
  },
  bulletImprovedBox: {
    background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '10px',
    padding: '1rem',
  },
  bulletBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.65rem',
  },
  bulletOriginalText: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: '1.5',
  },
  bulletImprovedText: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#f8fafc',
    margin: 0,
    lineHeight: '1.5',
  },
  copyBulletBtn: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  reasoningBox: {
    marginTop: '0.75rem',
    paddingTop: '0.65rem',
    borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  arrowCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grammarBox: {
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '0.85rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  projCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid rgba(168, 85, 247, 0.2)',
  },
  projTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#c084fc',
    margin: '0 0 0.35rem 0',
  },
  projDesc: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    margin: 0,
    lineHeight: '1.4',
  },
  matchStatsGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '1.25rem',
    borderRadius: '12px',
  },
  matchStatBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    paddingRight: '2rem',
  },
  matchPct: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#38bdf8',
    lineHeight: '1',
  },
  matchLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: '0.25rem',
  },
  adviceBox: {
    flex: 1,
  }
};
