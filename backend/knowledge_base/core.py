from agno.knowledge import Knowledge as AgentKnowledge
from agno.vectordb.pgvector import PgVector
from agno.knowledge.embedder.openai import OpenAIEmbedder
from dotenv import load_dotenv
import logging
import os

load_dotenv()

logger = logging.getLogger(__name__)

def get_knowledge_base():
    """
    Retorna a Knowledge Base configurada com Supabase (Postgres) e Embeddings OpenAI.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.warning("DATABASE_URL não configurado — Knowledge Base desabilitada.")
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
    except Exception:
        logger.exception("Erro ao inicializar Base de Conhecimento")
        return None
