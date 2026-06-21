from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import query, ingest, auth, chat_history
from app.database import init_db

app = FastAPI()

# Initialize database
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(query.router, prefix="/query", tags=["query"])
app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
app.include_router(chat_history.router, prefix="/chat", tags=["chat"])

@app.get("/")
def home():
    return {"msg": "Backend running 🚀"}
