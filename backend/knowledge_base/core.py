from agno.knowledge import Knowledge as AgentKnowledge
from agno.vectordb.pgvector import PgVector
from agno.knowledge.embedder.openai import OpenAIEmbedder
from dotenv import load_dotenv
import os

load_dotenv()

def get_knowledge_base():
    """
    Returns a Knowledge Base configured with Supabase (Postgres) and OpenAI Embeddings.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Warning: DATABASE_URL not found. Knowledge Base will not function.")
        return None

    try:
        # Configure PgVector storage (Supabase)
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
        print(f"Failed to initialize Knowledge Base: {e}")
        return None
