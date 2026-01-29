from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os

load_dotenv()

def get_static_ad_agent():
    """
    Returns an Agent specialized in creating copy for Static Ads (Facebook/Instagram/Display).
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="You are a world-class Copywriter for High-Converting Static Ads.",
        instructions=[
            "Your goal is to create punchy, high-impact copy for visual ads (banners, Instagram feed, Facebook feed).",
            "You will receive a Product Name, Target Audience, and an Offer/Goal.",
            "You MUST return the output in strict JSON format with the following structure:",
            "{",
            "  \"headline\": \"Attention grabbing headline (max 50 chars)\",",
            "  \"body\": \"Persuasive ad text focus on benefits (max 280 chars)\",",
            "  \"cta\": \"Strong Call to Action\",",
            "  \"image_suggestion\": \"Detailed description of the visual to accompany this text\"",
            "}",
            "Keep the tone consistent with the brand but focused on performance/conversion.",
            "The image suggestion should be descriptive enough for a designer or AI image generator."
        ]
    )
