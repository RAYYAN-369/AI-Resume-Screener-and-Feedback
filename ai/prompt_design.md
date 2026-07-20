# Ollama Prompt Design — AI Resume Screener & Feedback

## Current Implementation (feature/backend)

**File:** `backend/app/services/ollama_service.py`

**Model:** `llama3.2:3b` (or the model configured in `.env`)

**Function:** `analyze_resume(resume_text, job_description)`

---

## Current Prompt Behavior

The AI module performs an ATS-style comparison between the uploaded resume and the provided job description.

### Inputs

- Resume PDF/DOCX
- Job Description (Pasted Text)
- Job Description PDF/DOCX

### Processing Flow

1. Extract text from Resume.
2. Extract text from Job Description (if uploaded).
3. Compare Resume against Job Description.
4. Calculate ATS Score.
5. Generate AI feedback using Ollama.
6. Return structured JSON.

### Current Output

Returns structured JSON instead of plain text.

Current fields include:

- overall_score
- ats_score
- matched_skills
- missing_skills
- strengths
- weaknesses
- grammar_issues
- formatting_feedback
- experience_feedback
- education_feedback
- projects_feedback
- keyword_recommendations
- interview_readiness
- summary
- suggestions

---

# Objectives

The AI should behave like a professional:

- ATS Scanner
- HR Recruiter
- Technical Recruiter
- Resume Reviewer
- Career Coach

The AI should compare the resume directly against the supplied Job Description and provide constructive, accurate, and actionable feedback.

---

# Prompt (Current Version)

You are an experienced HR recruiter, ATS specialist, technical interviewer, and career coach.

Your task is to compare the candidate's resume with the provided Job Description.

Evaluate the resume exactly like a modern Applicant Tracking System (ATS).

Follow these rules carefully:

- Return ONLY valid JSON.
- Never return Markdown.
- Never explain outside JSON.
- Never invent skills, projects, companies, education, certifications, or experience.
- Base every point only on the Resume and Job Description provided.
- If the resume lacks enough information, mention it in Suggestions.
- If the Job Description is missing information, continue using the available text.
- Compare both technical skills and soft skills.
- Detect missing keywords.
- Detect grammar issues.
- Detect formatting issues.
- Evaluate projects.
- Evaluate education.
- Evaluate work experience.
- Evaluate interview readiness.
- Give realistic ATS scoring.

Resume:

{resume_text}

Job Description:

{job_description}

Return ONLY valid JSON.

---

# Required JSON Schema

```json
{
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
    "interview_readiness": "",
    "summary": "",
    "suggestions": []
}
```

---

# JSON Schema Description

| Field | Type | Description |
|--------|------|-------------|
| overall_score | Integer (0–100) | Overall quality of the resume |
| ats_score | Integer (0–100) | ATS match score based on Job Description |
| matched_skills | Array | Skills found in both Resume and Job Description |
| missing_skills | Array | Skills required by the Job Description but missing from the Resume |
| strengths | Array | Strong aspects of the Resume |
| weaknesses | Array | Weak areas that should be improved |
| grammar_issues | Array | Grammar mistakes detected |
| formatting_feedback | Array | Suggestions about formatting and readability |
| experience_feedback | Array | Feedback about work experience |
| education_feedback | Array | Feedback about education section |
| projects_feedback | Array | Feedback about projects |
| keyword_recommendations | Array | ATS keywords recommended for improvement |
| interview_readiness | String | Interview readiness level |
| summary | String | Overall AI-generated summary |
| suggestions | Array | Actionable improvement recommendations |

---

# Validation Rules

The AI must always:

- Return valid JSON.
- Include every required field.
- Never omit any field.
- Use empty arrays when there is no data.
- Use empty strings when necessary.
- Keep scores between 0 and 100.
- Never return null values.
- Never hallucinate information.

---

# Error Handling

If Resume text cannot be extracted:

- Return an appropriate backend error.
- Do not send an empty prompt to Ollama.

If Job Description is empty:

- Analyze the Resume independently.
- Set ATS Score to 0 or a suitable default.
- Continue generating resume feedback.

If Ollama returns invalid JSON:

- Attempt to extract the JSON object.
- Validate the schema.
- Return a default response if validation fails.

---

# Advantages Over Previous Gemini Prompt

The previous implementation:

- Analyzed only the Resume.
- Returned plain text.
- Had no ATS comparison.
- Had no Job Description support.
- Had no structured response.
- Was difficult for the frontend to parse.

The current implementation:

- Supports Resume + Job Description comparison.
- Supports both pasted and uploaded Job Descriptions.
- Returns structured JSON.
- Calculates ATS Score.
- Detects matched and missing skills.
- Provides detailed feedback for grammar, formatting, education, projects, and experience.
- Gives interview readiness assessment.
- Is fully compatible with the frontend and backend APIs.

---

# Future Improvements

Possible future enhancements include:

- Multi-language resume analysis.
- Industry-specific ATS scoring.
- Role-specific scoring models.
- Cover Letter analysis.
- Resume rewriting suggestions.
- Resume keyword optimization.
- STAR interview question generation.
- AI-generated cover letter based on the uploaded Resume and Job Description.
- Resume ranking against multiple Job Descriptions.
- Support for multiple Ollama models.
- Streaming AI responses.
- Automatic JSON schema validation before returning results.