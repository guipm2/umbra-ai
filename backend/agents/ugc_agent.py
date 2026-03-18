from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os
from agents.prompt_library import ugc_agent_instructions
from agents.research_tools import search_web, discover_copy_trends, benchmark_angle_scan

load_dotenv()

def get_ugc_agent():
    """
    Returns an Agent specialized in creating viral video scripts (UGC).
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="Você é um Roteirista Viral de classe mundial para TikTok e Reels.",
        instructions=ugc_agent_instructions(),
        tools=[search_web, discover_copy_trends, benchmark_angle_scan],
        markdown=False,
    )
