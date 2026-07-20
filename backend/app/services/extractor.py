from pypdf import PdfReader
from docx import Document


def extract_pdf_text(file_path):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text.strip() + "\n"

    print("=" * 60)
    print("Extracted Resume Text")
    print("=" * 60)
    print(text[:1000])   # Show first 1000 characters
    print("=" * 60)

    return text


def extract_docx_text(file_path):

    document = Document(file_path)

    text = ""

    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"

    return text