from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os

load_dotenv()

def get_ugc_agent():
    """
    Returns an Agent specialized in creating viral video scripts (UGC).
    """
    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        description="Você é um Roteirista Viral de classe mundial para TikTok e Reels.",
        instructions=[
            "Seu objetivo é criar roteiros UGC (Conteúdo Gerado pelo Usuário) altamente engajadores e autênticos.",
            "Você receberá um Nome de Produto, Público, Persona de Especialista e Estilo de Vídeo.",
            "Você DEVE retornar a saída em formato JSON estrito com a seguinte estrutura:",
            "{",
            "  \"title\": \"Título chamativo\",",
            "  \"hook\": \"A primeira frase para chamar a atenção\",",
            "  \"scenes\": [",
            "    { \"visual\": \"Descrição do que é visto\", \"audio\": \"O que é dito\" }",
            "  ]",
            "}",
            "O conteúdo deve ser conversacional, evitando jargão de marketing. Foque em emoções e benefícios.",
            "Use a coluna visual para dar direção sobre ângulos de câmera, iluminação e movimento."
        ]
    )
