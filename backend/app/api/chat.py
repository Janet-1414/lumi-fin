from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_pro_user
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.agent import LumiChatAgent

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    """Non-streaming chat endpoint."""
    agent = LumiChatAgent(db, current_user)
    response_text = await agent.chat(data.message, [m.model_dump() for m in data.conversation_history])

    updated_history = list(data.conversation_history) + [
        {"role": "user", "content": data.message},
        {"role": "assistant", "content": response_text},
    ]

    return ChatResponse(
        response=response_text,
        conversation_history=[{"role": m["role"], "content": m["content"]} for m in updated_history],
    )


@router.post("/stream")
async def chat_stream(
    data: ChatRequest,
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Streaming chat endpoint using Server-Sent Events (SSE).
    The frontend connects to this and receives token-by-token streaming
    from LangGraph + OpenAI.
    """
    agent = LumiChatAgent(db, current_user)

    async def generate():
        async for chunk in agent.stream_chat(
            data.message,
            [m.model_dump() for m in data.conversation_history],
        ):
            yield chunk

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
