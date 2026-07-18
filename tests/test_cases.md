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



| Test Case | Status      | Notes |

|-----------|-------------|-------|

| TC-01     | Not yet run |       |

| TC-02     | Not yet run |       |

| TC-03     | Not yet run |       |

| TC-04     | Not yet run |       |

| TC-05     | Not yet run |       |

| TC-06     | Not yet run |       |

| TC-07     | Not yet run |       |

| TC-08     | Not yet run |       |

