from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os

load_dotenv()

def get_agent():
    """
    Returns a basic Agno Agent configured with OpenAI.
    Ensure OPENAI_API_KEY is set in your .env file.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Warning: OPENAI_API_KEY not found in environment variables.")
        # Fallback or error handling could go here
    
    # Initialize the Agent
    # We use a simple instruction to start.
    agent = Agent(
        model=OpenAIChat(id="gpt-4o-mini"),
        description="You are a helpful AI assistant for the Aura AI platform.",
        instructions=["Answer concisely and helpfully."],
        markdown=True
    )
    return agent
