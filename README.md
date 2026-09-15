# FaizX — AI Portfolio Assistant

FaizX is an AI-powered portfolio assistant designed to help recruiters, hiring managers, and visitors learn about Faizan Salauddin's professional background, technical skills, education, projects, and development experience.

It also includes an AI-powered Job Description matching system that analyzes a job description and compares it against the candidate profile.

---

## Features

### AI Portfolio Assistant

- Ask questions about Faizan's:
  - Technical skills
  - Education
  - Projects
  - Development experience
  - Achievements
  - Technologies
  - Resume
- Supports natural English, Hindi, and Hinglish queries.
- Maintains the current conversation session.
- Uses the candidate profile as the source of truth.
- Avoids inventing skills, technologies, experience, or project details.

### Job Description Matching

FaizX can analyze a Job Description and compare it with the candidate profile.

The JD matching pipeline works in two stages:

1. Raw Job Description → Structured Job Description JSON
2. Candidate Profile + Structured JD → Match Analysis

The system provides:

- Match score
- Suitability level
- Matched requirements
- Missing requirements
- Supporting evidence
- Recommendation

The matcher follows strict technology matching rules and does not treat related technologies as equivalent.

For example:

- MongoDB ≠ PostgreSQL
- Node.js ≠ Python
- React.js ≠ Next.js
- REST APIs ≠ GraphQL
- JWT ≠ OAuth
- JavaScript ≠ TypeScript

### Job Description Upload

Supported formats:

- PDF
- DOCX
- TXT

### Portfolio

The assistant can provide information about projects including:

- Ashmir Mocktails
- Al-Ansar Stores
- Thread Store

---

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- JavaScript

### Backend

- Python
- FastAPI
- Pydantic

### AI

- Groq API
- `openai/gpt-oss-120b`

### Document Processing

- PyPDF
- python-docx

### Deployment

- Vercel — Frontend
- Render — Backend

---

## Project Structure

```text
FaizX/
│
├── backend/
│   ├── data/
│   │   └── candidate.json
│   │
│   ├── main.py
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── .python-version
│   ├── README.md
│   └── .gitignore
│
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    ├── package-lock.json
    └── ...
How It Works
Portfolio Chat
User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
Candidate Profile
  ↓
Groq LLM
  ↓
AI Response
Job Description Matching
Job Description
      ↓
   LLM Call #1
      ↓
Structured JD JSON
      ↓
Candidate Profile + JD JSON
      ↓
   LLM Call #2
      ↓
Match Analysis
      ↓
Score + Requirements + Evidence + Recommendation
Getting Started
Prerequisites

Make sure you have:

Python 3.12+
Node.js
npm
uv
Groq API key
Backend Setup

Navigate to the backend:

cd backend

Install dependencies:

uv sync

Create a .env file:

GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173

Start the backend:

uv run uvicorn main:app --reload

Backend will run at:

http://localhost:8000
Frontend Setup

Navigate to the frontend:

cd frontend

Install dependencies:

npm install

Create a .env file:

VITE_API_URL=http://localhost:8000

Start the development server:

npm run dev

Frontend will run at:

http://localhost:5173
Environment Variables
Backend
GROQ_API_KEY=
FRONTEND_URL=
Frontend
VITE_API_URL=

Never commit .env files or API keys to the repository.

API Endpoints
Health Check
GET /

Returns the backend status.

Candidate Profile
GET /candidate

Returns the candidate profile.

Portfolio Chat
POST /chat

Request:

{
  "session_id": "unique-session-id",
  "message": "Tell me about Faizan's projects"
}
Job Description Upload
POST /match-jd

Accepts:

PDF
DOCX
TXT
Job Description Text
POST /match-jd-text

Request:

{
  "session_id": "unique-session-id",
  "job_description": "Job description text..."
}
Projects
Ashmir Mocktails

A full-stack MERN business web application for a mocktail and event-services business.

Al-Ansar Stores

A full-stack e-commerce platform with authentication, product search, cart, checkout, order tracking, admin management, and an AI-powered chatbot.

Thread Store

A MERN-stack business website built for a real thread business with product categories, product details, database-driven product data, and admin product management.

Security
API keys are stored in environment variables.
.env files are excluded from Git.
Candidate information is served from the application profile.
The AI assistant is instructed not to fabricate candidate information.
JD matching follows explicit requirement matching rather than assuming equivalent technologies.
Deployment
Frontend

The React frontend can be deployed using:

Vercel

Set:

VITE_API_URL=https://your-backend-url
Backend

The FastAPI backend can be deployed using:

Render

Start command:

uv run uvicorn main:app --host 0.0.0.0 --port $PORT

Set:

GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=https://your-frontend-url
Author

Faizan Salauddin

B.Tech — Computer Science and Business Systems

Heritage Institute of Technology