import os
from fastapi import APIRouter, UploadFile, File
from app.utils.loader import load_pdf
from app.utils.chunking import chunk
from app.services.vector_store import save_db, load_db

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    os.makedirs("data", exist_ok=True)
    path = f"data/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    docs = load_pdf(path)
    chunks = chunk(docs)

    db = load_db()
    if db:
        db.add_documents(chunks)
        db.save_local("vector_db")
    else:
        save_db(chunks)

    return {"msg": "Uploaded"}
