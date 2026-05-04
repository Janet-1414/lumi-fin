"""
Lumi Chat Agent — powered by LangGraph + OpenAI.
Handles streaming responses and conversation history for the AI chat feature.
"""
from langchain_core.messages import HumanMessage, AIMessage
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.graph import create_lumi_graph
from app.ai.tools import create_financial_tools
from app.models.user import User
from typing import AsyncGenerator
import uuid
import json


class LumiChatAgent:
    """
    Stateless agent runner — conversation history is passed in from the frontend
    and the full updated history is returned. No server-side session state needed.
    """

    def __init__(self, db: AsyncSession, user: User):
        self.db = db
        self.user = user
        self.tools = create_financial_tools(db, user.id, user.currency_code)
        self.graph = create_lumi_graph(self.tools)

    def _build_messages(self, conversation_history: list[dict], new_message: str) -> list:
        messages = []
        for msg in conversation_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=new_message))
        return messages

    async def chat(self, message: str, conversation_history: list[dict]) -> str:
        """Non-streaming chat — returns full response string."""
        messages = self._build_messages(conversation_history, message)

        initial_state = {
            "messages": messages,
            "user_id": str(self.user.id),
            "first_name": self.user.first_name,
            "currency": self.user.currency_code,
            "country": self.user.country,
        }

        final_state = await self.graph.ainvoke(initial_state)
        last_message = final_state["messages"][-1]
        return last_message.content

    async def stream_chat(self, message: str, conversation_history: list[dict]) -> AsyncGenerator[str, None]:
        """
        Streaming chat — yields Server-Sent Event chunks.
        The frontend receives token-by-token streaming via SSE.
        """
        messages = self._build_messages(conversation_history, message)

        initial_state = {
            "messages": messages,
            "user_id": str(self.user.id),
            "first_name": self.user.first_name,
            "currency": self.user.currency_code,
            "country": self.user.country,
        }

        async for event in self.graph.astream_events(initial_state, version="v2"):
            event_name = event.get("event", "")
            # Stream only the AI text tokens, not tool call chunks
            if event_name == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    yield f"data: {json.dumps({'token': chunk.content})}\n\n"

        yield "data: [DONE]\n\n"
