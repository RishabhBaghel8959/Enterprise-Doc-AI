import os
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings

BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DB_PATH = "vector_db"


def save_db(docs):
    db = FAISS.from_documents(docs, get_embeddings())
    db.save_local(DB_PATH)

def load_db():
    if not os.path.exists(DB_PATH):
        return None
    return FAISS.load_local(DB_PATH, get_embeddings(), allow_dangerous_deserialization=True)

def get_embeddings():
    return OllamaEmbeddings(
        model="nomic-embed-text",
        base_url=BASE_URL
    )