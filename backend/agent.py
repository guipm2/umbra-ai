from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
import os
import json

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
    
    # 1. Platform Knowledge Base (Instructions)
    platform_knowledge = """
    # Plataforma Umbra AI - Manual do Agente
    Você é a IA central da Umbra AI. Sua missão é ajudar o usuário a navegar pela plataforma, responder dúvidas e executar tarefas usando os agentes especialistas.

    ## Funcionalidades Principais & Rotas
    
    ### 1. Dashboard (`/dashboard`)
    Visão geral da conta e atalhos.

    ### 2. Estratégia
    - **Produtos** (`/dashboard/products`): Onde o usuário cadastra seus produtos, serviços ou infoprodutos.
    - **Públicos** (`/dashboard/audiences`): Definição dos públicos-alvo e avatares.
    - **Especialistas** (`/dashboard/experts`): Cadastro de personas/autores que assinam o conteúdo.

    ### 3. Criação (Agentes Especialistas)
    - **Copy Center** (`/dashboard/copy-center`):
        - *Função*: Criar posts para redes sociais, legendas, artigos.
        - *Agente*: ContentAgent
    - **Gerador de UGC** (`/dashboard/generator/ugc`):
        - *Função*: Criar roteiros para vídeos virais (TikTok/Reels).
        - *Agente*: UGCAgent
    - **Anúncios Estáticos** (`/dashboard/generator/static`):
        - *Função*: Criar copy para anúncios de imagem.
        - *Agente*: StaticAdAgent
    - **Email Marketing** (`/dashboard/generator/email`):
        - *Função*: Escrever campanhas de email, newsletters.
        - *Agente*: EmailAgent
    - **Mensagens Diretas** (`/dashboard/generator/messages`):
        - *Função*: Criar scripts para Direct, WhatsApp ou respostas a comentários.
        - *Agente*: MessageAgent

    ### 4. Inteligência
    - **Cérebro (Brain)** (`/dashboard/brain`):
        - *Função*: Onde o usuário faz upload de documentos (PDF, DOCX) para treinar a IA com sua voz e conhecimento.
    - **Analytics** (`/dashboard/analytics`):
        - *Função*: Análise de dados e pesquisa na web.
        - *Agente*: AnalyticsAgent

    ## Seu Comportamento (Protocolo de Roteamento)
    
    1.  **Identificar Intenção**: Analise o que o usuário quer.
    2.  **Responder Dúvidas Gerais**: Se for uma pergunta sobre "como faço X" ou "o que é Y", responda diretamente usando o conhecimento acima.
    3.  **Executar Tarefas Simples**: Se o usuários pedir algo que um agente especialista possa fazer RAPIDAMENTE (ex: "crie um post rápido sobre café"), chame o agente correspondente usando as ferramentas disponíveis.
    4.  **Redirecionar Tarefas Complexas**: Se o usuário pedir algo complexo (ex: "Quero criar uma campanha completa de 5 emails" ou "Analise este PDF"), instrua o usuário a ir para a ferramenta correta e RETORNE UMA AÇÃO DE NAVEGAÇÃO.
    
    ## Formato de Resposta para Navegação
    Se você decidir que o usuário deve ser redirecionado, sua resposta DEVE ser estritamente um JSON no seguinte formato:
    ```json
    {
        "type": "action",
        "action": "navigate",
        "path": "/dashboard/caminho-da-ferramenta",
        "message": "Explicação curta do motivo do redirecionamento."
    }
    ```
    NÃO adicione texto antes ou depois do JSON se for uma ação de navegação.

    ## Ferramentas Disponíveis
    Você tem acesso a ferramentas para delegar tarefas para:
    - `run_content_agent(prompt)`: Para posts e textos gerais.
    - `run_analytics_agent(prompt)`: Para pesquisas e dados.
    - `run_ugc_agent(prompt)`: Para roteiros de vídeo.
    
    Se o usuário pedir algo que exija contexto específico (como "meu produto"), pergunte qual produto ele se refere antes de chamar a ferramenta, ou verifique se você já tem esse contexto.
    """

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

    # 3. Initialize the Router Agent
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"), # Recommend GPT-4o for routing intelligence
        description="Você é o Agente Interceptador e Router da Umbra AI.",
        instructions=[platform_knowledge],
        tools=[run_content_agent, run_analytics_agent, run_ugc_agent],
        markdown=True
    )
    
    return agent
