def build_prompt(resume_text, job_description):
    return f"""
You are an expert ATS (Applicant Tracking System) and HR Recruiter.

Analyze the following resume against the job description.

Return ONLY valid JSON.

Format:

{{
    "overall_score": 0,
    "ats_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "strengths": [],
    "weaknesses": [],
    "suggestions": []
}}

Resume:

{resume_text}

Job Description:

{job_description}
"""