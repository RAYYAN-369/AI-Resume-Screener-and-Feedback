\# Gemini Prompt Design — AI Resume Screener



\## Current Implementation (feature/backend)

File: backend/app/services/gemini\_service.py

Model: gemini-2.0-flash

Function: analyze\_resume(resume\_text)



\### Current Prompt Behavior

\- Analyzes resume ONLY (no job description comparison)

\- Returns plain text in fixed format:

&#x20; Overall Score: X/10

&#x20; Strengths: - Weaknesses: - Suggestions:

\- No structured JSON output

\- No schema validation

\- No retry logic for API failures



\## Gaps Identified

1\. No job description input — cannot measure resume-to-job fit

2\. Free text output cannot be reliably parsed by frontend

3\. No validation of Gemini's response before displaying to user

4\. No handling for empty/malformed resume text

5\. No retry logic for rate limits (429) or network errors



\## Proposed Improved Prompt (v2)



You are an experienced HR recruiter and resume reviewer.

Analyze the resume text provided below and return ONLY valid JSON.

Do not include any text, explanation, or markdown formatting outside the JSON object.



Follow these rules:

\- Base every point strictly on the resume text provided. Do not invent skills, employers, or dates that are not present.

\- Be constructive and specific rather than generic.

\- If the resume is too short or unclear to assess fairly, say so in "limitations" instead of guessing.



Return JSON in exactly this structure:

{

&#x20; "overall\_score": <integer 0-10>,

&#x20; "score\_rationale": "<one sentence explaining the score>",

&#x20; "strengths": \["<point 1>", "<point 2>", "<point 3>"],

&#x20; "weaknesses": \["<point 1>", "<point 2>"],

&#x20; "suggestions": \["<point 1>", "<point 2>", "<point 3>"],

&#x20; "limitations": "<note any uncertainty due to missing/unclear resume info, or empty string if none>"

}



Resume:

{resume\_text}



\## Proposed JSON Output Schema



| Field           | Type            | Description                                      |

|-----------------|-----------------|---------------------------------------------------|

| overall\_score   | integer (0-10)  | Overall resume quality score                      |

| score\_rationale | string          | Short explanation for the score                   |

| strengths       | array of string | 2-4 specific strong points found in the resume    |

| weaknesses      | array of string | 1-3 specific weak points found in the resume      |

| suggestions     | array of string | 2-3 actionable improvement suggestions            |

| limitations     | string          | Notes if resume was too short/unclear to assess   |



\## Why This Is Better Than the Current Prompt

1\. Structured JSON instead of free text → frontend can reliably display fields instead of parsing raw text

2\. score\_rationale added → makes the score explainable, not just a number

3\. limitations field added → prevents Gemini from guessing on incomplete resumes

4\. Explicit instruction against inventing information → reduces hallucination risk



\## Future Extension (Not in v2)

\- Add job\_description parameter and matched\_requirements / missing\_requirements fields

&#x20; once the app supports uploading a job description, matching the CLI concept from

&#x20; the AI\_Resume\_Scanner\_Overview reference document.

