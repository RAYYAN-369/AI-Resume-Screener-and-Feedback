import re

# Common technical skills
KNOWN_SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "html",
    "css",
    "react",
    "node.js",
    "express",
    "django",
    "flask",
    "fastapi",
    "mongodb",
    "mysql",
    "postgresql",
    "sql",
    "nosql",
    "git",
    "github",
    "docker",
    "kubernetes",
    "linux",
    "aws",
    "azure",
    "gcp",
    "cloud computing",
    "machine learning",
    "artificial intelligence",
    "deep learning",
    "data science",
    "data structures",
    "algorithms",
    "oop",
    "object oriented programming",
    "rest api",
    "api",
    "backend",
    "frontend",
    "full stack",
    "problem solving"
]


def normalize(text):
    text = text.lower()

    text = text.replace("artificial intelligence", "ai")
    text = text.replace("machine learning", "ml")
    text = text.replace("object oriented programming", "oop")
    text = text.replace("nodejs", "node.js")

    return text


def calculate_match(resume_text, job_description):

    resume = normalize(resume_text)
    job = normalize(job_description)

    matched = []
    missing = []

    for skill in KNOWN_SKILLS:

        skill_normalized = normalize(skill)

        job_has = skill_normalized in job
        resume_has = skill_normalized in resume

        if job_has and resume_has:
            matched.append(skill)

        elif job_has:
            missing.append(skill)

    total = len(matched) + len(missing)

    if total == 0:
        score = 0
    else:
        score = round((len(matched) / total) * 100)

    return {

        "ats_score": score,

        "matched_skills": sorted(list(set(matched))),

        "missing_skills": sorted(list(set(missing)))

    }