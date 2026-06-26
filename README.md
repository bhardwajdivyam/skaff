# 🚀 Skaff — AI-Powered Skill Intelligence & 3D Knowledge Graph

Skaff is an AI-driven platform that analyzes a candidate’s **GitHub profile and resume**, extracts technical skills using NLP, builds structured relationships between technologies, and visualizes everything as an interactive **3D Skill City**.

It helps:
- 🎓 Students understand their skill dominance
- 🧑‍💼 Recruiters compare candidates intelligently
- 🏢 HR teams view simplified skill summaries
- 🧠 AI to recommend career paths and skill gaps

---

## 🌟 Problem Statement (PS09)

Modern hiring lacks structured skill intelligence.  
Profiles are scattered across GitHub, resumes, and documents without meaningful relationship mapping.

Skaff solves this by:

- Extracting skills from GitHub & Resume
- Identifying technologies and dominance
- Building relationships between languages, frameworks, and libraries
- Generating a dynamic knowledge graph
- Visualizing it in interactive 3D
- Providing AI-powered insights

---

# 🧠 Core Features

## 🔍 GitHub Analysis
- Fetches repositories (configurable 1–49)
- Detects languages using GitHub API
- Parses `requirements.txt`
- Calculates language dominance %
- Builds structured skill graph

## 📄 Resume Analysis (PDF + Text)
- Extracts text using `pdfplumber`
- Uses Gemini AI for NLP skill extraction
- Generates:
  - Skills list
  - AI summary
  - Confidence score

## 🧩 Knowledge Graph Engine
- Core → Language → Framework → Library hierarchy
- Relationship edges dynamically generated
- Graph stored in:
  - Supabase (PostgreSQL)
  - Optional Neo4j graph DB

## 🎯 Career Intelligence
- AI-based role recommendation
- Skill-to-role match %
- Missing skills detection
- AI hiring reasoning in comparison mode

## 👥 Role-Based Access System
- Student
- Recruiter
- HR
- Admin (demo switching mode)

Each role sees different UI restrictions and features.

## ⚔️ Compare Mode (Recruiter Only)
- Side-by-side 3D canvases
- Dominance %
- AI confidence score
- Missing skills panel
- AI-generated hiring verdict

## 📊 Advanced Graph Features
- Interactive 3D visualization (React Three Fiber)
- Relationship highlighting
- Search & filter
- Edge animation pulse
- Graph stats panel
- Periodic refresh logic (7-day policy)

---

# 🏗️ Tech Stack

## 🖥️ Frontend
- React
- React Three Fiber (Three.js)
- Tailwind CSS
- Framer Motion
- Supabase Auth

## ⚙️ Backend
- FastAPI
- Gemini 2.5 (Google Generative AI SDK)
- Supabase (PostgreSQL)
- Neo4j (optional graph DB)
- httpx (async GitHub calls)
- pdfplumber (resume parsing)

## 🔐 Authentication
- Supabase JWT-based authentication
- Role-based access control
- Rate limiting middleware

---

# 🧠 Architecture Overview

1. User inputs GitHub username / repo / resume.
2. Backend fetches GitHub data via API.
3. NLP extracts additional skills from resume.
4. Skills merged and structured.
5. Graph relationships generated.
6. Data persisted to Supabase.
7. 3D graph rendered dynamically in frontend.

Modular service layers:
- GitHubService
- GraphService
- AI Recommendation Engine
- Role Match Engine

---

# 🚀 How To Run Locally

## 1️⃣ Clone Repository
```bash
git clone https://github.com/bhardwajdivyam/skaff.git
cd skaff
```

---

## 2️⃣ Backend Setup

Create `.env` file:

```
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend runs at:
```
http://localhost:8000
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

# 📈 Deployment Strategy

- Frontend → Vercel / Netlify
- Backend → Render / Railway / VPS
- Supabase → Managed cloud DB
- Gemini → API-based AI inference
- Optional Neo4j cloud for graph storage

---

# 🔐 Security & Scalability

- Secure API integrations
- JWT authentication
- Role-based UI restrictions
- Rate limiting
- Cached GitHub analysis
- Modular scalable architecture

---

# 🎥 Demo Highlights

- Upload resume (PDF)
- Analyze GitHub
- View 3D Skill City
- Compare two candidates
- Get AI hiring reasoning
- See career recommendation

---

# 🏁 Conclusion

Skaff transforms fragmented technical profiles into structured, intelligent, and visually interactive knowledge graphs — empowering smarter hiring and self-evaluation through AI and data relationships.
