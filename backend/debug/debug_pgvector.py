import agno.vectordb.pgvector
import inspect

print("Contents of agno.vectordb.pgvector:")
for name, obj in inspect.getmembers(agno.vectordb.pgvector):
    if inspect.isclass(obj):
        print(f"Class: {name}")
