from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from datetime import datetime
from agents.prompt_library import analytics_agent_instructions
from agents.research_tools import search_web, discover_copy_trends, benchmark_angle_scan

def get_analytics_agent():
    """
    Returns the Analytics Agent specialized in research and data analysis.
    """
    # Get current date for context
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"), # Upgraded to gpt-4o for better research capabilities
        description="Você é um Analista de Dados e Pesquisador de Mercado Senior.",
        instructions=analytics_agent_instructions(current_date=current_date),
        tools=[DuckDuckGoTools(), search_web, discover_copy_trends, benchmark_angle_scan],
        markdown=True
    )
    return agent
