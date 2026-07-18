import os
from dotenv import load_dotenv

load_dotenv()

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")