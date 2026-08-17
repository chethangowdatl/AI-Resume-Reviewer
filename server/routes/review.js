const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../utils/pdfExtractor');
const { analyzeResume, generateCoverLetter, generateInterviewPrep } = require('../services/aiService');
const { optionalAuth } = require('../middleware/auth');
const { createReview } = require('../config/db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config with file type verification
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are supported! Please upload a valid .pdf file.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route POST /api/review
 * @desc Accepts PDF upload, extracts text, calls AI service, returns ATS JSON response, and saves to history if logged in
 */
router.post('/review', optionalAuth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF resume file.' });
    }

    const filePath = req.file.path;
    const jobDescription = req.body.jobDescription || '';

    // 1. Extract text using pdf-parse
    const extractedData = await extractTextFromPDF(filePath);
    const resumeText = extractedData.text;

    if (!resumeText || resumeText.length < 30) {
      // Clean up temp file
      fs.unlink(filePath, () => {});
      return res.status(422).json({
        error: 'Could not extract sufficient text from PDF. It might be scanned image PDF or password protected.'
      });
    }

    // 2. Perform AI / Heuristic Analysis
    const analysisResult = await analyzeResume(resumeText, jobDescription);

    // 3. Attach extracted metadata for reference
    analysisResult.extracted_info = {
      character_count: resumeText.length,
      page_count: extractedData.numpages,
      raw_text_preview: resumeText.substring(0, 400) + '...'
    };

    // 4. Save to History if User is Logged In
    let savedReviewId = null;
    if (req.user && req.user.userId) {
      try {
        const savedDoc = await createReview({
          userId: req.user.userId,
          fileName: req.file.originalname,
          ats_score: analysisResult.ats_score,
          verdict: analysisResult.verdict,
          summary: analysisResult.summary,
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
          missing_skills: analysisResult.missing_skills,
          improved_bullet_points: analysisResult.improved_bullet_points,
          grammar_fixes: analysisResult.grammar_fixes,
          recommended_projects: analysisResult.recommended_projects,
          job_match: analysisResult.job_match,
          final_recommendation: analysisResult.final_recommendation
        });
        savedReviewId = savedDoc._id || savedDoc.id;
        analysisResult.id = savedReviewId;
      } catch (saveErr) {
        console.error('Error saving review to history:', saveErr);
      }
    }

    // Clean up uploaded temp file asynchronously
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error removing temp file:', err);
    });

    return res.json({
      success: true,
      data: analysisResult,
      saved: !!savedReviewId
    });
  } catch (error) {
    console.error('Error processing resume review:', error);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(500).json({
      error: error.message || 'An error occurred during resume analysis.'
    });
  }
});

/**
 * @route POST /api/cover-letter
 * @desc Generate AI Cover letter based on resume text
 */
router.post('/cover-letter', async (req, res) => {
  try {
    const { resumeText, jobTitle, companyName } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }
    const coverLetter = await generateCoverLetter(resumeText, jobTitle, companyName);
    return res.json({ success: true, coverLetter });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/interview-prep
 * @desc Generate interview questions based on resume
 */
router.post('/interview-prep', async (req, res) => {
  try {
    const { resumeText, jobTitle } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }
    const prepData = await generateInterviewPrep(resumeText, jobTitle);
    return res.json({ success: true, prepData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
