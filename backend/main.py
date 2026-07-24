from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes.upload import router as upload_router

app = FastAPI(
    title="AI Resume Screener API",
    version="1.0.0"
)

app.include_router(upload_router)

app.mount(
    "/static",
    StaticFiles(directory="../frontend/static"),
    name="static",
)

@app.get("/")
def home():
    return FileResponse("../frontend/templates/index.html")

@app.get("/upload.html")
def upload_page():
    return FileResponse("../frontend/templates/upload.html")

@app.get("/result.html")
def result():
    return FileResponse("../frontend/templates/result.html")

@app.get("/about.html")
def about_page():
    return FileResponse("../frontend/templates/about.html")

@app.get("/features.html")
def features_page():
    return FileResponse("../frontend/templates/features.html")

@app.get("/contact.html")
def contact_page():
    return FileResponse("../frontend/templates/contact.html")

@app.get("/privacy.html")
def privacy_page():
    return FileResponse("../frontend/templates/privacy.html")

@app.get("/terms.html")
def terms_page():
    return FileResponse("../frontend/templates/terms.html")