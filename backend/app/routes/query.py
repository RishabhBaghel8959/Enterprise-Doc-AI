from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.vector_store import load_db
from langchain_community.chat_models import ChatOllama

router = APIRouter()

class Req(BaseModel):
    query: str

def stream(query, retriever):
    from langchain_community.chat_models import ChatOllama

    llm = ChatOllama(
        model="llama3",
        base_url="http://127.0.0.1:11434",
        streaming=True
    )

    docs = retriever.invoke(query)
    context = "\n".join([d.page_content for d in docs])

    prompt = f"""
    Answer clearly using the context.

    Context:
    {context}

    Question:
    {query}
    """

    for chunk in llm.stream(prompt):
        if chunk.content:   
            yield chunk.content

@router.post("/ask-stream")
async def ask_stream(req: Req):
    db = load_db()
    retriever = db.as_retriever()
    return StreamingResponse(stream(req.query, retriever), media_type="text/plain")
