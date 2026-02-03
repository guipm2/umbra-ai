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
        description="Você é um Editor e Criador de Conteúdo de IA especialista.",
        instructions=[
            "Seu objetivo é gerar textos de alta qualidade com base nas solicitações do usuário.",
            "Você DEVE adaptar seu estilo de escrita à Voz do Usuário encontrada na base de conhecimento.",
            "Se encontrar contexto na base de conhecimento, priorize-o.",
            "Use a ferramenta DuckDuckGo para buscar informações na internet em tempo real se o usuário mencionar eventos recentes específicos ou fatos que você não conhece.",
            "Retorne APENAS o conteúdo gerado, pronto para ser inserido no editor.",
            "Não adicione conversas desnecessárias como 'Aqui está o post:'. Apenas o conteúdo."
        ],
        tools=[DuckDuckGoTools()],
        knowledge=kb,
        search_knowledge=kb is not None, # Only enable if KB is valid
        markdown=True,
        show_tool_calls=True,
    )
    return agent
