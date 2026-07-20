# AI Module Documentation — AI Resume Screener & Feedback

## Overview

The AI Resume Screener & Feedback module analyzes a candidate's resume using a locally hosted Large Language Model (LLM) through **Ollama**. The system compares the uploaded resume against a provided Job Description (JD), performs Applicant Tracking System (ATS) style matching, and generates structured AI feedback to help candidates improve their resumes.

This module is intended as a **decision-support tool**. It does **not** make hiring decisions or replace human recruiters. Instead, it provides resume quality analysis, ATS compatibility insights, and personalized recommendations for improvement.

---

# System Architecture

```
                Resume Upload (PDF / DOCX)
                          │
                          ▼
                 Resume Text Extraction
               (extractor.py)
                          │
                          │
        Job Description (Text / PDF / DOCX)
                          │
                          ▼
              Job Description Extraction
                          │
                          ▼
               ATS Matching & Analysis
               (ats_service.py)
                          │
                          ▼
              Prompt Generation
            (prompt_builder.py)
                          │
                          ▼
               Ollama AI Analysis
            (ollama_service.py)
                          │
                          ▼
          JSON Response Validation
          (response_validator.py)
                          │
                          ▼
          Frontend Result Dashboard
```

---

# Current Flow

```
Resume Upload
      │
      ▼
Resume Text Extraction
      │
      ▼
Job Description Input
(Text / PDF / DOCX)
      │
      ▼
ATS Skill Matching
      │
      ▼
Prompt Builder
      │
      ▼
Ollama AI
      │
      ▼
Structured JSON Response
      │
      ▼
Frontend Dashboard
```

---

# Project Components

| Component | File |
|-----------|------|
| Upload Route | backend/app/routes/upload.py |
| Resume Extraction | backend/app/services/extractor.py |
| ATS Matching | backend/app/services/ats_service.py |
| Prompt Generation | backend/app/services/prompt_builder.py |
| AI Analysis | backend/app/services/ollama_service.py |
| Response Validation | ai/response_validator.py |
| Prompt Design | ai/prompt_design.md |

---

# How It Works

## Step 1 — Resume Upload

The user uploads a Resume in either:

- PDF
- DOCX

The upload route validates the file type before processing.

---

## Step 2 — Job Description

The Job Description can be provided in three different ways:

- Paste text directly
- Upload PDF
- Upload DOCX

If a document is uploaded, the text is extracted before analysis.

---

## Step 3 — Resume & Job Description Extraction

The extraction module converts uploaded documents into plain text.

Supported formats:

- PDF
- DOCX

This ensures that the AI model receives clean text instead of binary files.

---

## Step 4 — ATS Matching

The ATS service compares the Resume against the Job Description.

The comparison identifies:

- Matching technical skills
- Missing skills
- Keyword coverage
- Resume relevance
- ATS compatibility score

---

## Step 5 — Prompt Generation

The Prompt Builder creates a structured prompt that includes:

- Resume text
- Job Description
- ATS analysis
- Matching skills
- Missing skills

This prompt is optimized for the Ollama model.

---

## Step 6 — AI Analysis

The prompt is sent to the locally running Ollama model.

The AI behaves as:

- ATS Scanner
- HR Recruiter
- Technical Recruiter
- Career Coach
- Resume Reviewer

The model analyzes:

- Resume quality
- ATS compatibility
- Technical skills
- Missing keywords
- Grammar
- Formatting
- Education
- Projects
- Work experience
- Interview readiness

---

## Step 7 — Response Validation

The AI response is validated before being returned.

Validation includes:

- Valid JSON
- Required fields
- Correct data types
- Score range validation
- Schema verification

Invalid responses are rejected before reaching the frontend.

---

## Step 8 — Frontend Dashboard

The frontend displays the AI analysis in an organized dashboard including:

- Overall Score
- ATS Score
- Matched Skills
- Missing Skills
- Resume Summary
- Strengths
- Weaknesses
- Grammar Issues
- Formatting Feedback
- Education Feedback
- Experience Feedback
- Project Feedback
- Keyword Recommendations
- Interview Readiness
- Improvement Suggestions

---

# AI Output Format

The Ollama service returns structured JSON.

```json
{
    "overall_score": 86,
    "ats_score": 81,

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

# JSON Field Descriptions

| Field | Description |
|--------|-------------|
| overall_score | Overall resume quality score (0–100) |
| ats_score | ATS compatibility score based on the Job Description |
| matched_skills | Skills present in both Resume and Job Description |
| missing_skills | Required skills missing from the Resume |
| strengths | Strong aspects of the Resume |
| weaknesses | Areas that need improvement |
| grammar_issues | Grammar mistakes detected |
| formatting_feedback | Formatting and readability suggestions |
| experience_feedback | Feedback about work experience |
| education_feedback | Feedback on education section |
| projects_feedback | Suggestions related to projects |
| keyword_recommendations | ATS keywords to improve matching |
| interview_readiness | Estimated interview readiness |
| summary | Overall AI-generated evaluation |
| suggestions | Personalized improvement recommendations |

---

# Supported File Types

## Resume

- PDF
- DOCX

## Job Description

- Text
- PDF
- DOCX

---

# Validation Rules

The system validates:

- Resume file type
- Job Description file type
- Extracted text
- AI JSON response
- Score ranges
- Required JSON fields
- Data types

---

# Error Handling

The system handles:

## Invalid Resume

Returns:

```
Only PDF and DOCX files are allowed.
```

---

## Missing Resume

Returns:

```
No resume selected.
```

---

## Invalid Job Description

Returns:

```
Job Description must be PDF or DOCX.
```

---

## Missing Job Description

If no Job Description is supplied, the system can analyze the Resume independently or return an appropriate validation message depending on configuration.

---

## Extraction Failure

If text extraction fails:

- The AI is not called.
- A backend error is returned.

---

## Invalid AI Response

If Ollama returns invalid JSON:

- Validation fails.
- A safe error message is returned.
- The frontend does not display corrupted data.

---

# Current Features

- Resume Upload (PDF)
- Resume Upload (DOCX)
- Job Description Paste
- Job Description Upload (PDF)
- Job Description Upload (DOCX)
- Resume Parsing
- ATS Skill Matching
- Missing Skill Detection
- Keyword Recommendations
- Grammar Analysis
- Formatting Analysis
- Education Review
- Experience Review
- Project Review
- Interview Readiness Assessment
- AI Resume Summary
- Improvement Suggestions
- Structured JSON Responses
- Response Validation
- Local AI Processing using Ollama

---

# Advantages of Ollama

Compared to cloud-based AI services:

- No API usage charges
- No internet dependency after model installation
- Faster local inference
- Better privacy
- Resume data remains on the user's machine
- No external data sharing
- Easy model switching
- Supports multiple open-source LLMs

---

# Known Limitations

- Analysis quality depends on the selected Ollama model.
- Very large resumes may increase processing time.
- ATS scoring is an estimation and not identical to commercial ATS systems.
- Poorly formatted resumes may reduce text extraction accuracy.
- AI recommendations should be treated as guidance rather than absolute hiring decisions.

---

# Setup Requirements

1. Install Python dependencies.

```bash
pip install -r backend/requirements.txt
```

2. Install Ollama.

3. Download the required model.

Example:

```bash
ollama pull llama3.2:3b
```

4. Start the Ollama server.

```bash
ollama serve
```

5. Start the FastAPI backend.

```bash
uvicorn app.main:app --reload
```

6. Start the frontend application.

---

# Related Files

- `backend/app/routes/upload.py` — Handles Resume and Job Description uploads.
- `backend/app/services/extractor.py` — Extracts text from PDF and DOCX files.
- `backend/app/services/ats_service.py` — Performs ATS skill matching.
- `backend/app/services/prompt_builder.py` — Builds prompts for the AI model.
- `backend/app/services/ollama_service.py` — Communicates with the Ollama model.
- `ai/prompt_design.md` — Defines the AI prompt and expected JSON schema.
- `ai/response_validator.py` — Validates AI responses before sending them to the frontend.
- `tests/test_cases.md` — Test cases for validating the AI module.

---

# Future Improvements

Planned enhancements include:

- Cover Letter Analysis
- Resume Rewrite Suggestions
- STAR Interview Question Generation
- Resume Ranking Against Multiple Job Descriptions
- Industry-Specific ATS Scoring
- Multi-Language Resume Support
- AI Cover Letter Generation
- Resume Version Comparison
- Skill Gap Analysis
- Streaming AI Responses
- Automatic Retry for AI Failures
- Advanced JSON Schema Validation
- Support for Multiple Ollama Models