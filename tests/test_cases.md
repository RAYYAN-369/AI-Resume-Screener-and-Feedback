\# AI Resume Screener — Test Cases (AI Response Validation)



These test cases validate the Gemini response (analyze\_resume function) against

the proposed v2 JSON schema. Each case should be tested manually first, then

converted to automated pytest cases once the JSON output is implemented in code.



\---



\## TC-01: Strong Resume Match

\*\*Input:\*\* A well-written resume with clear skills, quantified achievements, and relevant experience.

\*\*Expected Output:\*\*

\- overall\_score: 7-10

\- strengths: 3+ specific points referencing actual resume content

\- weaknesses: minor or stylistic only

\- limitations: empty string



\---



\## TC-02: Average / Partial Resume

\*\*Input:\*\* A resume with some relevant experience but vague descriptions or missing metrics.

\*\*Expected Output:\*\*

\- overall\_score: 4-6

\- weaknesses: should call out vagueness or missing quantification

\- suggestions: should be specific and actionable, not generic



\---



\## TC-03: Weak Resume

\*\*Input:\*\* A very short resume (e.g. 2-3 lines, minimal detail).

\*\*Expected Output:\*\*

\- overall\_score: 0-3

\- limitations: should be non-empty, explaining that resume is too short/unclear to assess fully

\- Gemini should NOT invent skills or experience not present in the text



\---



\## TC-04: Empty Resume Text

\*\*Input:\*\* Empty string or whitespace-only text.

\*\*Expected Output:\*\*

\- Backend should reject BEFORE calling Gemini (validation error, not an API call)

\- Error message should be clear, e.g. "Resume text is empty or could not be extracted."



\---



\## TC-05: Malformed / Corrupted File

\*\*Input:\*\* A .docx or .pdf file that is corrupted or unreadable.

\*\*Expected Output:\*\*

\- File extraction step should fail gracefully

\- Error message should be clear, not a raw Python traceback

\- Gemini should never be called with broken/garbage text



\---



\## TC-06: Gemini Returns Invalid JSON

\*\*Input:\*\* Simulate/force a malformed JSON response from Gemini (e.g. missing a field, extra text outside JSON).

\*\*Expected Output:\*\*

\- Response should be rejected by validation, NOT shown to the user as a valid result

\- A clear internal error should be logged



\---



\## TC-07: Rate Limit / API Error (429)

\*\*Input:\*\* Simulate a 429 rate-limit response from Gemini API.

\*\*Expected Output:\*\*

\- Current code: caught by try/except, returns "Gemini Error: ..." message

\- Recommended improvement: retry with exponential backoff (1-2 retries) before failing



\---



\## TC-08: Very Long Resume

\*\*Input:\*\* A resume with excessive length (e.g. 5+ pages of text).

\*\*Expected Output:\*\*

\- Should not crash or time out

\- Score and feedback should still focus on most relevant/recent content



\---



\## Status Tracking



| Test Case | Status | Notes |

|-----------|--------|-------|

| TC-01     | PASSED | Ran with real Gemini output. Score: 8/10. Strengths, weaknesses, and suggestions were specific and grounded in resume content. See run below. |

| TC-02     | Not yet run | |

| TC-03     | PASSED | Ran with real Gemini output. Score: 1/10. Correctly identified missing contact info, informal phrasing, lack of detail. No hallucinated skills. |

| TC-04     | Not yet run | |

| TC-05     | Not yet run | |

| TC-06     | PASSED | Validated with ai/response_validator.py. Confirmed: (1) valid JSON matching schema is accepted, (2) malformed JSON is correctly rejected with clear error, (3) out-of-range overall_score is correctly rejected via Pydantic validator. |

| TC-07     | PASSED (as failure case) | Confirmed real 429 RESOURCE\_EXHAUSTED error when using gemini-2.0-flash on free tier (limit: 0). Current code catches this via try/except and returns "Gemini Error: ..." but does NOT retry. Recommend adding retry logic. |

| TC-08     | Not yet run | |



\## Real Test Run Evidence



\### TC-01: Strong Resume — Actual Gemini Output (model: gemini-flash-latest)

Overall Score: 8/10

Strengths:

\- Excellent use of quantifiable metrics (e.g., "reducing report generation time by 40%")

\- Demonstrates clear career progression from Junior Developer to Software Engineer with leadership

\- Clean, concise layout with relevant, modern tech stack

Weaknesses:

\- Lacks detail on how results were achieved (methodologies, tools, services used)

\- Missing contact information and a professional summary

Suggestions:

\- Add a 2-3 sentence Professional Summary at the top

\- Elaborate on technical details behind achievements

\- Clarify the mobile app framework used



\### TC-03: Weak Resume — Actual Gemini Output (model: gemini-flash-latest)

Overall Score: 1/10

Strengths:

\- Clear and direct statement of intent

\- Identifies general area of interest

\- Extremely concise

Weaknesses:

\- Lacks contact information and full name

\- Informal, unprofessional, lacks detail on work history/education/skills

Suggestions:

\- Rebuild using a standard professional resume template

\- Elaborate on specific skills instead of "know computers"

\- Use action verbs and professional language



\## Important Finding — Model Availability Bug

During testing, "gemini-2.0-flash" (the model currently hardcoded in

backend/app/services/gemini\_service.py) returned a 429 RESOURCE\_EXHAUSTED

error with limit: 0 on the free tier, even on a brand-new Google Cloud

project. This is NOT a temporary rate limit — it appears Google has

removed free-tier quota for this specific model.



Switching the model string to "gemini-flash-latest" resolved the issue

immediately and produced correct, well-structured output (see evidence

above). Recommend the backend team update the model name in

gemini\_service.py from "gemini-2.0-flash" to "gemini-flash-latest".



Additionally, the import `from google import genai` requires the

`google-genai` package, which is missing from backend/requirements.txt

(only `google-generativeai`, the older SDK, is listed). This causes an

ImportError on a clean install. Recommend adding `google-genai` to

requirements.txt.

## Validation Code

See ai/response_validator.py — implements Pydantic-based validation of
Gemini's JSON response against the schema defined in ai/prompt_design.md.
Run manually with: python ai/response_validator.py

Test results (see TC-06):
- Valid JSON matching schema -> accepted
- Malformed JSON -> rejected with clear error, not shown to user
- Out-of-range score (e.g. 55/10) -> rejected via schema validation

