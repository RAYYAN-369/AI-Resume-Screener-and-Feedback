\# AI Module Documentation — Resume Screener



\## Overview

This module analyzes a candidate's resume using Google's Gemini AI and returns

constructive feedback to help improve the resume's quality and hiring potential.



This is a decision-support tool. It does NOT make hiring decisions and should not

be treated as a definitive judgment of a candidate's suitability.



\## Current Flow



Resume File Upload (Flask route: backend/app/routes/upload.py)

&#x20;       |

Text Extraction (backend/app/services/extractor.py)

&#x20;       |

Gemini AI Analysis (backend/app/services/gemini\_service.py)

&#x20;       |

Feedback Returned to User (frontend/templates/result.html)



\## How It Works



\### Step 1 — User uploads a resume

The frontend (upload.html) allows the user to upload a resume file.



\### Step 2 — Text extraction

extractor.py extracts plain text from the uploaded file so it can be sent to Gemini.



\### Step 3 — AI Analysis

gemini\_service.py sends the resume text to Gemini (currently model: gemini-2.0-flash)

with a prompt instructing it to act as an HR recruiter and return feedback.



\### Step 4 — Response returned

The result is displayed to the user via result.html.



\## Current Output Format (v1 — as implemented)

Plain text in this format:



Overall Score: X/10

Strengths:

\- Point 1

\- Point 2

Weaknesses:

\- Point 1

\- Point 2

Suggestions:

\- Point 1

\- Point 2



\## Proposed Output Format (v2 — see ai/prompt\_design.md)

Structured JSON with fields: overall\_score, score\_rationale, strengths,

weaknesses, suggestions, and limitations. This allows the frontend to

reliably display each field instead of parsing raw text, and allows

automated validation of Gemini's response before showing it to the user.



\## Known Limitations

1\. Gemini's output can vary slightly between runs on the same resume, since

&#x20;  the model is probabilistic. A score of 7 vs 8 does not necessarily mean

&#x20;  the resume changed — it means the model's wording/weighting shifted slightly.

2\. The current implementation does not compare the resume against a job

&#x20;  description — it evaluates the resume in isolation.

3\. No retry logic exists yet for rate limits (429) or network errors.

4\. Gemini's response is not currently validated against a schema before

&#x20;  being shown to the user.



\## Setup Requirements

1\. A valid GEMINI\_API\_KEY must be set in a .env file (see .env.example).

2\. Install backend dependencies: pip install -r backend/requirements.txt



\## Related Files

\- ai/prompt\_design.md — improved prompt design and JSON schema proposal

\- tests/test\_cases.md — test cases for validating AI responses

