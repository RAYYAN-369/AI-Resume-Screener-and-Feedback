import json
import re
import ollama

from app.services.prompt_builder import build_prompt
from app.services.ats_service import calculate_match


def analyze_resume(resume_text, job_description):

    prompt = build_prompt(resume_text, job_description)

    try:

        response = ollama.chat(
            model="llama3.1",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        content = response["message"]["content"].strip()

        print("\n========== OLLAMA RAW RESPONSE ==========")
        print(content)
        print("=========================================\n")

        if content.startswith("```"):
            content = content.replace("```json", "")
            content = content.replace("```", "")
            content = content.strip()

        match = re.search(r"\{.*\}", content, re.DOTALL)

        if not match:
            raise Exception("No JSON found in Ollama response.")

        json_text = match.group()

        ai_result = json.loads(json_text)

        ats_result = calculate_match(
            resume_text,
            job_description
        )

        ai_result["ats_score"] = ats_result["ats_score"]
        ai_result["matched_skills"] = ats_result["matched_skills"]

        ai_result["missing_skills"] = list(
            set(
                ai_result.get("missing_skills", [])
                + ats_result["missing_skills"]
            )
        )

        return ai_result

    except Exception as e:

        print("\n========== OLLAMA ERROR ==========")
        print(e)
        print("==================================\n")

        return {
            "overall_score": 0,
            "ats_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "strengths": [],
            "weaknesses": [],
            "suggestions": [
                f"AI Error: {str(e)}"
            ]
        }