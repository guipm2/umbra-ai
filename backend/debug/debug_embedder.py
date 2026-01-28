import agno.embedder
import inspect
import pkgutil

print("Submodules of agno.embedder:")
if hasattr(agno.embedder, "__path__"):
    for _, name, _ in pkgutil.iter_modules(agno.embedder.__path__):
        print(f"- {name}")

print("\nClasses in agno.embedder:")
for name, obj in inspect.getmembers(agno.embedder):
    if inspect.isclass(obj):
        print(f"Class: {name}")
