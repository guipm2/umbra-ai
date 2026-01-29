from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from knowledge_base import get_knowledge_base

def get_content_agent(user_id: str = "default"):
    """
    Returns the Content Agent specialized in writing and editing.
    It uses the Knowledge Base to retrieve user style/voice.
    """
    kb = get_knowledge_base()
    
    agent = Agent(
        model=OpenAIChat(id="gpt-4o-mini"),
        description="You are an expert AI Editor and Content Creator.",
        instructions=[
            "Your goal is to generate high-quality text based on user requests.",
            "You MUST adapt your writing style to the User's Voice found in the knowledge base.",
            "If you find context in the knowledge base, prioritize it.",
            "Use the DuckDuckGo tool to search for real-time information if the user mentions specific recent events or facts you don't know.",
            "Return ONLY the generated content, ready to be inserted into the editor.",
            "Do not add conversational fluff like 'Here is the post:'. Just the content."
        ],
        tools=[DuckDuckGoTools()],
        knowledge=kb,
        search_knowledge=kb is not None, # Only enable if KB is valid
        markdown=True,
        show_tool_calls=True,
    )
    return agent
