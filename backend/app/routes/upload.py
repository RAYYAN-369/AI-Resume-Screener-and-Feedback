from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from uuid import uuid4
import shutil

from app.config import UPLOAD_FOLDER
from app.utils.file_validator import allowed_file
from app.services.extractor import extract_pdf_text, extract_docx_text
from app.services.gemini_service import analyze_resume

router = APIRouter()

Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed."
        )

    unique_filename = f"{uuid4().hex}_{file.filename}"
    file_path = Path(UPLOAD_FOLDER) / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extension = file.filename.rsplit(".", 1)[1].lower()

        if extension == "pdf":
            extracted_text = extract_pdf_text(file_path)
        else:
            extracted_text = extract_docx_text(file_path)

        ai_feedback = analyze_resume(extracted_text)

        return {
            "success": True,
            "message": "Resume uploaded successfully.",
            "filename": unique_filename,
            "extracted_text": extracted_text,
            "ai_feedback": ai_feedback
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )