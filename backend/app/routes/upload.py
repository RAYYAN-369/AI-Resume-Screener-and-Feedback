from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
from uuid import uuid4
import shutil
import re
import logging

from app.config import UPLOAD_FOLDER
from app.utils.file_validator import allowed_file
from app.services.extractor import extract_pdf_text, extract_docx_text
from app.services.ollama_service import analyze_resume

router = APIRouter()

# Create uploads folder if it doesn't exist
Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)


def parse_resume(text: str):

    email = ""
    phone = ""

    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    if email_match:
        email = email_match.group()

    phone_match = re.search(r"(\+?\d[\d\s\-]{8,15})", text)
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
        for keyword in education_keywords:
            if keyword.lower() in line.lower():
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
        for keyword in project_keywords:
            if keyword.lower() in line.lower():
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

    job_description: str = Form(None),

    job_description_file: UploadFile = File(None)

):

    # -------------------------------
    # Validate Resume
    # -------------------------------

    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="No resume selected."
        )

    if not allowed_file(resume.filename):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resumes are allowed."
        )

    # -------------------------------
    # Validate Job Description
    # -------------------------------

    if not job_description and not job_description_file:
        raise HTTPException(
            status_code=400,
            detail="Please provide a Job Description or upload a Job Description file."
        )

    if job_description_file:

        if not job_description_file.filename:
            raise HTTPException(
                status_code=400,
                detail="Invalid Job Description file."
            )

        if not allowed_file(job_description_file.filename):
            raise HTTPException(
                status_code=400,
                detail="Job Description must be PDF or DOCX."
            )

    try:

        # -------------------------------
        # Save Resume
        # -------------------------------

        resume_filename = f"{uuid4().hex}_{resume.filename}"

        resume_path = Path(UPLOAD_FOLDER) / resume_filename

        with open(resume_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        resume_extension = resume.filename.rsplit(".", 1)[1].lower()

        if resume_extension == "pdf":
            resume_text = extract_pdf_text(resume_path)
        else:
            resume_text = extract_docx_text(resume_path)

        # -------------------------------
        # Read Job Description
        # -------------------------------

        if job_description_file:

            jd_filename = f"{uuid4().hex}_{job_description_file.filename}"

            jd_path = Path(UPLOAD_FOLDER) / jd_filename

            with open(jd_path, "wb") as buffer:
                shutil.copyfileobj(job_description_file.file, buffer)

            jd_extension = job_description_file.filename.rsplit(".", 1)[1].lower()

            if jd_extension == "pdf":
                job_description = extract_pdf_text(jd_path)
            else:
                job_description = extract_docx_text(jd_path)

        # -------------------------------
        # Parse Resume
        # -------------------------------

        parsed_resume = parse_resume(resume_text)

        # -------------------------------
        # AI Analysis
        # -------------------------------

        print("=" * 60)
        print("Starting AI Analysis...")
        print("=" * 60)

        print("=" * 60)
        print("Resume Length:", len(resume_text))
        print("Job Description Length:", len(job_description))
        print("=" * 60)

        analysis = analyze_resume(
            resume_text[:4000],
            job_description[:2000]
        )

        print("=" * 60)
        print("AI Analysis Completed")
        print(analysis)
        print("=" * 60)

        # -------------------------------
        # Response
        # -------------------------------

        return {

            "success": True,

            "message": "Resume analyzed successfully.",

            "filename": resume_filename,

            "resume": parsed_resume,

            "analysis": analysis,

            "job_description": job_description,

            "raw_text": resume_text

        }

    except Exception as e:

        logging.exception("Upload Route Error")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )