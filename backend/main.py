import json
import logging

from fastapi import FastAPI, HTTPException, UploadFile, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from auth import get_current_user
from agents.content_agent import get_content_agent
from agents.analytics_agent import get_analytics_agent
from agents.ugc_agent import get_ugc_agent
from agents.static_ad_agent import get_static_ad_agent
from agents.email_agent import get_email_agent
from agents.message_agent import get_message_agent
from agents.brain_agent import get_brain_agent, process_document

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Umbra AI Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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


# ---------------------------------------------------------------------------
# Public endpoints (no auth required)
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {"message": "Backend da Umbra AI online"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Protected endpoints — all require valid Supabase JWT
# ---------------------------------------------------------------------------
@app.post("/api/content")
@limiter.limit("20/minute")
def generate_content(request: Request, body: AgentRequest, user_id: str = Depends(get_current_user)):
    try:
        agent = get_content_agent(user_id=user_id)
        response = agent.run(body.message)
        return {"response": response.content}
    except Exception:
        logger.exception("Content agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar conteúdo. Tente novamente.")

@app.post("/api/analytics")
@limiter.limit("20/minute")
def analyze_data(request: Request, body: AgentRequest, user_id: str = Depends(get_current_user)):
    try:
        agent = get_analytics_agent()
        response = agent.run(body.message)
        return {"response": response.content}
    except Exception:
        logger.exception("Analytics agent error")
        raise HTTPException(status_code=500, detail="Erro na análise. Tente novamente.")

@app.post("/api/ugc")
@limiter.limit("10/minute")
def generate_ugc(request: Request, body: UGCRequest, user_id: str = Depends(get_current_user)):
    try:
        agent = get_ugc_agent()
        prompt = f"""
        Crie um roteiro de vídeo viral UGC.
        Produto: {body.product_name}
        Público Alvo: {body.audience_name}
        Persona da Marca/Especialista: {body.expert_name}
        Estilo do Vídeo: {body.style}
        """
        response = agent.run(prompt)
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("UGC agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
    except Exception:
        logger.exception("UGC agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar roteiro UGC. Tente novamente.")

@app.post("/api/static-ad")
@limiter.limit("10/minute")
def generate_static_ad(request: Request, body: StaticAdRequest, user_id: str = Depends(get_current_user)):
    try:
        agent = get_static_ad_agent()
        prompt = f"Produto: {body.product_name}\nPúblico: {body.audience_name}\nOferta/Objetivo: {body.offer}"
        response = agent.run(prompt)
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("Static ad agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
    except Exception:
        logger.exception("Static ad agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar anúncio. Tente novamente.")

@app.post("/api/email")
@limiter.limit("10/minute")
def generate_email(request: Request, body: EmailRequest, user_id: str = Depends(get_current_user)):
    try:
        agent = get_email_agent()
        prompt = f"Produto: {body.product_name}\nPúblico: {body.audience_name}\nObjetivo: {body.objective}"
        response = agent.run(prompt)
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("Email agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
    except Exception:
        logger.exception("Email agent error")
        raise HTTPException(status_code=500, detail="Erro ao gerar e-mail. Tente novamente.")

@app.post("/api/message")
@limiter.limit("10/minute")
def generate_message(request: Request, body: MessageRequest, user_id: str = Depends(get_current_user)):
    try:
        agent = get_message_agent()
        prompt = f"Contexto: {body.context}\nTom de voz: {body.tone}"
        response = agent.run(prompt)
        return _safe_parse_json(response.content)
    except json.JSONDecodeError:
        logger.exception("Message agent returned invalid JSON")
        raise HTTPException(status_code=502, detail="Resposta inválida do agente de IA.")
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
        agent = get_brain_agent()
        if not agent:
            return {"response": "Base de Conhecimento não configurada."}

        response = agent.run(body.query)
        return {"response": response.content}
    except Exception:
        logger.exception("Brain query error")
        raise HTTPException(status_code=500, detail="Erro na consulta. Tente novamente.")

@app.post("/api/chat")
@limiter.limit("30/minute")
def chat_interceptor(request: Request, body: AgentRequest, user_id: str = Depends(get_current_user)):
    try:
        from agent import get_agent
        agent = get_agent(user_id=user_id)
        response = agent.run(body.message)

        content = response.content
        try:
            if content.strip().startswith("{") and content.strip().endswith("}"):
                return json.loads(content)
        except json.JSONDecodeError:
            pass

        return {"response": content}
    except Exception:
        logger.exception("Chat interceptor error")
        raise HTTPException(status_code=500, detail="Erro no chat. Tente novamente.")
