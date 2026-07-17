from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
from uuid import uuid4
import shutil
import re

from app.config import UPLOAD_FOLDER
from app.utils.file_validator import allowed_file
from app.services.extractor import extract_pdf_text, extract_docx_text
from app.services.ollama_service import analyze_resume

router = APIRouter()

Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)


def parse_resume(text):

    email = ""
    phone = ""

    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    if email_match:
        email = email_match.group()

    phone_match = re.search(r'(\+?\d[\d\s\-]{8,15})', text)
    if phone_match:
        phone = phone_match.group().strip()

    skills = []

    skill_list = [
        "Python",
        "C",
        "C++",
        "Java",
        "JavaScript",
        "HTML",
        "CSS",
        "SQL",
        "FastAPI",
        "React",
        "Git",
        "GitHub",
        "TensorFlow",
        "PyTorch",
        "Pandas",
        "NumPy",
        "Machine Learning",
        "Deep Learning",
        "Artificial Intelligence"
    ]

    for skill in skill_list:
        if skill.lower() in text.lower():
            skills.append(skill)

    education = []

    education_keywords = [
        "BS",
        "Bachelor",
        "Master",
        "University",
        "College"
    ]

    for line in text.splitlines():
        for word in education_keywords:
            if word.lower() in line.lower():
                education.append(line.strip())
                break

    projects = []

    project_keywords = [
        "Project",
        "System",
        "Website",
        "Game"
    ]

    for line in text.splitlines():
        for word in project_keywords:
            if word.lower() in line.lower():
                projects.append(line.strip())
                break

    languages = []

    language_list = [
        "English",
        "Urdu",
        "Punjabi",
        "Arabic"
    ]

    for language in language_list:
        if language.lower() in text.lower():
            languages.append(language)

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = lines[0] if lines else ""

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": list(set(skills)),
        "education": education,
        "projects": projects,
        "languages": languages
    }


@router.post("/upload")
async def upload_resume(

    resume: UploadFile = File(...),
    job_description: str = Form(...)

):

    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="No resume selected."
        )

    if not allowed_file(resume.filename):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed."
        )

    unique_filename = f"{uuid4().hex}_{resume.filename}"

    file_path = Path(UPLOAD_FOLDER) / unique_filename

    try:

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        extension = resume.filename.rsplit(".", 1)[1].lower()

        if extension == "pdf":
            extracted_text = extract_pdf_text(file_path)
        else:
            extracted_text = extract_docx_text(file_path)

        parsed_resume = parse_resume(extracted_text)

        ai_feedback = analyze_resume(
            extracted_text,
            job_description
        )

        return {

            "success": True,

            "message": "Resume analyzed successfully.",

            "filename": unique_filename,

            "resume": parsed_resume,

            "analysis": ai_feedback,

            "job_description": job_description,

            "raw_text": extracted_text

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )