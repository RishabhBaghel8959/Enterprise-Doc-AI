from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.services.vector_store import BASE_URL, load_db
from app.models import ChatMessage, ChatSession
from app.database import get_db
from app.security import decode_token
from langchain_ollama import ChatOllama

router = APIRouter()

class Req(BaseModel):
    query: str
    session_id: Optional[int] = None

def stream(query, retriever, session_id, user_id, db):
    llm = ChatOllama(
        model="llama3",
        base_url=BASE_URL,
        streaming=True
    )

    docs = retriever.invoke(query)
    if docs is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve documents")

    context = "\n".join([d.page_content for d in docs])

    prompt = f"""
    Answer clearly using the context.

    Context:
    {context}

    Question:
    {query}
    """

    full_response = ""
    for chunk in llm.stream(prompt):
        if chunk.content:
            full_response += chunk.content
            yield chunk.content
    
    # Save assistant message to database
    if session_id and user_id:
        try:
            message = ChatMessage(
                session_id=session_id,
                user_id=user_id,
                role="assistant",
                content=full_response
            )
            db.add(message)
            
            # Update session title if it's the first message
            session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if session and session.title == "New Chat":
                session.title = query[:50]
            
            db.commit()
        except Exception as e:
            print(f"Error saving message: {e}")

@router.post("/ask-stream")
async def ask_stream(
    req: Req, 
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    # Extract token and decode user_id
    user_id = None
    if authorization:
        token = authorization.replace("Bearer ", "")
        user_id = decode_token(token)
    
    db_instance = load_db()
    if not db_instance:
        raise HTTPException(status_code=400, detail="No documents available. Please upload a PDF first.")
    
    retriever = db_instance.as_retriever()
    
    return StreamingResponse(
        stream(req.query, retriever, req.session_id, user_id, db), 
        media_type="text/plain"
    )
