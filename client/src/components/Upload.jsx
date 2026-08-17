import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Briefcase, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function Upload({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Extracting resume text & analyzing with AI...');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg('');
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Invalid file format. Please upload a PDF (.pdf) file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select or drop a PDF resume file to continue.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      setProgressMsg('Extracting text from PDF resume...');
      setTimeout(() => setProgressMsg('Running ATS keyword matching & action verb analysis...'), 1200);
      setTimeout(() => setProgressMsg('Generating bullet point revisions & career insights...'), 2500);

      const res = await axios.post('/api/review', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        onAnalysisComplete(res.data.data, file.name);
      } else {
        throw new Error(res.data.error || 'Failed to process resume');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'An unexpected error occurred during review.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Sample File for instant testing!
  const handleLoadSample = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      setProgressMsg('Loading sample software engineer resume...');

      // Generate minimal valid PDF header & body
      const samplePdfText = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kinds [ /Page ] /Count 1 /Kids [ 3 0 R ] >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [ 0 0 612 792 ] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 520 >> stream
BT
/F1 12 Tf
50 750 Td (JOHN DOE - SOFTWARE ENGINEER) Tj
0 -20 Td (Email: john@example.com | Phone: 555-123-4567 | GitHub: github.com/johndoe) Tj
0 -30 Td (SUMMARY: Full Stack Developer with 3+ years experience in React, JavaScript, Node.js, Express.) Tj
0 -30 Td (EXPERIENCE:) Tj
0 -20 Td (Tech Corp - Software Engineer) Tj
0 -15 Td (- Built scalable web application components using React and Node.js.) Tj
0 -15 Td (- Responsible for backend REST APIs, Express routes, and database optimization.) Tj
0 -15 Td (- Reduced load times by 30% and fixed critical query bottlenecks.) Tj
0 -30 Td (SKILLS: JavaScript, React, Node.js, Express, SQL, MongoDB, Docker, Git) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000135 00000 n
0000000280 00000 n
0000000850 00000 n
trailer << /Size 6 /Root 1 0 R >>
startxref
925
%%EOF`;

      const blob = new Blob([samplePdfText], { type: "application/pdf" });
      const sampleFile = new File([blob], "Sample_Developer_Resume.pdf", { type: "application/pdf" });
      setFile(sampleFile);

      formData.append('resume', sampleFile);
      formData.append('jobDescription', mockJd);

      const res = await axios.post('/api/review', formData);
      if (res.data && res.data.success) {
        onAnalysisComplete(res.data.data, sampleFile.name);
      }
    } catch (err) {
      setErrorMsg('Sample loading failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>
          <Sparkles size={14} /> AI-Powered ATS Resume Scanner
        </div>
        <h1 style={styles.heroTitle}>
          Boost Your ATS Score & <br />
          <span style={styles.heroGradient}>Land 3x More Interviews</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Upload your resume PDF to instantly receive ATS compatibility scores, weak bullet rewrites, missing technical skills, and tailored interview prep questions.
        </p>
      </div>

      <div className="glass-card" style={styles.card}>
        {errorMsg && (
          <div style={styles.errorAlert}>
            <AlertCircle size={20} color="#ef4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dropzone */}
          <div
            style={{
              ...styles.dropzone,
              ...(isDragging ? styles.dropzoneDragging : {}),
              ...(file ? styles.dropzoneActive : {})
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              style={{ display: 'none' }}
            />

            {file ? (
              <div style={styles.filePreview}>
                <div style={styles.fileIconBox}>
                  <FileText size={36} color="#818cf8" />
                </div>
                <div>
                  <h4 style={styles.fileName}>{file.name}</h4>
                  <p style={styles.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB • Ready for scan
                  </p>
                </div>
                <div style={styles.changeBadge}>
                  <CheckCircle2 size={16} color="#10b981" />
                </div>
              </div>
            ) : (
              <div style={styles.dropContent}>
                <div style={styles.uploadIconCircle}>
                  <UploadCloud size={32} color="#818cf8" />
                </div>
                <h3 style={styles.dropTitle}>Drag & drop your Resume PDF</h3>
                <p style={styles.dropSubtitle}>
                  Supports standard single or multi-page PDF resumes up to 10MB
                </p>
                <span className="btn-secondary" style={{ marginTop: '0.75rem' }}>
                  Browse File
                </span>
              </div>
            )}
          </div>

          {/* Job Description Optional Toggle */}
          <div style={styles.jdToggleSection}>
            <button
              type="button"
              style={styles.jdToggleButton}
              onClick={() => setShowJdInput(!showJdInput)}
            >
              <Briefcase size={16} color="#a855f7" />
              <span>{showJdInput ? 'Hide Target Job Match' : '+ Add Target Job Description (Optional)'}</span>
            </button>

            {showJdInput && (
              <div style={styles.jdBox}>
                <label style={styles.jdLabel}>
                  Paste the Job Description to evaluate ATS Keyword Match %:
                </label>
                <textarea
                  style={styles.textarea}
                  placeholder="Paste job posting duties, qualifications, and required skills here..."
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
          <div style={styles.actionRow}>
            <button
              type="button"
              style={styles.sampleBtn}
              onClick={handleLoadSample}
              disabled={isLoading}
            >
              <Sparkles size={16} /> Try with Sample Resume
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !file}
              style={{ opacity: !file || isLoading ? 0.6 : 1 }}
            >
              {isLoading ? (
                <>
                  <span style={styles.spinner}></span>
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <span>Analyze Resume</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {isLoading && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div style={styles.progressFill}></div>
              </div>
              <p style={styles.progressText}>{progressMsg}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '840px',
    margin: '3rem auto 4rem auto',
    padding: '0 1.5rem',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  heroTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '2.75rem',
    fontWeight: '800',
    lineHeight: '1.2',
    color: '#f8fafc',
    marginBottom: '1rem',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: '#94a3b8',
    maxWidth: '640px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  card: {
    padding: '2.25rem',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '0.9rem 1.25rem',
    color: '#f87171',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  dropzone: {
    border: '2px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'rgba(15, 23, 42, 0.4)',
    transition: 'all 0.25s ease',
  },
  dropzoneDragging: {
    borderColor: '#818cf8',
    background: 'rgba(99, 102, 241, 0.15)',
  },
  dropzoneActive: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    background: 'rgba(16, 185, 129, 0.05)',
  },
  dropContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  uploadIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  dropTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#f8fafc',
  },
  dropSubtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  filePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    textAlign: 'left',
    padding: '0.5rem 1rem',
  },
  fileIconBox: {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    background: 'rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#f8fafc',
    margin: 0,
  },
  fileSize: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: 0,
  },
  changeBadge: {
    marginLeft: 'auto',
  },
  jdToggleSection: {
    marginTop: '1.5rem',
  },
  jdToggleButton: {
    background: 'none',
    border: 'none',
    color: '#c084fc',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0',
  },
  jdBox: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  jdLabel: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    fontWeight: '500',
  },
  textarea: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    resize: 'vertical',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '2rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  sampleBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#94a3b8',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  progressContainer: {
    marginTop: '1.75rem',
    textAlign: 'center',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
    animation: 'pulseGlow 2s infinite ease-in-out',
  },
  progressText: {
    fontSize: '0.85rem',
    color: '#c084fc',
    fontWeight: '500',
  }
};
