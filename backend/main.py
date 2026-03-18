import json
import logging
import os
import time
import uuid
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout
from typing import Callable

from fastapi import FastAPI, HTTPException, UploadFile, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from auth import get_current_user, require_super_admin
from agents.content_agent import get_content_agent
from agents.analytics_agent import get_analytics_agent
from agents.ugc_agent import get_ugc_agent
from agents.static_ad_agent import get_static_ad_agent
from agents.email_agent import get_email_agent
from agents.message_agent import get_message_agent
from agents.brain_agent import get_brain_agent, process_document

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Umbra AI Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

HTTP_REQUESTS_TOTAL = Counter(
    "umbra_http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)
HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "umbra_http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "path"],
)
AGENT_CALLS_TOTAL = Counter(
    "umbra_agent_calls_total",
    "Total calls to AI agents",
    ["agent", "status"],
)
AGENT_CALL_DURATION_SECONDS = Histogram(
    "umbra_agent_call_duration_seconds",
    "Agent call duration in seconds",
    ["agent"],
)
APP_STARTED_AT = time.time()

# ---------------------------------------------------------------------------
# CORS — explicit methods and headers only
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://umbra-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
AI_TIMEOUT_SECONDS = int(os.getenv("AI_TIMEOUT_SECONDS", "45"))
AI_MAX_RETRIES = int(os.getenv("AI_MAX_RETRIES", "2"))
AI_RETRY_BASE_DELAY_SECONDS = float(os.getenv("AI_RETRY_BASE_DELAY_SECONDS", "0.8"))

# ---------------------------------------------------------------------------
# Request models — with basic input length limits
# ---------------------------------------------------------------------------
class AgentRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10_000)

class UGCRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=500)
    audience_name: str = Field(..., min_length=1, max_length=500)
    expert_name: str = Field(..., min_length=1, max_length=500)
    style: str = Field(..., min_length=1, max_length=200)

class StaticAdRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=500)
    audience_name: str = Field(..., min_length=1, max_length=500)
    offer: str = Field(..., min_length=1, max_length=2_000)

class EmailRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=500)
    audience_name: str = Field(..., min_length=1, max_length=500)
    objective: str = Field(..., min_length=1, max_length=2_000)

class MessageRequest(BaseModel):
    context: str = Field(..., min_length=1, max_length=5_000)
    tone: str = Field(..., min_length=1, max_length=200)

class BrainQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5_000)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _safe_parse_json(raw: str) -> dict:
    """Parse AI response text as JSON, stripping markdown fences."""
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


def _is_retryable_error(exc: Exception) -> bool:
    message = str(exc).lower()
    retryable_markers = [
        "timeout",
        "timed out",
        "rate limit",
        "too many requests",
        "temporarily",
        "connection",
        "unavailable",
        "overloaded",
        "429",
        "502",
        "503",
        "504",
    ]
    return any(marker in message for marker in retryable_markers)


def _run_with_timeout(func: Callable[[], object], timeout_seconds: int):
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(func)
        try:
            return future.result(timeout=timeout_seconds)
        except FuturesTimeout as exc:
            raise TimeoutError(f"Agent timeout after {timeout_seconds}s") from exc


def _run_agent_with_resilience(
    agent_name: str,
    prompt: str,
    request_id: str,
    run_agent: Callable[[str], object],
):
    attempts = AI_MAX_RETRIES + 1
    for attempt in range(1, attempts + 1):
        started_at = time.perf_counter()
        try:
            response = _run_with_timeout(lambda: run_agent(prompt), timeout_seconds=AI_TIMEOUT_SECONDS)
            AGENT_CALLS_TOTAL.labels(agent=agent_name, status="success").inc()
            AGENT_CALL_DURATION_SECONDS.labels(agent=agent_name).observe(time.perf_counter() - started_at)
            return response
        except Exception as exc:
            AGENT_CALLS_TOTAL.labels(agent=agent_name, status="error").inc()
            AGENT_CALL_DURATION_SECONDS.labels(agent=agent_name).observe(time.perf_counter() - started_at)

            should_retry = attempt < attempts and _is_retryable_error(exc)
            logger.warning(
                "agent_call_failed request_id=%s agent=%s attempt=%s/%s retry=%s error=%s",
                request_id,
                agent_name,
                attempt,
                attempts,
                should_retry,
                exc,
            )
            if not should_retry:
                raise

            backoff_seconds = AI_RETRY_BASE_DELAY_SECONDS * (2 ** (attempt - 1))
            time.sleep(backoff_seconds)

    raise RuntimeError(f"{agent_name} failed after retries")


@app.middleware("http")
async def request_observability_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id

    started_at = time.perf_counter()
    response = None
    status_code = 500

    try:
        response = await call_next(request)
        status_code = response.status_code
        return response
    finally:
        duration = time.perf_counter() - started_at
        HTTP_REQUESTS_TOTAL.labels(
            method=request.method,
            path=request.url.path,
            status=str(status_code),
        ).inc()
        HTTP_REQUEST_DURATION_SECONDS.labels(method=request.method, path=request.url.path).observe(duration)

        logger.info(
            "request_completed request_id=%s method=%s path=%s status=%s duration_ms=%.2f",
            request_id,
            request.method,
            request.url.path,
            status_code,
            duration * 1000,
        )

        if response is not None:
            response.headers["X-Request-ID"] = request_id


# ---------------------------------------------------------------------------
# Public endpoints (no auth required)
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {"message": "Backend da Umbra AI online"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/api/admin/metrics-summary")
def admin_metrics_summary(request: Request, admin_user_id: str = Depends(require_super_admin)):
    http_requests = defaultdict(int)
    for metric in HTTP_REQUESTS_TOTAL.collect():
        for sample in metric.samples:
            if sample.name != "umbra_http_requests_total":
                continue
            key = (sample.labels.get("method"), sample.labels.get("path"), sample.labels.get("status"))
            http_requests[key] += int(sample.value)

    http_duration_acc = defaultdict(lambda: {"sum": 0.0, "count": 0.0})
    for metric in HTTP_REQUEST_DURATION_SECONDS.collect():
        for sample in metric.samples:
            if sample.name.endswith("_sum"):
                key = (sample.labels.get("method"), sample.labels.get("path"))
                http_duration_acc[key]["sum"] += float(sample.value)
            elif sample.name.endswith("_count"):
                key = (sample.labels.get("method"), sample.labels.get("path"))
                http_duration_acc[key]["count"] += float(sample.value)

    agent_calls = defaultdict(int)
    for metric in AGENT_CALLS_TOTAL.collect():
        for sample in metric.samples:
            if sample.name != "umbra_agent_calls_total":
                continue
            key = (sample.labels.get("agent"), sample.labels.get("status"))
            agent_calls[key] += int(sample.value)

    agent_duration_acc = defaultdict(lambda: {"sum": 0.0, "count": 0.0})
    for metric in AGENT_CALL_DURATION_SECONDS.collect():
        for sample in metric.samples:
            if sample.name.endswith("_sum"):
                key = sample.labels.get("agent")
                agent_duration_acc[key]["sum"] += float(sample.value)
            elif sample.name.endswith("_count"):
                key = sample.labels.get("agent")
                agent_duration_acc[key]["count"] += float(sample.value)

    top_http_paths = sorted(http_requests.items(), key=lambda x: x[1], reverse=True)[:20]

    return {
        "admin_user_id": admin_user_id,
        "request_id": getattr(request.state, "request_id", None),
        "uptime_seconds": int(time.time() - APP_STARTED_AT),
        "http_requests_total": [
            {
                "method": method,
                "path": path,
                "status": status,
                "count": count,
            }
            for (method, path, status), count in top_http_paths
        ],
        "http_duration_ms_avg": [
            {
                "method": method,
                "path": path,
                "avg_ms": round((vals["sum"] / vals["count"]) * 1000, 2),
                "count": int(vals["count"]),
            }
            for (method, path), vals in http_duration_acc.items()
            if vals["count"] > 0
        ],
        "agent_calls_total": [
            {
                "agent": agent,
                "status": status,
                "count": count,
            }
            for (agent, status), count in sorted(agent_calls.items(), key=lambda x: x[1], reverse=True)
        ],
        "agent_duration_ms_avg": [
            {
                "agent": agent,
                "avg_ms": round((vals["sum"] / vals["count"]) * 1000, 2),
                "count": int(vals["count"]),
            }
            for agent, vals in agent_duration_acc.items()
            if vals["count"] > 0
        ],
    }


# ---------------------------------------------------------------------------
# Protected endpoints — all require valid Supabase JWT
# ---------------------------------------------------------------------------
@app.post("/api/content")
@limiter.limit("20/minute")
def generate_content(request: Request, body: AgentRequest, user_id: str = Depends(get_current_user)):
    try:
        response = _run_agent_with_resilience(
            agent_name="content",
            prompt=body.message,
            request_id=request.state.request_id,
            run_agent=lambda prompt: get_content_agent(user_id=user_id).run(prompt),
        )
        return {"response": response.content}
    except TimeoutError:
        logger.exception("Content agent timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("Content agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar conteúdo. Tente novamente.")

@app.post("/api/analytics")
@limiter.limit("20/minute")
def analyze_data(request: Request, body: AgentRequest, user_id: str = Depends(get_current_user)):
    try:
        response = _run_agent_with_resilience(
            agent_name="analytics",
            prompt=body.message,
            request_id=request.state.request_id,
            run_agent=lambda prompt: get_analytics_agent().run(prompt),
        )
        return {"response": response.content}
    except TimeoutError:
        logger.exception("Analytics agent timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("Analytics agent error")
        raise HTTPException(status_code=500, detail="Erro na análise. Tente novamente.")

@app.post("/api/ugc")
@limiter.limit("10/minute")
def generate_ugc(request: Request, body: UGCRequest, user_id: str = Depends(get_current_user)):
    try:
        prompt = f"""
        Crie um roteiro de vídeo viral UGC.
        Produto: {body.product_name}
        Público Alvo: {body.audience_name}
        Persona da Marca/Especialista: {body.expert_name}
        Estilo do Vídeo: {body.style}
        """
        response = _run_agent_with_resilience(
            agent_name="ugc",
            prompt=prompt,
            request_id=request.state.request_id,
            run_agent=lambda prompt: get_ugc_agent().run(prompt),
        )
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("UGC agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
    except TimeoutError:
        logger.exception("UGC agent timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("UGC agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar roteiro UGC. Tente novamente.")

@app.post("/api/static-ad")
@limiter.limit("10/minute")
def generate_static_ad(request: Request, body: StaticAdRequest, user_id: str = Depends(get_current_user)):
    try:
        prompt = f"Produto: {body.product_name}\nPúblico: {body.audience_name}\nOferta/Objetivo: {body.offer}"
        response = _run_agent_with_resilience(
            agent_name="static_ad",
            prompt=prompt,
            request_id=request.state.request_id,
            run_agent=lambda prompt: get_static_ad_agent().run(prompt),
        )
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("Static ad agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
    except TimeoutError:
        logger.exception("Static ad agent timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("Static ad agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar anúncio. Tente novamente.")

@app.post("/api/email")
@limiter.limit("10/minute")
def generate_email(request: Request, body: EmailRequest, user_id: str = Depends(get_current_user)):
    try:
        prompt = f"Produto: {body.product_name}\nPúblico: {body.audience_name}\nObjetivo: {body.objective}"
        response = _run_agent_with_resilience(
            agent_name="email",
            prompt=prompt,
            request_id=request.state.request_id,
            run_agent=lambda prompt: get_email_agent().run(prompt),
        )
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("Email agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
    except TimeoutError:
        logger.exception("Email agent timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("Email agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar e-mail. Tente novamente.")

@app.post("/api/message")
@limiter.limit("10/minute")
def generate_message(request: Request, body: MessageRequest, user_id: str = Depends(get_current_user)):
    try:
        prompt = f"Contexto: {body.context}\nTom de voz: {body.tone}"
        response = _run_agent_with_resilience(
            agent_name="message",
            prompt=prompt,
            request_id=request.state.request_id,
            run_agent=lambda prompt: get_message_agent().run(prompt),
        )
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("Message agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
    except TimeoutError:
        logger.exception("Message agent timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("Message agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar mensagem. Tente novamente.")

@app.post("/api/brain/upload")
@limiter.limit("5/minute")
async def upload_knowledge(request: Request, file: UploadFile, user_id: str = Depends(get_current_user)):
    try:
        # --- File size check ---
        contents = await file.read()
        if len(contents) > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Arquivo excede o limite de {MAX_UPLOAD_SIZE // (1024*1024)}MB.",
            )
        await file.seek(0)

        result = await process_document(file, user_id=user_id)
        return result
    except HTTPException:
        raise
    except Exception:
        logger.exception("Upload error")
        raise HTTPException(status_code=500, detail="Erro ao processar documento.")

@app.post("/api/brain/query")
@limiter.limit("20/minute")
def query_brain(request: Request, body: BrainQueryRequest, user_id: str = Depends(get_current_user)):
    try:
        agent = get_brain_agent(user_id=user_id)
        if not agent:
            return {"response": "Base de Conhecimento não configurada."}

        response = _run_agent_with_resilience(
            agent_name="brain",
            prompt=body.query,
            request_id=request.state.request_id,
            run_agent=lambda prompt: agent.run(prompt),
        )
        return {"response": response.content}
    except TimeoutError:
        logger.exception("Brain query timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("Brain query error")
        raise HTTPException(status_code=500, detail="Erro na consulta. Tente novamente.")

@app.post("/api/chat")
@limiter.limit("30/minute")
def chat_interceptor(request: Request, body: AgentRequest, user_id: str = Depends(get_current_user)):
    try:
        from agent import get_agent
        response = _run_agent_with_resilience(
            agent_name="router",
            prompt=body.message,
            request_id=request.state.request_id,
            run_agent=lambda prompt: get_agent(user_id=user_id).run(prompt),
        )

        content = response.content
        try:
            if content.strip().startswith("{") and content.strip().endswith("}"):
                return json.loads(content)
        except json.JSONDecodeError:
            pass

        return {"response": content}
    except TimeoutError:
        logger.exception("Chat interceptor timeout")
        raise HTTPException(status_code=504, detail="Tempo de resposta excedido. Tente novamente.")
    except Exception:
        logger.exception("Chat interceptor error")
        raise HTTPException(status_code=500, detail="Erro no chat. Tente novamente.")
