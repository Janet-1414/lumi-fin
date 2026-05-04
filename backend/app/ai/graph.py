"""
LangGraph agent graph definition for Lumi's AI chat feature.
Uses OpenAI (ChatOpenAI) as the underlying LLM.
The graph implements a ReAct-style agent with access to the user's financial tools.
"""
from typing import Annotated, TypedDict, Sequence
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.messages import trim_messages
from app.config import settings
import operator


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_id: str
    first_name: str
    currency: str
    country: str


def create_lumi_graph(tools: list):
    """
    Build the LangGraph state machine for Lumi's chat agent.

    Graph structure:
    START → agent_node → (tool_node if tool_calls exist, else END)
    tool_node → agent_node (loop until no more tool calls)
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL_HEAVY,
        temperature=0.7,
        streaming=True,
        api_key=settings.OPENAI_API_KEY,
    )

    # Bind tools to the LLM so it can call them
    llm_with_tools = llm.bind_tools(tools)

    async def agent_node(state: AgentState) -> dict:
        """
        Core agent node: sends messages to OpenAI with tool access.
        The system prompt is injected here with the user's personal context.
        """
        from app.ai.prompts import get_chat_system_prompt

        system_prompt = get_chat_system_prompt(
            first_name=state["first_name"],
            currency=state["currency"],
            country=state["country"],
        )

        # Trim message history to avoid hitting context limits
        trimmed = trim_messages(
            state["messages"],
            max_tokens=8000,
            strategy="last",
            token_counter=llm,
            include_system=False,
        )

        messages_to_send = [SystemMessage(content=system_prompt)] + list(trimmed)
        response = await llm_with_tools.ainvoke(messages_to_send)
        return {"messages": [response]}

    def should_continue(state: AgentState) -> str:
        """
        Routing function: if the last message has tool calls, go to tool_node.
        Otherwise, end the graph.
        """
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tool_node"
        return END

    # Build the graph
    tool_node = ToolNode(tools)
    graph = StateGraph(AgentState)

    graph.add_node("agent_node", agent_node)
    graph.add_node("tool_node", tool_node)

    graph.set_entry_point("agent_node")
    graph.add_conditional_edges("agent_node", should_continue, {"tool_node": "tool_node", END: END})
    graph.add_edge("tool_node", "agent_node")

    return graph.compile()
