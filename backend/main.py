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
    return FileResponse("../frontend/templates/upload.html")

@app.get("/result.html")
def result():
    return FileResponse("../frontend/templates/result.html")