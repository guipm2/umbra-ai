from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os
from agents.prompt_library import message_agent_instructions
from agents.research_tools import search_web, discover_copy_trends, benchmark_angle_scan

load_dotenv()

def get_message_agent():
    """
    Returns an Agent specialized in short Direct Messages and WhatsApp scripts.
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="Você é um especialista em Marketing de Conversação e Scripts de Vendas.",
        instructions=message_agent_instructions(),
        tools=[search_web, discover_copy_trends, benchmark_angle_scan],
        markdown=False,
    )
