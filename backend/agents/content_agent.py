from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from knowledge_base import get_knowledge_base
from agents.prompt_library import content_agent_instructions
from agents.research_tools import search_web, discover_copy_trends, benchmark_angle_scan

def get_content_agent(user_id: str = "default"):
    """
    Returns the Content Agent specialized in writing and editing.
    It uses the Knowledge Base to retrieve user style/voice.
    """
    kb = get_knowledge_base()
    
    agent = Agent(
        model=OpenAIChat(id="gpt-4o-mini"),
        user_id=user_id,
        description="Você é um Editor e Criador de Conteúdo de IA especialista.",
        instructions=content_agent_instructions(),
        tools=[DuckDuckGoTools(), search_web, discover_copy_trends, benchmark_angle_scan],
        knowledge=kb,
        knowledge_filters={"user_id": user_id} if kb is not None else None,
        search_knowledge=kb is not None, # Only enable if KB is valid
        markdown=True,
        show_tool_calls=False,
    )
    return agent
