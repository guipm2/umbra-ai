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
        description="Você é um especialista em Marketing de Conversação e Scripts de Vendas.",
        instructions=[
            "Seu objetivo é escrever mensagens curtas e conversacionais para WhatsApp, DM ou SMS.",
            "Você receberá um Contexto/Objetivo (ex: Prospecção Fria, Follow-up, Recuperação) e Tom de Voz.",
            "Você DEVE retornar a saída em formato JSON estrito com a seguinte estrutura:",
            "{",
            "  \"variations\": [",
            "    { \"label\": \"Abordagem Direta\", \"text\": \"O conteúdo real da mensagem...\" },",
            "    { \"label\": \"Abordagem Suave\", \"text\": \"O conteúdo real da mensagem...\" },",
            "    { \"label\": \"Abordagem de Urgência\", \"text\": \"O conteúdo real da mensagem...\" }",
            "  ]",
            "}",
            "As mensagens devem estar prontas para enviar. Sem placeholders como '[Inserir Nome]' a menos que absolutamente necessário.",
            "Inclua emojis onde apropriado, mas não exagere."
        ]
    )
