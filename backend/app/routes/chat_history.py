from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models import ChatSession, ChatMessage
from app.security import decode_token

router = APIRouter()

class ChatMessageRequest(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: str
    updated_at: str

class ChatSessionDetailResponse(BaseModel):
    id: int
    title: str
    messages: List[ChatMessageResponse]
    created_at: str


def get_current_user(authorization: str = None) -> int:
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "")
    user_id = decode_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

@router.post("/sessions")
async def create_session(
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    user_id = get_current_user(authorization)
    
    session = ChatSession(user_id=user_id, title="New Chat")
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {"id": session.id}

@router.get("/sessions")
async def list_sessions(
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    user_id = get_current_user(authorization)
    
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(ChatSession.updated_at.desc()).all()
    
    return [
        ChatSessionResponse(
            id=s.id,
            title=s.title,
            created_at=s.created_at.isoformat(),
            updated_at=s.updated_at.isoformat()
        )
        for s in sessions
    ]

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    user_id = get_current_user(authorization)
    
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return ChatSessionDetailResponse(
        id=session.id,
        title=session.title,
        messages=[
            ChatMessageResponse(
                id=m.id,
                role=m.role,
                content=m.content,
                created_at=m.created_at.isoformat()
            )
            for m in session.messages
        ],
        created_at=session.created_at.isoformat()
    )

@router.post("/sessions/{session_id}/messages")
async def add_message(
    session_id: int,
    msg: ChatMessageRequest,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    user_id = get_current_user(authorization)
    
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    message = ChatMessage(
        session_id=session_id,
        user_id=user_id,
        role="user",
        content=msg.content
    )
    db.add(message)
    db.commit()
    
    return {"id": message.id}

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    user_id = get_current_user(authorization)
    
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    
    return {"status": "deleted"}
