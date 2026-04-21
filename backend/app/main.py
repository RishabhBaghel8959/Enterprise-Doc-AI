from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import query, ingest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router, prefix="/query")
app.include_router(ingest.router, prefix="/ingest")

@app.get("/")
def home():
    return {"msg": "Backend running 🚀"}
