"""
Response Validator — AI Resume Screener & Feedback

Validates the JSON response returned by Ollama against the
expected schema defined in ai/prompt_design.md.

The validator ensures that every required field exists,
has the correct data type, and contains valid values
before the response is sent to the frontend.
"""

import json
from pydantic import BaseModel, ValidationError, field_validator


class ResumeAssessment(BaseModel):
    overall_score: int
    ats_score: int

    matched_skills: list[str]
    missing_skills: list[str]

    strengths: list[str]
    weaknesses: list[str]

    grammar_issues: list[str]
    formatting_feedback: list[str]
    experience_feedback: list[str]
    education_feedback: list[str]
    projects_feedback: list[str]

    keyword_recommendations: list[str]

    interview_readiness: str
    summary: str

    suggestions: list[str]

    @field_validator("overall_score", "ats_score")
    @classmethod
    def validate_score(cls, value):

        if not (0 <= value <= 100):
            raise ValueError("Score must be between 0 and 100.")

        return value

    @field_validator(
        "matched_skills",
        "missing_skills",
        "strengths",
        "weaknesses",
        "grammar_issues",
        "formatting_feedback",
        "experience_feedback",
        "education_feedback",
        "projects_feedback",
        "keyword_recommendations",
        "suggestions"
    )
    @classmethod
    def validate_string_list(cls, value):

        if not isinstance(value, list):
            raise ValueError("Value must be a list.")

        for item in value:
            if not isinstance(item, str):
                raise ValueError("All list items must be strings.")

        return value

    @field_validator(
        "interview_readiness",
        "summary"
    )
    @classmethod
    def validate_string(cls, value):

        if not isinstance(value, str):
            raise ValueError("Value must be a string.")

        return value


def validate_ollama_response(raw_text: str):
    """
    Validate Ollama JSON response.

    Returns:
        (True, ResumeAssessment)
        or
        (False, error_message)
    """

    cleaned = raw_text.strip()

    if cleaned.startswith("```"):

        cleaned = cleaned.replace("```json", "")
        cleaned = cleaned.replace("```", "")
        cleaned = cleaned.strip()

    try:

        data = json.loads(cleaned)

    except json.JSONDecodeError as e:

        return False, f"Invalid JSON: {e}"

    try:

        assessment = ResumeAssessment(**data)

        return True, assessment

    except ValidationError as e:

        return False, f"Schema validation failed:\n{e}"


if __name__ == "__main__":

    print("=" * 60)
    print("AI Resume Screener Response Validator")
    print("=" * 60)

    # ---------------------------------------------------------
    # Test Case 1
    # ---------------------------------------------------------

    valid_example = """
    {
        "overall_score": 86,
        "ats_score": 82,
        "matched_skills": ["Python", "FastAPI"],
        "missing_skills": ["Docker"],

        "strengths": [
            "Strong backend development experience",
            "Good project portfolio"
        ],

        "weaknesses": [
            "Resume lacks measurable achievements"
        ],

        "grammar_issues": [],

        "formatting_feedback": [
            "Improve spacing"
        ],

        "experience_feedback": [
            "Include internship responsibilities"
        ],

        "education_feedback": [
            "Mention CGPA"
        ],

        "projects_feedback": [
            "Add deployment links"
        ],

        "keyword_recommendations": [
            "REST API",
            "Microservices"
        ],

        "interview_readiness": "Ready",

        "summary": "Strong resume with minor improvements needed.",

        "suggestions": [
            "Add quantified achievements",
            "Include Docker projects"
        ]
    }
    """

    ok, result = validate_ollama_response(valid_example)

    print("\nTest Case 1 (Valid JSON)")
    print("PASS" if ok else "FAIL")
    print(result)

    # ---------------------------------------------------------
    # Test Case 2
    # ---------------------------------------------------------

    malformed_json = """
    {
        "overall_score":80,
        "ats_score":75
    """

    ok, result = validate_ollama_response(malformed_json)

    print("\nTest Case 2 (Malformed JSON)")
    print("PASS" if not ok else "FAIL")
    print(result)

    # ---------------------------------------------------------
    # Test Case 3
    # ---------------------------------------------------------

    invalid_score = """
    {
        "overall_score":150,
        "ats_score":80,

        "matched_skills":[],
        "missing_skills":[],

        "strengths":[],
        "weaknesses":[],

        "grammar_issues":[],
        "formatting_feedback":[],
        "experience_feedback":[],
        "education_feedback":[],
        "projects_feedback":[],

        "keyword_recommendations":[],

        "interview_readiness":"Ready",

        "summary":"",

        "suggestions":[]
    }
    """

    ok, result = validate_ollama_response(invalid_score)

    print("\nTest Case 3 (Invalid Score)")
    print("PASS" if not ok else "FAIL")
    print(result)

    # ---------------------------------------------------------
    # Test Case 4
    # ---------------------------------------------------------

    missing_field = """
    {
        "overall_score":90,
        "ats_score":80
    }
    """

    ok, result = validate_ollama_response(missing_field)

    print("\nTest Case 4 (Missing Fields)")
    print("PASS" if not ok else "FAIL")
    print(result)

    print("\nValidation Tests Completed.")