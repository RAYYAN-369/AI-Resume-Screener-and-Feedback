"""
Response Validator — AI Resume Screener

Validates Gemini's JSON response against the proposed v2 schema
(see ai/prompt_design.md) before it is shown to the user.

This uses Pydantic, matching the validation approach described in the
project's reference documentation (AI_Resume_Scanner_Overview).
"""

import json
from pydantic import BaseModel, ValidationError, field_validator


class ResumeAssessment(BaseModel):
    overall_score: int
    score_rationale: str
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    limitations: str

    @field_validator("overall_score")
    @classmethod
    def score_in_range(cls, v):
        if not (0 <= v <= 10):
            raise ValueError("overall_score must be between 0 and 10")
        return v

    @field_validator("strengths", "weaknesses", "suggestions")
    @classmethod
    def not_empty_list_of_strings(cls, v):
        if not isinstance(v, list) or any(not isinstance(item, str) for item in v):
            raise ValueError("must be a list of strings")
        return v


def validate_gemini_response(raw_text: str):
    """
    Attempts to parse and validate Gemini's raw text response.

    Returns (True, ResumeAssessment) if valid.
    Returns (False, error_message) if invalid or malformed.
    """
    # Gemini sometimes wraps JSON in markdown code fences; strip those first.
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        return False, f"Response was not valid JSON: {e}"

    try:
        assessment = ResumeAssessment(**data)
        return True, assessment
    except ValidationError as e:
        return False, f"Response did not match expected schema: {e}"


if __name__ == "__main__":
    # Quick manual tests

    # TC-06 case 1: valid JSON matching schema
    valid_example = """
    {
        "overall_score": 8,
        "score_rationale": "Strong metrics and clear progression.",
        "strengths": ["Quantified achievements", "Clear career growth"],
        "weaknesses": ["Missing contact info"],
        "suggestions": ["Add a professional summary"],
        "limitations": ""
    }
    """
    ok, result = validate_gemini_response(valid_example)
    print("Valid JSON test ->", "PASSED" if ok else "FAILED", "-", result)

    # TC-06 case 2: malformed JSON (missing closing brace)
    malformed_example = """
    {
        "overall_score": 8,
        "score_rationale": "Missing closing brace"
    """
    ok, result = validate_gemini_response(malformed_example)
    print("Malformed JSON test ->", "PASSED (correctly rejected)" if not ok else "FAILED (incorrectly accepted)", "-", result)

    # TC-06 case 3: valid JSON but wrong types (score out of range)
    invalid_schema_example = """
    {
        "overall_score": 55,
        "score_rationale": "Score out of allowed range",
        "strengths": ["A"],
        "weaknesses": ["B"],
        "suggestions": ["C"],
        "limitations": ""
    }
    """
    ok, result = validate_gemini_response(invalid_schema_example)
    print("Out-of-range score test ->", "PASSED (correctly rejected)" if not ok else "FAILED (incorrectly accepted)", "-", result)