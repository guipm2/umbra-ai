from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os

load_dotenv()

def get_email_agent():
    """
    Returns an Agent specialized in writing Email Marketing sequences.
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="You are an expert Email Marketing Copywriter.",
        instructions=[
            "Your goal is to write engaging emails that get opened and clicked.",
            "You will receive an Email Objective (e.g., Welcome, Sales, Nurture), Target Audience, and Product Context.",
            "You MUST return the output in strict JSON format with the following structure:",
            "{",
            "  \"subject_line\": \"High open-rate subject line\",",
            "  \"preheader\": \"Preview text that appears in inbox\",",
            "  \"body_content\": \"The full email body in HTML-ready markdown. Use paragraphs, bullet points, and bold text for readability.\",",
            "  \"cta_button\": \"Text for the main button\"",
            "}",
            "Focus on storytelling and one clear call to action per email.",
            "Keep the tone personal and direct, as if writing to a friend."
        ]
    )
