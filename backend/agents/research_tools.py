"""Shared internet research tools for Umbra AI agents.

Tools return JSON strings to maximize compatibility with LLM tool-calling outputs.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from ddgs import DDGS

logger = logging.getLogger(__name__)

_RECENCY_MAP = {
    "day": "d",
    "week": "w",
    "month": "m",
    "year": "y",
    "all": None,
}


def _normalize_limit(max_results: int, default: int = 6) -> int:
    if not isinstance(max_results, int):
        return default
    return max(1, min(max_results, 12))


def _run_search(query: str, max_results: int, recency: str, region: str) -> list[dict[str, Any]]:
    time_limit = _RECENCY_MAP.get(recency.lower(), "m")

    with DDGS() as ddgs:
        raw_results = list(
            ddgs.text(
                keywords=query,
                region=region,
                safesearch="moderate",
                timelimit=time_limit,
                max_results=max_results,
            )
        )

    normalized: list[dict[str, Any]] = []
    for item in raw_results:
        normalized.append(
            {
                "title": item.get("title") or "",
                "url": item.get("href") or "",
                "snippet": item.get("body") or "",
                "source": item.get("source") or "web",
            }
        )
    return normalized


def search_web(
    query: str,
    max_results: int = 6,
    recency: str = "month",
    region: str = "wt-wt",
) -> str:
    """Search the web for updated information and return structured JSON results.

    Use this for trends, references, market signals, or factual updates.
    recency: day, week, month, year, all.
    """
    if not query or not query.strip():
        return json.dumps({"ok": False, "error": "query empty", "results": []}, ensure_ascii=False)

    limit = _normalize_limit(max_results)
    try:
        results = _run_search(query=query.strip(), max_results=limit, recency=recency, region=region)
        return json.dumps(
            {
                "ok": True,
                "query": query,
                "recency": recency,
                "region": region,
                "results": results,
            },
            ensure_ascii=False,
        )
    except Exception as exc:
        logger.exception("search_web failed")
        return json.dumps(
            {"ok": False, "error": f"search failed: {type(exc).__name__}", "results": []},
            ensure_ascii=False,
        )


def discover_copy_trends(
    niche: str,
    platform: str = "instagram",
    objective: str = "conversao",
    locale: str = "Brasil",
    max_results: int = 6,
) -> str:
    """Find recent copywriting and creative trends for a specific niche/channel.

    Good for discovering hooks, formats, and angles that are currently performing.
    """
    if not niche or not niche.strip():
        return json.dumps({"ok": False, "error": "niche empty", "results": []}, ensure_ascii=False)

    trend_query = (
        f"{niche} {platform} tendencias copywriting anuncios hooks formatos criativos "
        f"{objective} {locale}"
    )
    return search_web(query=trend_query, max_results=max_results, recency="month", region="wt-wt")


def benchmark_angle_scan(
    market_or_product: str,
    locale: str = "Brasil",
    max_results: int = 6,
) -> str:
    """Scan market messaging angles, competitors, and positioning references.

    Useful when the agent needs input for differentiation and offer framing.
    """
    if not market_or_product or not market_or_product.strip():
        return json.dumps({"ok": False, "error": "market_or_product empty", "results": []}, ensure_ascii=False)

    benchmark_query = (
        f"{market_or_product} concorrentes posicionamento proposta de valor anuncios {locale}"
    )
    return search_web(query=benchmark_query, max_results=max_results, recency="year", region="wt-wt")
