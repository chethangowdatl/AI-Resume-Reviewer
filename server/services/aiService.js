const { Groq } = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');

const SYSTEM_PROMPT = `
You are an expert ATS (Applicant Tracking System) Specialist, Senior Technical Recruiter, and Resume Strategist.
Your goal is to thoroughly analyze the provided resume (and optional target Job Description) and return a strict, valid JSON response.

CRITICAL INSTRUCTION:
Return ONLY pure JSON without markdown codeblock formatting (no \`\`\`json or \`\`\`).
The JSON structure MUST follow this exact schema:

{
  "ats_score": <number between 0 and 100>,
  "verdict": "<Short status e.g. Outstanding / Strong Fit / Needs Optimization / High Risk>",
  "summary": "<2 sentence executive review of the resume>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missing_skills": ["<skill/tool 1>", "<skill/tool 2>", "<skill/tool 3>", "<skill/tool 4>"],
  "improved_bullet_points": [
    {
      "original": "<original weak bullet from resume>",
      "improved": "<quantifiable, impactful rewritten bullet starting with strong action verb>",
      "reasoning": "<why this revision performs better in ATS>"
    }
  ],
  "grammar_fixes": [
    {
      "original": "<original awkward or weak phrasing>",
      "corrected": "<grammatically sound, professional phrasing>"
    }
  ],
  "recommended_projects": [
    {
      "title": "<Project Name>",
      "description": "<Project description that fills missing skill gaps>"
    }
  ],
  "job_match": {
    "match_percentage": <number 0-100 or null if no job description provided>,
    "matching_keywords": ["<matched skill 1>", "<matched skill 2>"],
    "missing_keywords": ["<missing skill 1>", "<missing skill 2>"],
    "advice": "<Actionable recommendation to improve match score>"
  },
  "final_recommendation": "<Direct, encouraging actionable closing advice for the job seeker>"
}
`;

/**
 * Main resume analysis function supporting Groq, Gemini, OpenAI, and Offline fallback.
 */
async function analyzeResume(resumeText, jobDescription = '') {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const userPrompt = `
RESUME CONTENT:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : 'No target job description specified. Provide general high-impact ATS analysis.'}
`;

  // 1. Try Groq API
  if (groqKey && groqKey.trim() !== '') {
    try {
      console.log('⚡ Analyzing resume using Groq API (Llama 3.3 70B)...');
      const groq = new Groq({ apiKey: groqKey.trim() });
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (responseContent) {
        return parseJsonResponse(responseContent);
      }
    } catch (err) {
      console.error('⚠️ Groq API Error (falling back to next engine):', err.message);
    }
  }

  // 2. Try Gemini API
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      console.log('✨ Analyzing resume using Google Gemini API...');
      const genAI = new GoogleGenerativeAI(geminiKey.trim());
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const response = await model.generateContent(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
      const text = response.response.text();
      if (text) {
        return parseJsonResponse(text);
      }
    } catch (err) {
      console.error('⚠️ Gemini API Error (falling back to next engine):', err.message);
    }
  }

  // 3. Try OpenAI API
  if (openaiKey && openaiKey.trim() !== '') {
    try {
      console.log('🤖 Analyzing resume using OpenAI API...');
      const openai = new OpenAI({ apiKey: openaiKey.trim() });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });
      const content = response.choices[0]?.message?.content;
      if (content) {
        return parseJsonResponse(content);
      }
    } catch (err) {
      console.error('⚠️ OpenAI API Error (falling back to local engine):', err.message);
    }
  }

  // 4. Offline Smart Heuristic Engine (100% Free Fallback)
  console.log('⚙️ No active API keys found (or API failed). Using built-in Smart Local Analyzer Engine...');
  return runSmartLocalAnalyzer(resumeText, jobDescription);
}

/**
 * Generates an AI Cover Letter.
 */
async function generateCoverLetter(resumeText, jobTitle = 'Software Engineer', companyName = 'Target Company') {
  const prompt = `Write a compelling, professional cover letter tailored for the role of "${jobTitle}" at "${companyName}".
Use evidence and skills from the following resume text:
${resumeText.substring(0, 3000)}`;

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const res = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile'
      });
      return res.choices[0]?.message?.content || fallbackCoverLetter(jobTitle, companyName);
    } catch (e) {
      console.error('Cover letter Groq error:', e.message);
    }
  }

  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return res.text || fallbackCoverLetter(jobTitle, companyName);
    } catch (e) {
      console.error('Cover letter Gemini error:', e.message);
    }
  }

  return fallbackCoverLetter(jobTitle, companyName);
}

/**
 * Generates technical & behavioral interview questions based on resume gaps.
 */
async function generateInterviewPrep(resumeText, jobTitle = 'Software Engineer') {
  const prompt = `Based on this resume for a ${jobTitle} position, generate 5 targeted technical and behavioral interview questions along with ideal structured answer tips.
Return strict JSON format:
{
  "questions": [
    {
      "type": "Technical / Behavioral / System Design",
      "question": "Question text...",
      "tip": "How to structure your answer using STAR method..."
    }
  ]
}

Resume Text: ${resumeText.substring(0, 3000)}`;

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const res = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      return parseJsonResponse(res.choices[0]?.message?.content);
    } catch (e) {
      console.error('Interview prep Groq error:', e.message);
    }
  }

  return {
    questions: [
      {
        type: "Behavioral (STAR Method)",
        question: "Tell me about a challenging project featured on your resume and how you measured success.",
        tip: "Define the Situation, Task, Action you personally took, and quantify the final Result (e.g. 30% performance boost)."
      },
      {
        type: "Technical Architecture",
        question: "How did you design the backend API architecture mentioned in your recent role?",
        tip: "Explain choices around REST/GraphQL endpoints, database indexing, authentication, and error handling."
      },
      {
        type: "Problem Solving",
        question: "Describe a time you encountered a production bug or performance bottleneck.",
        tip: "Focus on your debugging methodology, tools used (profilers/logs), and preventive measures implemented."
      }
    ]
  };
}

/**
 * Safely parse JSON strings from LLM output.
 */
function parseJsonResponse(rawText) {
  if (!rawText) throw new Error('Empty response from AI engine');
  let clean = rawText.trim();
  clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(clean);
}

/**
 * Built-in Smart Local Rule Engine for offline zero-cost analysis.
 */
function runSmartLocalAnalyzer(resumeText, jobDescription) {
  const textLower = resumeText.toLowerCase();
  const words = textLower.split(/\s+/);
  const wordCount = words.length;

  // Key technology checklist
  const techCatalog = [
    'react', 'node.js', 'express', 'python', 'javascript', 'typescript', 'java',
    'docker', 'kubernetes', 'aws', 'sql', 'postgresql', 'mongodb', 'git', 'rest api',
    'graphql', 'ci/cd', 'unit testing', 'tailwind', 'next.js', 'redux'
  ];

  const foundTech = techCatalog.filter(tech => textLower.includes(tech));
  const missingTech = techCatalog.filter(tech => !textLower.includes(tech)).slice(0, 6);

  // Action verbs check
  const actionVerbs = ['spearheaded', 'architected', 'developed', 'optimized', 'engineered', 'implemented', 'launched', 'scaled', 'automated'];
  const foundVerbs = actionVerbs.filter(v => textLower.includes(v));

  // Check metrics (% or $ or numbers)
  const hasMetrics = /[\d]+%|\$[\d]+|increased|decreased|reduced|improved by/i.test(resumeText);

  // Score computation
  let score = 60;
  if (foundTech.length >= 5) score += 15;
  if (foundVerbs.length >= 3) score += 10;
  if (hasMetrics) score += 10;
  if (wordCount >= 250 && wordCount <= 750) score += 5;
  score = Math.min(score, 94);

  // Extract candidate bullet points for demo revision
  const rawBullets = resumeText
    .split('\n')
    .map(line => line.trim().replace(/^[-•*]\s*/, ''))
    .filter(line => line.length > 25 && line.length < 140);

  const sampleOriginal = rawBullets[0] || 'Worked on developing frontend and backend features for web application.';
  const sampleOriginal2 = rawBullets[1] || 'Responsible for fixing bugs and improving database query speeds.';

  // Job description matching heuristic
  let jobMatchResult = null;
  if (jobDescription && jobDescription.trim().length > 10) {
    const jdLower = jobDescription.toLowerCase();
    const jdTech = techCatalog.filter(t => jdLower.includes(t));
    const matchedJd = jdTech.filter(t => textLower.includes(t));
    const missingJd = jdTech.filter(t => !textLower.includes(t));
    const matchPct = jdTech.length > 0 ? Math.round((matchedJd.length / jdTech.length) * 100) : 75;

    jobMatchResult = {
      match_percentage: matchPct,
      matching_keywords: matchedJd.length ? matchedJd : foundTech.slice(0, 4),
      missing_keywords: missingJd.length ? missingJd : missingTech.slice(0, 4),
      advice: `Tailor your professional summary to highlight ${missingJd.slice(0, 2).join(', ') || 'target role requirements'}.`
    };
  }

  return {
    ats_score: score,
    verdict: score >= 85 ? 'High Compatibility' : score >= 70 ? 'Strong Potential' : 'Needs Optimization',
    summary: `Resume parsed (${wordCount} words). Detected ${foundTech.length} technical skills and ${foundVerbs.length} action verbs. ${hasMetrics ? 'Quantifiable metrics are present.' : 'Needs more numeric impact metrics.'}`,
    strengths: [
      `Identified key industry tools: ${foundTech.slice(0, 4).join(', ') || 'Solid technical foundation'}`,
      hasMetrics ? 'Contains quantifiable impact and metric milestones' : 'Clean layout structure and section formatting',
      foundVerbs.length > 0 ? `Uses active verbs like ${foundVerbs.slice(0, 2).join(', ')}` : 'Clear concise bullet point structure',
      wordCount >= 250 ? 'Appropriate resume length for standard ATS readers' : 'Compact easy-to-read section distribution'
    ],
    weaknesses: [
      !hasMetrics ? 'Lacks numeric metrics (e.g., %, $, team size, latency reduction)' : 'Could expand project achievements with measurable business impact',
      missingTech.length > 0 ? `Missing high-frequency ATS keywords like: ${missingTech.slice(0, 3).join(', ')}` : 'Some skill sections require modern technology updates',
      'Bullet points could start with stronger action verbs (e.g., Spearheaded, Engineered)'
    ],
    missing_skills: missingTech,
    improved_bullet_points: [
      {
        original: sampleOriginal,
        improved: `Architected scalable full-stack features with ${foundTech[0] || 'React'} & ${foundTech[1] || 'Node.js'}, reducing page response times by 35%.`,
        reasoning: "Replaced generic phrasing with high-impact action verbs and quantitative benchmark metrics."
      },
      {
        original: sampleOriginal2,
        improved: `Engineered optimized database indexing routines and resolved critical bugs, boosting system uptime to 99.9%.`,
        reasoning: "Quantified maintenance achievements and emphasized performance optimization capabilities."
      }
    ],
    grammar_fixes: [
      {
        original: "Responsible for managing and maintenance of web application server code",
        corrected: "Managed and maintained cloud web application server codebase"
      }
    ],
    recommended_projects: [
      {
        title: "Full-Stack Distributed microservices Platform",
        description: `Build a project using ${missingTech[0] || 'Docker'} and ${missingTech[1] || 'PostgreSQL'} to highlight system architecture skills.`
      },
      {
        title: "Real-time Event Streaming App",
        description: `Construct a live dashboard utilizing WebSockets and modern caching (${missingTech[2] || 'Redis'}) to show high throughput expertise.`
      }
    ],
    job_match: jobMatchResult,
    final_recommendation: `Add 2-3 metric-driven achievements to your recent experiences and incorporate missing keywords (${missingTech.slice(0, 3).join(', ')}) to boost your ATS match score above 85%!`
  };
}

function fallbackCoverLetter(jobTitle, companyName) {
  return `Dear Hiring Manager at ${companyName},

I am writing to express my strong enthusiasm for the ${jobTitle} position. With my background in software development, full-stack architecture, and technical problem solving, I am confident in my ability to make an immediate, positive impact on your engineering team.

Throughout my experience, I have consistently focused on building robust, scalable applications, optimizing performance, and delivering clean, maintainable code. My resume highlights key projects where I spearheaded feature development, streamlined system performance, and collaborated cross-functionally to achieve strategic business goals.

I am particularly drawn to ${companyName}'s commitment to technological excellence and innovation. I would welcome the opportunity to discuss how my skill set and technical drive align with your team's goals.

Thank you for your time and consideration.

Sincerely,
[Your Name]`;
}

module.exports = {
  analyzeResume,
  generateCoverLetter,
  generateInterviewPrep
};
