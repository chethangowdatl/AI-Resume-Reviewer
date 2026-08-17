import React from 'react';

export default function ScoreRing({ score = 0, verdict = 'Under Analysis' }) {
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#10b981'; // Green
  let shadow = 'rgba(16, 185, 129, 0.4)';
  let verdictClass = 'badge-green';

  if (score < 65) {
    color = '#ef4444'; // Red
    shadow = 'rgba(239, 68, 68, 0.4)';
    verdictClass = 'badge-red';
  } else if (score < 80) {
    color = '#f59e0b'; // Amber
    shadow = 'rgba(245, 158, 11, 0.4)';
    verdictClass = 'badge-amber';
  }

  return (
    <div style={styles.card} className="glass-card">
      <div style={styles.ringWrapper}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Outer glow background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              filter: `drop-shadow(0 0 12px ${shadow})`,
            }}
          />
        </svg>

        <div style={styles.scoreContent}>
          <span style={{ ...styles.scoreValue, color }}>{score}</span>
          <span style={styles.scoreMax}>/ 100</span>
        </div>
      </div>

      <div style={styles.infoGroup}>
        <div style={styles.label}>ATS Match Score</div>
        <div className={`badge ${verdictClass}`} style={styles.verdictBadge}>
          {verdict}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    textAlign: 'center',
  },
  ringWrapper: {
    position: 'relative',
    width: '160px',
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreContent: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '2.75rem',
    fontWeight: '800',
    lineHeight: '1',
  },
  scoreMax: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  },
  infoGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  verdictBadge: {
    fontSize: '0.9rem',
    padding: '0.35rem 1rem',
  }
};
