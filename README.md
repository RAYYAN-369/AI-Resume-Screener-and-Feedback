# 🤖 AI Resume Screener & Feedback

An AI-powered Resume Screening System that analyzes resumes against a Job Description (JD), calculates an ATS compatibility score, identifies matched and missing skills, and generates personalized resume feedback using a locally hosted Large Language Model (LLM) through Ollama.

---

# 📌 Overview

The **AI Resume Screener & Feedback** project helps job seekers optimize their resumes before applying for jobs.

The system compares a candidate's resume with a Job Description and provides intelligent feedback to improve the chances of passing Applicant Tracking Systems (ATS) and technical recruitment screening.

This project was developed as part of the **AI & Generative AI Fellowship**.

---

# ✨ Features

- 📄 Upload Resume (PDF/DOCX)
- 📋 Upload Job Description (PDF/DOCX)
- ✍️ Paste Job Description Text
- 🤖 AI Resume Analysis
- 🎯 ATS Match Score
- 📊 Overall Resume Score
- ✅ Matched Skills Detection
- ❌ Missing Skills Detection
- 💡 Resume Summary
- 💪 Strengths & Weaknesses
- 📝 Grammar Feedback
- 🎨 Formatting Suggestions
- 🎓 Education Feedback
- 🚀 Project Feedback
- 🎤 Interview Readiness
- 📈 Resume Improvement Suggestions
- 🔒 Secure File Handling
- 💻 Responsive User Interface
- 🧠 Local AI using Ollama (No Paid API Required)

---

# 🛠 Tech Stack

## Backend

- Python
- FastAPI
- Uvicorn

## Frontend

- HTML5
- CSS3
- JavaScript

## AI

- Ollama
- Qwen2.5:1.5B or llama3.2:3b (Configurable)
- Prompt Engineering

## Libraries

- PyPDF
- python-docx
- Ollama Python SDK

## Version Control

- Git
- GitHub

---

# 📂 Project Structure

```text
AI-Resume-Screener-and-Feedback/
│
├── backend/
│   │
│   ├── app/
│   │   ├── config.py
│   │   ├── routes/
│   │   │   └── upload.py
│   │   ├── services/
│   │   │   ├── ats_service.py
│   │   │   ├── extractor.py
│   │   │   ├── ollama_service.py
│   │   │   └── prompt_builder.py
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── uploads/
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── images/
|   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │
│   └── templates/
│       ├── upload.html
|       ├── index.html
│       └── result.html
│
├── README.md
├── LICENSE
└── .gitignore
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/RAYYAN-369/AI-Resume-Screener-and-Feedback.git
```

---

## 2. Navigate to Project

```bash
cd AI-Resume-Screener-and-Feedback
```

---

## 3. Create Virtual Environment

### Windows

```bash
python -m venv .venv
```

Activate

```bash
.venv\Scripts\activate
```

---

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🤖 Install Ollama

Download Ollama from:

https://ollama.com/download

After installation pull the model:

```bash
ollama pull qwen2.5:1.5b
ollama pull llama3.2:3b
```

Verify installation:

```bash
ollama list
```

---

# ⚙ Configuration

Update your `config.py` file:

```python
OLLAMA_MODEL = "qwen2.5:1.5b" and "llama3.2:3b"
OLLAMA_HOST = "http://localhost:11434"
```

---

# ▶ Run the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Open your browser:

```
http://127.0.0.1:8000
```

---

# 📁 Supported File Formats

## Resume

- PDF
- DOCX

## Job Description

- PDF
- DOCX
- Plain Text

---

# 🧠 AI Analysis Includes

The AI generates:

- ATS Match Score
- Overall Resume Score
- Resume Summary
- Matched Skills
- Missing Skills
- Strengths
- Weaknesses
- Grammar Feedback
- Formatting Feedback
- Experience Feedback
- Education Feedback
- Project Feedback
- Keyword Recommendations
- Interview Readiness
- Resume Improvement Suggestions

---

# ⚙ How It Works

```text
                  Resume
                     │
                     ▼
            Resume Text Extraction
                     │
                     ▼
            Upload Job Description
                     │
                     ▼
              ATS Skill Matching
                     │
                     ▼
          Generate AI Prompt
                     │
                     ▼
          Ollama (Qwen2.5:1.5B)
                     │
                     ▼
          AI Resume Analysis
                     │
                     ▼
            Display Results
```

---

# 📌 API Endpoint

### Analyze Resume

```
POST /upload
```

### Form Data

| Field | Type |
|---------|------|
| resume | PDF / DOCX |
| job_description | Text |
| job_description_file | PDF / DOCX |

---

# 📈 Future Improvements

- Semantic ATS Matching using Sentence Transformers
- Resume Ranking System
- Multi Resume Comparison
- Cover Letter Generator
- AI Interview Question Generator
- Resume Templates
- User Authentication
- Dashboard Analytics
- Resume History
- Export Report as PDF
- Multi-language Support

---

# 👥 Team

| Team Member | Role |
|--------------|------|
| **Muhammad Rayyan Bhatti** | Team Leader & Full Stack Developer |
| **Asfaar Maham Ghazi** | Frontend Developer |
| **Zain Ali Haider** | Backend Developer |
| **Huzaifa Haider Khan** | AI & Documentation |

---

# 📌 Project Management

The project follows a Git-based workflow.

### Branches

- `main` — Stable Production Code
- `dev` — Integration Branch
- `feature/frontend`
- `feature/backend`
- `feature/ai`

Development workflow:

1. Create Feature Branch
2. Commit Changes
3. Push Branch
4. Open Pull Request
5. Review
6. Merge into `dev`
7. Merge into `main`

---

# 🔒 Security

- Uploaded files are processed locally.
- No external AI APIs are required.
- Environment variables are stored in `.env`.
- Sensitive files are ignored using `.gitignore`.

---

# 📸 Screenshots

Add screenshots here after completing the project.

### Upload Page

```
/docs/screenshots/upload-page.png
```

### Result Page

```
/docs/screenshots/result-page.png
```

---

# 🎥 Demo

Add your project demo video or GIF here.

Example:

```
docs/demo.mp4
```

or

```
https://youtu.be/your-demo-video
```

---

# 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

# 📄 License

This project is developed for educational purposes as part of the **AI & Generative AI Fellowship**.

---

# 📬 Contact

## Muhammad Rayyan Bhatti

**GitHub**

https://github.com/RAYYAN-369

**LinkedIn**

https://www.linkedin.com/in/muhammad-rayyan-bhatti-145956285/

---

⭐ If you found this project useful, consider giving it a **Star** on GitHub.