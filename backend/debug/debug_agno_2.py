import agno.knowledge
import pkgutil
import inspect

print("Contents of agno.knowledge:")
for name, obj in inspect.getmembers(agno.knowledge):
    if inspect.isclass(obj):
        print(f"Class: {name}")

print("\nSubmodules of agno.knowledge:")
if hasattr(agno.knowledge, "__path__"):
    for _, name, _ in pkgutil.iter_modules(agno.knowledge.__path__):
        print(f"- {name}")
