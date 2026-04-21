from langchain_community.chat_models import ChatOllama

from backend.app.services.vector_store import BASE_URL

llm = ChatOllama(
    model="llama3",
    base_url=BASE_URL,
    streaming=True
)