import agno
import pkgutil
import inspect

print("Submodules of agno:")
for _, name, _ in pkgutil.iter_modules(agno.__path__):
    print(f"- {name}")

# Check agno.models, agno.types, etc.
try:
    from agno.models import Document
    print("Found Document in agno.models")
except ImportError:
    pass

try:
    from agno.utils import Document
    print("Found Document in agno.utils")
except ImportError:
    pass

try:
    from agno.knowledge import Document
    print("Found Document in agno.knowledge")
except ImportError:
    pass
