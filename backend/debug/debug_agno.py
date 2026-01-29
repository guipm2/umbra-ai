
try:
    import agno.tools.duckduckgo
    print("Conteúdo de agno.tools.duckduckgo:")
    print(dir(agno.tools.duckduckgo))
except ImportError as e:
    print(f"Erro ao importar: {e}")

try:
    from agno.tools.duckduckgo import DuckDuckGoTools
    print("DuckDuckGoTools encontrado!")
except ImportError:
    print("DuckDuckGoTools NÃO encontrado.")
