from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

def get_analytics_agent():
    """
    Returns the Analytics Agent specialized in research and data analysis.
    """
    agent = Agent(
        model=OpenAIChat(id="gpt-4o-mini"),
        description="You are a Data Analyst and Market Researcher.",
        instructions=[
            "You verify facts on the web and analyze metrics.",
            "When asked about trends, search the web first.",
            "Provide concise summaries of your findings.",
        ],
        tools=[DuckDuckGoTools()],
        show_tool_calls=True, # Helpful for debugging
        markdown=True,
    )
    return agent
