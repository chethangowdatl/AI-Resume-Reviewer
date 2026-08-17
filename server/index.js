const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const reviewRoutes = require('./routes/review');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');

dotenv.config();

// Connect to Database (MongoDB Atlas if MONGODB_URI set, else local dev DB)
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: "🚀 AI Resume Reviewer API is running!",
    healthCheck: "/api/health",
    frontendUrl: "http://localhost:3000",
    endpoints: {
      review: "POST /api/review",
      coverLetter: "POST /api/cover-letter",
      interviewPrep: "POST /api/interview-prep"
    }
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  const activeKey = process.env.GROQ_API_KEY ? 'Groq API (Llama 3.3)' :
    process.env.GEMINI_API_KEY ? 'Google Gemini API' :
      process.env.OPENAI_API_KEY ? 'OpenAI API' : 'Built-in Free Local Engine';

  res.json({
    status: 'online',
    service: 'AI Resume Reviewer API',
    provider: activeKey,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api', reviewRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 AI Resume Reviewer Server running on http://127.0.0.1:${PORT}`);
  console.log(`💡 Active AI Mode: ${process.env.GROQ_API_KEY ? 'Groq API (Llama 3.3 70B)' :
    process.env.GEMINI_API_KEY ? 'Google Gemini API' :
      process.env.OPENAI_API_KEY ? 'OpenAI API' : 'Built-in Free Offline Analyzer'
    }`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = PORT + 1;
    console.warn(`⚠️ Port ${PORT} is already in use. Retrying on port ${nextPort}...`);
    app.listen(nextPort, HOST, () => {
      console.log(`🚀 AI Resume Reviewer Server running on http://127.0.0.1:${nextPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});


