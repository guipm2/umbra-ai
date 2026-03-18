from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os
import json
from agents.prompt_library import router_knowledge_instructions

# Import specialized agents (or their factories)
from agents.content_agent import get_content_agent
from agents.analytics_agent import get_analytics_agent
from agents.ugc_agent import get_ugc_agent
from agents.static_ad_agent import get_static_ad_agent
from agents.email_agent import get_email_agent
from agents.message_agent import get_message_agent
from knowledge_base import get_knowledge_base

load_dotenv()

def get_agent(user_id: str = "default"):
    """
    Returns the Interceptor Agent (Router) for the Umbra AI platform.
    This agent acts as the main entry point for the chat interface.
    """
    
    # 1. Platform knowledge and routing instructions
    platform_knowledge = "\n".join(router_knowledge_instructions())

    # 2. Tool Definitions
    # Wrappers around other agents to allow the Router to call them
    def run_content_agent(prompt: str) -> str:
        """Call this to generate social media posts, captions, or articles."""
        agent = get_content_agent(user_id=user_id)
        # We run the specialist agent and return its response string
        response = agent.run(prompt)
        return response.content

    def run_analytics_agent(prompt: str) -> str:
        """Call this to perform web searches or analyze market data."""
        agent = get_analytics_agent()
        response = agent.run(prompt)
        return response.content
    
    def run_ugc_agent(prompt: str) -> str:
        """Call this to generate UGC video scripts (TikTok/Reels)."""
        agent = get_ugc_agent()
        response = agent.run(prompt)
        return response.content

    def run_static_ad_agent(prompt: str) -> str:
        """Call this to generate static ad copy and visual briefing."""
        agent = get_static_ad_agent()
        response = agent.run(prompt)
        return response.content

    def run_email_agent(prompt: str) -> str:
        """Call this to generate email marketing content."""
        agent = get_email_agent()
        response = agent.run(prompt)
        return response.content

    def run_message_agent(prompt: str) -> str:
        """Call this to generate direct message scripts for WhatsApp/DM/SMS."""
        agent = get_message_agent()
        response = agent.run(prompt)
        return response.content

    # 3. Initialize the Router Agent
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"), # Recommend GPT-4o for routing intelligence
        description="Você é o Agente Interceptador e Router da Umbra AI.",
        instructions=[platform_knowledge],
        tools=[
            run_content_agent,
            run_analytics_agent,
            run_ugc_agent,
            run_static_ad_agent,
            run_email_agent,
            run_message_agent,
        ],
        markdown=True
    )
    
    return agent
