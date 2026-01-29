from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os

load_dotenv()

def get_message_agent():
    """
    Returns an Agent specialized in short Direct Messages and WhatsApp scripts.
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="You are an expert in Conversational Marketing and Sales Scripts.",
        instructions=[
            "Your goal is to write short, conversational messages for WhatsApp, DM, or SMS.",
            "You will receive a Context/Goal (e.g., Cold Outreach, Follow-up, Recovery) and Tone of Voice.",
            "You MUST return the output in strict JSON format with the following structure:",
            "{",
            "  \"variations\": [",
            "    { \"label\": \"Direct Approach\", \"text\": \"The actual message content...\" },",
            "    { \"label\": \"Soft Approach\", \"text\": \"The actual message content...\" },",
            "    { \"label\": \"Urgency Approach\", \"text\": \"The actual message content...\" }",
            "  ]",
            "}",
            "Messages must be ready to send. No placeholders like '[Insert Name]' unless absolutely necessary.",
            "Include emojis where appropriate but don't overdo it."
        ]
    )
