try:
    from agno.knowledge.document import Document
    print("SUCCESS: Found Document in agno.knowledge.document")
except ImportError as e:
    print(f"FAILURE: {e}")
