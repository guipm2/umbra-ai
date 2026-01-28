try:
    from agno.knowledge.embedder.openai import OpenAIEmbedder
    print("SUCCESS: Found in agno.knowledge.embedder.openai")
except ImportError as e:
    print(f"FAILURE: {e}")
