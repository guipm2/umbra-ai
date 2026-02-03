from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from datetime import datetime

def get_analytics_agent():
    """
    Returns the Analytics Agent specialized in research and data analysis.
    """
    # Get current date for context
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"), # Upgraded to gpt-4o for better research capabilities
        description="Você é um Analista de Dados e Pesquisador de Mercado Senior.",
        instructions=[
            f"A data de hoje é: {current_date}. Você DEVE usar esta data como referência para 'hoje', 'ontem', etc.",
            "Sua principal função é buscar informações atualizadas na web para responder perguntas sobre mercado, tendências e notícias.",
            "Sempre que perguntado sobre fatos recentes ou cotações, use a ferramenta de busca.",
            "Seja direto e baseie suas respostas em dados encontrados.",
            "Cite as fontes encontradas quando relevante.",
            "Se a informação não for encontrada ou for incerta, informe o usuário claramente."
        ],
        tools=[DuckDuckGoTools()],
        markdown=True,
        show_tool_calls=True
    )
    return agent
