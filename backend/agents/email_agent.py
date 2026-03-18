from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os
from agents.prompt_library import email_agent_instructions
from agents.research_tools import search_web, discover_copy_trends, benchmark_angle_scan

load_dotenv()

def get_email_agent():
    """
    Returns an Agent specialized in writing Email Marketing sequences.
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="Você é um Copywriter especialista em Email Marketing.",
        instructions=email_agent_instructions(),
        tools=[search_web, discover_copy_trends, benchmark_angle_scan],
        markdown=False,
    )
