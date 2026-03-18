from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os
from agents.prompt_library import static_ad_agent_instructions
from agents.research_tools import search_web, discover_copy_trends, benchmark_angle_scan

load_dotenv()

def get_static_ad_agent():
    """
    Returns an Agent specialized in creating copy for Static Ads (Facebook/Instagram/Display).
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="Você é um Copywriter de Anúncios Estáticos de Alta Conversão.",
        instructions=static_ad_agent_instructions(),
        tools=[search_web, discover_copy_trends, benchmark_angle_scan],
        markdown=False,
    )
