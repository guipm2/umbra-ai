import importlib
import inspect

try:
    import agno.knowledge.embedder
    print("Found agno.knowledge.embedder")
except ImportError:
    print("agno.knowledge.embedder NOT found")

try:
    from agno.knowledge.embedder import OpenAIEmbedder
    print("Found OpenAIEmbedder in agno.knowledge.embedder")
except ImportError:
    print("OpenAIEmbedder NOT in agno.knowledge.embedder")

# Check submodules of agno.knowledge.embedder/embedder
# Maybe it's generic?
