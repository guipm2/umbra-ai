from agno.knowledge import Knowledge as AgentKnowledge
from agno.vectordb.pgvector import PgVector
from agno.knowledge.embedder.openai import OpenAIEmbedder
from dotenv import load_dotenv
import os

load_dotenv()

def get_knowledge_base():
    """
    Retorna a Knowledge Base configurada com Supabase (Postgres) e Embeddings OpenAI.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Aviso: DATABASE_URL não encontrado. Base de Conhecimento não funcionará.")
        return None

    try:
        # Configuração do PgVector storage (Supabase)
        vector_db = PgVector(
            db_url=db_url,
            table_name="agent_knowledge",
            embedder=OpenAIEmbedder(id="text-embedding-3-small"),
        )
    
        kb = AgentKnowledge(
            vector_db=vector_db,
        )
        return kb
    except Exception as e:
        print(f"Erro ao inicializar Base de Conhecimento: {e}")
        return None
