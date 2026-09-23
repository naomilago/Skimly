from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
from langchain_core.documents import Document

from typing import (
    Annotated,
    TypedDict
)

class GraphState(TypedDict):
    file_path: str
    raw_text: list[Document]
    chunks: list[Document]
    summary: str
    question: str
    answer: str
    messages: Annotated[list[BaseMessage], add_messages]