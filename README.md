# AI Resume Reviewer 🚀 

An AI-powered Resume Reviewer and ATS Optimization application built with **React (Vite)**, **Node.js/Express**, **MongoDB / Mongoose**, **JWT Authentication**, **pdf-parse**, and multi-provider AI support (**Groq API**, **Google Gemini API**, **OpenAI API**, and a **Built-in Smart Local Analyzer**).

---

## 🌟 Key Features

- 🔒 **User Authentication (JWT + bcrypt)**: Secure registration and login with password hashing.
- 📜 **Saved Review History**: Automatically saves ATS resume audits to user account database for browsing and re-examining anytime.
- 🎯 **ATS Compatibility Score**: Animated circular progress ring evaluating formatting, keywords, metrics, and word count.
- ⚡ **High-Impact Bullet Rewriter**: Before-and-after comparison cards with 1-click copy for quantified bullet points.
- 🔑 **Missing Skill Detection**: Identifies technical skills and high-frequency ATS keywords to add.
- 💼 **Job Description Matching**: Paste a target job description to compute keyword match percentage and custom advice.
- ✉️ **Tailored Cover Letter Generator**: Creates customized cover letters based on candidate resume and target company.
- 🎤 **Targeted Interview Prep**: Generates behavioral (STAR method) and technical interview questions tailored to candidate gaps.
- 📥 **Publication-Ready PDF Export**: Export reviews in clean, vector text white PDF or Markdown format.
- 🍃 **MongoDB Atlas Production Database**: Supports cloud MongoDB Atlas (`MONGODB_URI`) for production, with embedded local database fallback for offline dev!

---

## 📁 Architecture & Folder Structure

```
resume-reviewer/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state, JWT session storage & Axios headers
│   │   ├── components/
│   │   │   ├── Header.jsx      # Navbar with user avatar, history & auth triggers
│   │   │   ├── AuthModal.jsx   # Login & Register modal
│   │   │   ├── HistoryModal.jsx # Saved review history drawer
│   │   │   ├── Upload.jsx      # Drag-and-drop PDF uploader & sample loader
│   │   │   ├── ScoreRing.jsx   # SVG animated score gauge
│   │   │   ├── ResultDashboard.jsx # Dynamic tabbed analysis dashboard
│   │   │   └── ExportReport.jsx # Publication-ready PDF & Markdown exporter
│   │   ├── App.jsx             # AuthProvider wrapper & layout
│   │   └── index.css           # Glassmorphism design system
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express)
│   ├── index.js                # Express app entry, routes & database init
│   ├── config/db.js            # MongoDB Atlas connection & embedded fallback
│   ├── middleware/auth.js      # JWT token verification & optional auth
│   ├── routes/
│   │   ├── auth.js             # POST /register, POST /login, GET /me
│   │   ├── history.js          # GET /history, GET /history/:id, DELETE /history/:id
│   │   └── review.js           # PDF upload, review, cover letter & interview prep
│   ├── services/aiService.js   # Groq, Gemini, OpenAI, & offline local analyzer engine
│   ├── utils/pdfExtractor.js   # pdf-parse text extractor
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🛠️ API Endpoints

### Auth Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create user account, returns JWT token |
| `POST` | `/api/auth/login` | Authenticate user, returns JWT token |
| `GET` | `/api/auth/me` | Fetch logged-in user profile |

### Review & History Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/review` | Upload PDF resume, returns ATS review (auto-saves if logged in) |
| `GET` | `/api/history` | Fetch user's saved review history |
| `GET` | `/api/history/:id` | Fetch single review by ID |
| `DELETE` | `/api/history/:id` | Remove review entry from history |
| `POST` | `/api/cover-letter` | Generate tailored cover letter |
| `POST` | `/api/interview-prep` | Generate custom interview prep questions |

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd server
npm install
npm start
```
*Server runs on `http://127.0.0.1:5000`.*

> **Environment Variables (`server/.env`)**:
> ```env
> PORT=5000
> MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/resume-db
> JWT_SECRET=your_jwt_secret_key
> GROQ_API_KEY=your_groq_api_key_here
> GEMINI_API_KEY=
> OPENAI_API_KEY=
> ```

### 2. Frontend Setup

In a new terminal:

```bash
cd client
npm run dev
```
*App runs on `http://localhost:3000`.*
