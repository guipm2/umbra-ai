from agno.knowledge import Knowledge
from agno.vectordb.pgvector import PgVector2
from agno.embedder.openai import OpenAIEmbedder

try:
    print("Testing Knowledge class...")
    # Mocking PgVector init to avoid DB connection validation here if possible, 
    # but PgVector probably needs arguments. 
    # I'll just check if Knowledge accepts vector_db.
    
    # Introspection
    import inspect
    sig = inspect.signature(Knowledge)
    print(f"Knowledge signature: {sig}")
    
    # Check if vector_db is in params
    if 'vector_db' in sig.parameters:
        print("SUCCESS: Knowledge accepts vector_db.")
    else:
        print("FAILURE: Knowledge does NOT accept vector_db.")

except Exception as e:
    print(f"Error: {e}")
