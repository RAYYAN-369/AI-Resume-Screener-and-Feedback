import re


def calculate_match(resume_text, job_description):
    resume_words = set(
        re.findall(r"\b[a-zA-Z0-9+#.]+\b", resume_text.lower())
    )

    job_words = set(
        re.findall(r"\b[a-zA-Z0-9+#.]+\b", job_description.lower())
    )

    matched = sorted(list(resume_words & job_words))
    missing = sorted(list(job_words - resume_words))

    if len(job_words) == 0:
        score = 0
    else:
        score = int((len(matched) / len(job_words)) * 100)

    return {
        "ats_score": score,
        "matched_skills": matched,
        "missing_skills": missing
    }