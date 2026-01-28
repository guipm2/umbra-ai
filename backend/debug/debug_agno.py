import agno
import inspect
import pkgutil

print(f"Agno version: {agno.__version__}")
print(f"Agno path: {agno.__path__}")

def list_submodules(package):
    if hasattr(package, "__path__"):
        for _, name, _ in pkgutil.iter_modules(package.__path__):
            print(f"- {name}")

print("\nSubmodules of agno:")
list_submodules(agno)

try:
    from agno.knowledge.combined import CombinedKnowledgeBase
    print("\nSUCCESS: agno.knowledge.combined found.")
except ImportError as e:
    print(f"\nFAILURE: {e}")
    try:
        from agno.knowledge import CombinedKnowledgeBase
        print("FOUND in agno.knowledge!")
    except ImportError:
        print("Not in agno.knowledge either.")

