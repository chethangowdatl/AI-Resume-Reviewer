import React, { useState } from 'react';
import Header from './components/Header';
import Upload from './components/Upload';
import ResultDashboard from './components/ResultDashboard';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import { AuthProvider } from './context/AuthContext';
import confetti from 'canvas-confetti';

function MainApp() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleAnalysisComplete = (data, uploadedFileName) => {
    setAnalysisResult(data);
    setFileName(uploadedFileName);

    if (data && data.ats_score >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSelectHistoryReview = (reviewDoc, uploadedFileName) => {
    setAnalysisResult(reviewDoc);
    setFileName(uploadedFileName || reviewDoc.fileName || 'Saved_Review.pdf');
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setFileName('');
  };

  return (
    <div style={styles.appContainer}>
      <Header
        onReset={handleReset}
        hasResults={!!analysisResult}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      <main style={styles.main}>
        {!analysisResult ? (
          <Upload onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <ResultDashboard
            data={analysisResult}
            fileName={fileName}
            onReset={handleReset}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectReview={handleSelectHistoryReview}
      />

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>© 2026 AI Resume Reviewer • Production Ready with Auth & Review History</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '1.5rem',
    textAlign: 'center',
    background: 'rgba(9, 13, 22, 0.9)',
  },
  footerContent: {
    fontSize: '0.825rem',
    color: '#64748b',
  }
};
