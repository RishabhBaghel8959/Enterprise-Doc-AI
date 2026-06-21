FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir \
    fastapi uvicorn \
    langchain langchain-community langchain-ollama \
    faiss-cpu pypdf redis langgraph \
    sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart pydantic-settings

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]