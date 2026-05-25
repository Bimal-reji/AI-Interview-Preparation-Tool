from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import shutil
import os

from modules.resume_parser import extract_text_from_pdf
from modules.role_extraction import extract_role
from modules.skill_extraction import extract_skills
from modules.skill_gap import analyze_skill_gap

from modules.llm_module import (
    generate_questions,
    evaluate_answer,
)
from modules.llm_practice import (
    generate_practice,
    evaluate_practice,
)

from modules.followup_llm import (
    generate_follow_up,
    generate_first_question,
)

from modules.speech_to_text import (
    listen_from_mic,
)

# =====================================================
# APP
# =====================================================

app = FastAPI(title="AI Interview Preparation System")

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# UPLOAD FOLDER
# =====================================================

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =====================================================
# JOB ROLE DATABASE
# =====================================================

job_roles = {
    "Software Developer":  ["DSA", "Java", "System Design"],
    "Frontend Developer":  ["HTML", "CSS", "JavaScript", "React"],
    "Backend Developer":   ["Node.js", "Java", "SQL"],
    "Data Scientist":      ["Python", "Machine Learning", "Statistics"],
    "AI / ML Engineer":    ["Deep Learning", "TensorFlow", "NLP"],
    "DevOps Engineer":     ["Docker", "Kubernetes", "AWS"],
}

# =====================================================
# REQUEST MODELS
# =====================================================

class RoleRequest(BaseModel):
    role: str

class GenerateQuestionsRequest(BaseModel):
    role: str
    matched_skills: list[str] = []
    missing_skills: list[str] = []

class EvaluationRequest(BaseModel):
    question: str
    answer: str

class FollowUpRequest(BaseModel):
    role: str
    question: str
    answer: str
    history: list = []

# =====================================================
# ROOT
# =====================================================

@app.get("/")
async def root():
    return {"message": "AI Interview Preparation Backend Running 🚀"}

# =====================================================
# HEALTH
# =====================================================

@app.get("/health")
async def health():
    return {"status": "ok"}

# =====================================================
# ANALYZE RESUME
# =====================================================

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    # 1. Save uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Extract text — guard early so variables below are always defined
    resume_text = extract_text_from_pdf(file_path)
    if not resume_text:
        return {"error": "Could not extract resume text"}

    # 3. Extract skills — returns dict; unwrap to plain list for downstream calls
    skills_result = extract_skills(resume_text)
    all_skills = skills_result["all_skills"]

    # 4. Detect role — returns dict; unwrap role string for downstream calls
    role_result = extract_role(resume_text, all_skills)
    role_name = role_result["role"]

    # 5. Skill-gap analysis
    gap_result = analyze_skill_gap(role_name, all_skills)

    return {
        "role":                role_result,
        "skills":              skills_result,
        "matched_skills":      gap_result["matched_skills"],
        "missing_skills":      gap_result["missing_skills"],
        "coverage_percentage": gap_result["coverage_percentage"],
    }

# =====================================================
# VOICE INPUT
# =====================================================

@app.get("/voice-input")
async def voice_input():
    text = listen_from_mic()
    return {"text": text}

# =====================================================
# SELECT ROLE
# =====================================================

@app.post("/select-role")
async def select_role(data: RoleRequest):
    role   = data.role
    skills = job_roles.get(role, [])
    return {
        "role":                role,
        "skills":              skills,
        "matched_skills":      [],
        "missing_skills":      skills,
        "coverage_percentage": 0,
    }

# =====================================================
# START INTERVIEW
# =====================================================

@app.post("/start-interview")
async def start_interview(data: dict):
    role = data.get("role")
    if not role:
        return {"error": "Role is required"}
    question = generate_first_question(role)
    return {"question": question}

# =====================================================
# GENERATE QUESTIONS
# =====================================================

@app.post("/generate-questions")
async def generate_questions_api(data: dict):
    import json as _json

    role           = data.get("role")
    matched_skills = data.get("matched_skills") or []
    missing_skills = data.get("missing_skills") or []

    if not role:
        return {"error": "Role is required"}

    raw = generate_questions(role, matched_skills, missing_skills)

    # generate_questions returns a JSON string; parse it so the frontend
    # receives {"questions": [...]} not {"questions": "[...]"}
    try:
        questions_list = _json.loads(raw) if isinstance(raw, str) else raw
    except _json.JSONDecodeError:
        questions_list = raw

    return {"questions": questions_list}

# =====================================================
# EVALUATE ANSWER
# =====================================================

@app.post("/evaluate-answer")
async def evaluate_answer_api(data: EvaluationRequest):
    feedback = evaluate_answer(data.question, data.answer)
    return {"feedback": feedback}

# =====================================================
# FOLLOW-UP QUESTION
# =====================================================

@app.post("/follow-up-question")
async def follow_up_question_api(data: FollowUpRequest):
    if not data.role or not data.question or not data.answer:
        return {"error": "Missing required fields"}

    follow_up = generate_follow_up(
        role=data.role,
        previous_question=data.question,
        answer=data.answer,
        history=data.history,
    )
    return {"follow_up": follow_up}

# =====================================================
# RUN
# =====================================================
# =====================================================
# GENERATE MCQ PRACTICE QUESTIONS
# =====================================================

@app.post("/generate-practice")
async def generate_practice_api(data: GenerateQuestionsRequest):

    role = data.role

    matched_skills = (
        data.matched_skills or []
    )

    missing_skills = (
        data.missing_skills or []
    )

    if not role:

        return {
            "error":
            "Role is required"
        }

    questions = generate_practice(
        role,
        matched_skills,
        missing_skills
    )

    return {
        "questions": questions
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)  # FIX: was "main_server:app"