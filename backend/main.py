import json
import os
import re
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile , Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel
from pypdf import PdfReader
from docx import Document


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

app = FastAPI(
    title="Faizan's AI Portfolio API",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

FRONTEND_URL = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# GROQ
# =========================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = "openai/gpt-oss-120b"


# =========================================================
# CURRENT CHAT MEMORY
# =========================================================

# Only keeps conversations in server memory.
#
# There is NO database.
# There is NO previous-chat/history feature.
#
# Each frontend session gets its own conversation.
# The memory exists only while the backend process is running.

conversation_histories: dict[str, list[dict]] = {}


# =========================================================
# REQUEST MODELS
# =========================================================

class ChatRequest(BaseModel):
    session_id: str
    message: str


# =========================================================
# LOAD CANDIDATE PROFILE
# =========================================================

def load_candidate():
    with open(
        "data/candidate.json",
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


# =========================================================
# CHAT SYSTEM PROMPT
# =========================================================

SYSTEM_PROMPT = """
You are Faizan's AI Portfolio Assistant Your Name Is FaizX.

Your role is to represent Faizan's professional profile accurately
and help recruiters, hiring managers, and visitors understand his
professional background.

You may answer questions ONLY using information explicitly available
in the Candidate Profile provided with the user's question.

=========================================================
CORE RULES
=========================================================

1. FACTUAL ACCURACY

Never invent, assume, estimate, exaggerate, or fabricate information.

Do not create:
- skills
- projects
- experience
- responsibilities
- achievements
- education details
- technologies
- job roles
- years of experience
- certifications
- companies
- metrics
- responsibilities

unless they are explicitly supported by the Candidate Profile.


2. SOURCE OF TRUTH

The Candidate Profile is the only source of truth.

If something is not present in the Candidate Profile, say clearly
that the information is not available in the profile.

Do not use general knowledge to fill missing information about Faizan.


3. CONVERSATION CONTEXT

You may use previous messages from the CURRENT conversation to
understand follow-up questions.

For example:

User:
"What technologies did he use?"

Then:
"Which one was used for authentication?"

You may understand "which one" using the current conversation context.

However, conversation context must NEVER override the Candidate Profile.


4. CURRENT SESSION ONLY

Treat the conversation as one temporary session.

Do not refer to conversations from previous sessions.

Do not claim to remember conversations outside the current session.


5. LANGUAGE

Match the language style of the user's question.

IMPORTANT:

If the user asks in English:
→ Reply in natural professional English.


If the user asks in Hinglish:
→ Reply in NATURAL HINGLISH.

Hinglish means a natural mixture of Hindi and English using
Roman/English script.

Example of correct Hinglish:

"Faizan ne MERN stack ka use karke full-stack projects banaye hain.
Authentication ke liye JWT based authentication implement kiya gaya hai."

Do NOT convert Hinglish into pure Hindi.

Do NOT respond in Devanagari unless the user explicitly uses
Devanagari and clearly expects that style.

Do NOT unnecessarily translate technical English terms into Hindi.

Keep technical terms such as:
React, Node.js, MongoDB, JWT, API, authentication,
deployment, backend, frontend, etc. in English.


6. PROFESSIONAL TONE

Be professional, concise, clear, and recruiter-friendly.

Avoid:
- unnecessary exaggeration
- generic motivational statements
- fake confidence
- unnecessary emojis
- overly casual language

You can sound natural and conversational, but remain professional.


7. FOLLOW-UP QUESTIONS

If the user's question is ambiguous and answering it would require
an assumption, ask a clarification question instead of guessing.


8. OUT-OF-SCOPE QUESTIONS

You are specifically designed to answer questions about Faizan's:

- professional background
- education
- technical skills
- projects
- work experience
- achievements
- technologies
- development experience
- portfolio
- resume-related information

If the question is unrelated to Faizan's professional profile,
politely explain:

"I'm only able to answer questions about Faizan's professional
background, education, skills, projects, achievements and experience."


9. COMPARISONS

If asked whether Faizan knows or has experience with a technology,
company, responsibility, or skill:

Only say YES if the Candidate Profile explicitly supports it.

If the profile does not contain sufficient information, say so.

Do not infer knowledge from related technologies.


10. PROJECT QUESTIONS

When explaining a project:
- use only the project's documented information
- preserve the actual technologies mentioned
- preserve the actual functionality mentioned
- do not add responsibilities or features that are not documented

You may reorganize the information to make the answer easier to understand.


11. RECRUITER QUESTIONS

For recruiter-style questions, provide direct answers based on
the Candidate Profile.

If the profile does not contain the required information,
say that clearly instead of guessing.


12. NEVER CLAIM TO BE FAIZAN

You are Faizan's AI Portfolio Assistant whose name is FaizX.

Do not say:
"I am Faizan."

Instead say:
"I am FaizX, Faizan's AI Portfolio Assistant..." when identity clarification
is necessary.


=========================================================
FINAL PRINCIPLE
=========================================================

ACCURACY IS MORE IMPORTANT THAN COMPLETENESS.

If you have to choose between:
- giving an incomplete but factual answer
- giving a complete answer containing assumptions

always choose the factual answer.
"""


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AI Portfolio Backend is running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "FaizX Backend"
    }

# =========================================================
# CANDIDATE
# =========================================================

@app.get("/candidate")
def get_candidate():
    return load_candidate()


# =========================================================
# CHAT
# =========================================================

@app.post("/chat")
def chat(request: ChatRequest):

    candidate = load_candidate()

    # -----------------------------------------------------
    # Create current session history if it doesn't exist
    # -----------------------------------------------------

    if request.session_id not in conversation_histories:
        conversation_histories[request.session_id] = []

    history = conversation_histories[request.session_id]

    # -----------------------------------------------------
    # Candidate profile + current question
    # -----------------------------------------------------

    user_prompt = f"""
Candidate Profile:

{json.dumps(candidate, indent=2, ensure_ascii=False)}

User's Question:

{request.message}
"""

    # -----------------------------------------------------
    # Build messages
    # -----------------------------------------------------

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # Current conversation only
    messages.extend(history)

    messages.append(
        {
            "role": "user",
            "content": user_prompt
        }
    )

    # -----------------------------------------------------
    # Groq streaming response
    # -----------------------------------------------------

    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=messages,
        stream=True
    )

    # -----------------------------------------------------
    # Stream generator
    # -----------------------------------------------------

    def generate():

        full_response = ""

        for chunk in response:

            if not chunk.choices:
                continue

            content = chunk.choices[0].delta.content

            if content:
                full_response += content
                yield content

        # -------------------------------------------------
        # Save ONLY this conversation to current session
        # -------------------------------------------------

        history.append(
            {
                "role": "user",
                "content": request.message
            }
        )

        history.append(
            {
                "role": "assistant",
                "content": full_response
            }
        )

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )


# =========================================================
# JD TEXT EXTRACTION
# =========================================================

def extract_text_from_pdf(file_path: str) -> str:

    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:

        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def extract_text_from_docx(file_path: str) -> str:

    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:

        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    return "\n".join(paragraphs)


def extract_text_from_txt(file_path: str) -> str:

    with open(
        file_path,
        "r",
        encoding="utf-8",
        errors="ignore"
    ) as file:

        return file.read()


# =========================================================
# JD MATCH PROMPT
# =========================================================

# ============================================================
# JOB DESCRIPTION MATCHING
# ============================================================

current_jds: dict[str, dict] = {}


class JDTextRequest(BaseModel):
    session_id: str
    job_description: str


class JDMatchResponse(BaseModel):
    jd: dict
    match: dict


# ------------------------------------------------------------
# LLM CALL #1 PROMPT: Extract structured JD
# ------------------------------------------------------------

JD_EXTRACTION_PROMPT = """
You are a Job Description Parser.

Convert the raw job description into structured JSON.

STRICT RULES:
1. Extract only information explicitly present in the job description.
2. Do not add or infer technologies, qualifications, experience, or responsibilities.
3. Separate required skills from preferred/nice-to-have skills.
4. Keep requirements specific and short.
5. Return ONLY valid JSON.
6. Do not return markdown.
7. Do not explain anything outside JSON.

Return exactly this structure:

{
    "job_title": "",
    "required_skills": [],
    "preferred_skills": [],
    "required_experience": [],
    "education_requirements": [],
    "responsibilities": [],
    "other_requirements": []
}
"""


# ------------------------------------------------------------
# LLM CALL #2 PROMPT: Match candidate + JD → eligibility verdict
# ------------------------------------------------------------

JD_MATCH_PROMPT = """
You are a strict Resume-to-Job-Description matching engine.

You receive:
1. Candidate Profile JSON
2. Structured Job Description JSON

Your job is to determine:
- An eligibility verdict: "Yes", "No", or "Partially".
- A numeric match score from 0 to 100.
- A suitability label.
- Which requirements are matched, which are missing, and the evidence.

STRICT MATCHING RULES:

1. Use ONLY information explicitly present in the candidate profile.
2. Never assume two related technologies are the same.
   Examples:
   - MongoDB != PostgreSQL
   - Node.js != Python
   - React.js != Next.js
   - Vercel != AWS
   - REST API != GraphQL
   - JWT != OAuth
   - JavaScript != TypeScript
3. If a requirement is not explicitly supported by the candidate profile,
   mark it as missing.
4. Required requirements carry more weight than preferred requirements.
5. Do not give credit for inferred or assumed experience.
6. Score between 0 and 100. Interpretation:
   - 90-100 → Excellent Match → eligible = "Yes"
   - 75-89  → Strong Match    → eligible = "Yes"
   - 60-74  → Moderate Match  → eligible = "Partially"
   - 40-59  → Partial Match   → eligible = "Partially"
   - 0-39   → Low Match       → eligible = "No"
7. "eligible" rules:
   - "Yes"       → candidate clearly meets ALL core/required requirements
   - "Partially" → candidate meets SOME required requirements but is missing key ones
   - "No"        → candidate is missing most or all core/required requirements
8. matched_requirements must contain only requirements explicitly supported.
9. missing_requirements must contain requirements not explicitly supported.
10. evidence must be short strings that explain exactly which candidate
    information supports a match (e.g. "Project X used Node.js and Express").
11. Be strict and realistic.
12. Return ONLY valid JSON.
13. Do not return markdown.
14. Do not explain anything outside JSON.

Return exactly this structure:

{
    "score": 0,
    "eligible": "",
    "suitability": "",
    "summary": "",
    "matched_requirements": [],
    "missing_requirements": [],
    "evidence": [],
    "recommendation": ""
}
"""


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

def clean_json_response(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"```$", "", text)
    text = text.strip()

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("LLM did not return valid JSON.")

    return text[start:end + 1]


def extract_text_from_file(file_path: str, extension: str) -> str:
    if extension == ".pdf":
        return extract_text_from_pdf(file_path)
    if extension == ".docx":
        return extract_text_from_docx(file_path)
    if extension == ".txt":
        return extract_text_from_txt(file_path)
    raise ValueError(f"Unsupported extension: {extension}")


# ------------------------------------------------------------
# LLM CALL #1
# ------------------------------------------------------------

async def convert_jd_to_json(job_description: str) -> dict:
    prompt = JD_EXTRACTION_PROMPT + "\n\nRAW JOB DESCRIPTION:\n" + job_description

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    response_text = completion.choices[0].message.content
    cleaned = clean_json_response(response_text)
    return json.loads(cleaned)


# ------------------------------------------------------------
# LLM CALL #2
# ------------------------------------------------------------

async def match_candidate_with_jd(candidate: dict, jd_json: dict) -> dict:
    candidate_json = json.dumps(candidate, indent=2, ensure_ascii=False)
    jd_json_string = json.dumps(jd_json, indent=2, ensure_ascii=False)

    prompt = (
        JD_MATCH_PROMPT
        + "\n\nCANDIDATE PROFILE:\n"
        + candidate_json
        + "\n\nSTRUCTURED JOB DESCRIPTION:\n"
        + jd_json_string
    )

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    response_text = completion.choices[0].message.content
    cleaned = clean_json_response(response_text)
    result = json.loads(cleaned)

    # --- Normalize ---
    result["score"] = max(0, min(100, int(result.get("score", 0))))

    if result.get("eligible") not in {"Yes", "No", "Partially"}:
        result["eligible"] = "No"

    if result.get("suitability") not in {
        "Excellent Match", "Strong Match", "Moderate Match",
        "Partial Match", "Low Match",
    }:
        result["suitability"] = "Low Match"

    for key in ("matched_requirements", "missing_requirements", "evidence"):
        if not isinstance(result.get(key), list):
            result[key] = []

    result["summary"] = result.get("summary") or ""
    result["recommendation"] = result.get("recommendation") or ""

    return result


# ------------------------------------------------------------
# Shared pipeline (used by both /match-jd and /match-jd-text)
# ------------------------------------------------------------

async def process_job_description(session_id: str, job_description: str):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is empty.")

    candidate = load_candidate()  # ← was load_candidate_profile()

    jd_json = await convert_jd_to_json(job_description)
    current_jds[session_id] = jd_json

    match_result = await match_candidate_with_jd(candidate, jd_json)

    return {"jd": jd_json, "match": match_result}


# ============================================================
# UPLOAD JD (PDF / DOCX / TXT)
# ============================================================

@app.post("/match-jd", response_model=JDMatchResponse)
async def match_job_description(
    session_id: str = Form(...),
    file: UploadFile = File(...),
):
    temp_path = None

    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected.")

        extension = os.path.splitext(file.filename)[1].lower()
        if extension not in {".pdf", ".docx", ".txt"}:
            raise HTTPException(
                status_code=400,
                detail="Only PDF, DOCX and TXT files are supported.",
            )

        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        job_description = extract_text_from_file(temp_path, extension)

        if not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the Job Description.",
            )

        return await process_job_description(session_id, job_description)

    except HTTPException:
        raise
    except Exception as e:
        print("JD matching error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze the Job Description.",
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# ============================================================
# PASTED JD TEXT
# ============================================================

@app.post("/match-jd-text", response_model=JDMatchResponse)
async def match_job_description_text(request: JDTextRequest):
    try:
        return await process_job_description(
            request.session_id,
            request.job_description,
        )
    except HTTPException:
        raise
    except Exception as e:
        print("JD text matching error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze the Job Description.",
        )