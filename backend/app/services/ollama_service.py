import json
import logging
import re

import ollama

from app.config import OLLAMA_MODEL, OLLAMA_HOST
from app.services.ats_service import calculate_match
from app.services.prompt_builder import build_prompt

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create Ollama client
client = ollama.Client(host=OLLAMA_HOST)


def extract_json(text: str):
    """
    Extract JSON object from the Ollama response.
    """

    text = text.strip()

    # Remove markdown code blocks if present
    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)

    if not match:
        raise ValueError("No valid JSON found in AI response.")

    return json.loads(match.group())


def default_response(error_message: str):
    """
    Return a fallback response if Ollama fails.
    """

    return {
        "overall_score": 0,
        "ats_score": 0,
        "matched_skills": [],
        "missing_skills": [],
        "strengths": [],
        "weaknesses": [],
        "grammar_issues": [],
        "formatting_feedback": [],
        "experience_feedback": [],
        "education_feedback": [],
        "projects_feedback": [],
        "keyword_recommendations": [],
        "interview_readiness": "Unknown",
        "summary": "",
        "suggestions": [error_message]
    }


def analyze_resume(resume_text: str, job_description: str):
    """
    Analyze resume using Ollama and merge ATS analysis.
    """

    prompt = build_prompt(
        resume_text,
        job_description
    )

    try:

        logging.info("Sending request to Ollama...")

        response = client.chat(
            model=OLLAMA_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            options={
                "temperature": 0.2,
                "num_predict": 700
            }
        )

        raw_response = response["message"]["content"]

        logging.info("Raw Ollama Response:")
        logging.info(raw_response)

        logging.info("Response received successfully.")

        try:
            ai_result = extract_json(raw_response)
        except Exception as e:
            logging.exception("Invalid JSON returned by Ollama")
            logging.info(raw_response)
            return default_response(str(e))

        ats_result = calculate_match(
            resume_text,
            job_description
        )

        # Merge ATS results
        ai_result["ats_score"] = ats_result["ats_score"]

        ai_result["matched_skills"] = sorted(
            list(
                set(
                    ats_result["matched_skills"]
                )
            )
        )

        ai_result["missing_skills"] = sorted(
            list(
                set(
                    ai_result.get("matched_skills", [])
                     + ats_result["matched_skills"]
                )
            )
        )

        # Ensure all required fields exist
        # Calculate overall score from ATS

        overall = int(ai_result.get("overall_score", 0))

        if overall <= 0:
            overall = ats_result["ats_score"]

        ai_result["overall_score"] = overall

        if not ai_result.get("strengths"):
            ai_result["strengths"] = [
                "Strong programming foundation",
                "Relevant academic projects",
                "Problem solving skills",
                "Knowledge of core computer science",
                "Experience with multiple programming languages"
            ]

        if not ai_result.get("weaknesses"):
            ai_result["weaknesses"] = [
                "Limited industry experience",
                "Missing some required technologies",
                "Resume lacks measurable achievements",
                "Project descriptions need more detail",
                "ATS keywords can be improved"
            ]

        if not ai_result.get("grammar_issues"):
            ai_result["grammar_issues"] = [
                "No major grammar issues found."
            ]

        if not ai_result.get("formatting_feedback"):
            ai_result["formatting_feedback"] = [
                "Use consistent formatting throughout the resume.",
                "Keep headings uniform.",
                "Use bullet points consistently."
            ]

        ai_result.setdefault("experience_feedback", [])
        ai_result.setdefault("education_feedback", [])
        ai_result.setdefault("projects_feedback", [])
        ai_result.setdefault("keyword_recommendations", [])
        ai_result.setdefault("interview_readiness", "")

        if not ai_result.get("summary"):
            ai_result["summary"] = (
                "The resume was analyzed successfully. "
                "The candidate demonstrates several relevant skills but should improve "
                "the missing technologies and optimize the resume for ATS systems."
            )

        if not ai_result.get("suggestions"):
            ai_result["suggestions"] = [
                "Add more technical projects.",
                "Include measurable achievements.",
                "Improve ATS keywords.",
                "Customize the resume for each job.",
                "Add certifications if available."
            ]

        return ai_result

    except Exception as e:

        logging.exception("Ollama Error")

        return default_response(str(e))