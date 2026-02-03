from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.content_agent import get_content_agent
from agents.analytics_agent import get_analytics_agent
from agents.ugc_agent import get_ugc_agent
from knowledge_base import get_knowledge_base
from agno.knowledge.document import Document
from agent import get_agent
import json

app = FastAPI(title="Umbra AI Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trigger Reload
class AgentRequest(BaseModel):
    message: str
    user_id: str = "default"

class UGCRequest(BaseModel):
    product_name: str
    audience_name: str
    expert_name: str
    style: str


class DocumentRequest(BaseModel):
    content: str
    metadata: dict = {}

@app.get("/")
def read_root():
    return {"message": "Backend da Umbra AI online"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/content")
def generate_content(request: AgentRequest):
    """
    Endpoint for Content Agent (Editor).
    Uses RAG to find user style.
    """
    try:
        agent = get_content_agent(user_id=request.user_id)
        response = agent.run(request.message)
        return {"response": response.content}
    except Exception as e:
        print(f"Erro no agente de conteúdo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analytics")
def analyze_data(request: AgentRequest):
    """
    Endpoint for Analytics Agent (Web Search).
    """
    try:
        agent = get_analytics_agent()
        response = agent.run(request.message)
        return {"response": response.content}
    except Exception as e:
        print(f"Erro no agente de análise: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ugc")
def generate_ugc(request: UGCRequest):
    """
    Generate a Viral Video Script based on structured inputs.
    """
    try:
        agent = get_ugc_agent()
        
        prompt = f"""
        Crie um roteiro de vídeo viral UGC.
        Produto: {request.product_name}
        Público Alvo: {request.audience_name}
        Persona da Marca/Especialista: {request.expert_name}
        Estilo do Vídeo: {request.style}
        """
        
        response = agent.run(prompt)
        
        # Parse JSON from response
        content_str = response.content.replace('```json', '').replace('```', '').strip()
        script_json = json.loads(content_str)
        
        return script_json
    except Exception as e:
        print(f"Erro no Agente de UGC: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- New Agents ---

from agents.static_ad_agent import get_static_ad_agent
from agents.email_agent import get_email_agent
from agents.message_agent import get_message_agent

class StaticAdRequest(BaseModel):
    product_name: str
    audience_name: str
    offer: str

class EmailRequest(BaseModel):
    product_name: str
    audience_name: str
    objective: str

class MessageRequest(BaseModel):
    context: str
    tone: str

@app.post("/api/static-ad")
def generate_static_ad(request: StaticAdRequest):
    try:
        agent = get_static_ad_agent()
        prompt = f"Produto: {request.product_name}\nPúblico: {request.audience_name}\nOferta/Objetivo: {request.offer}"
        response = agent.run(prompt)
        return json.loads(response.content.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/email")
def generate_email(request: EmailRequest):
    try:
        agent = get_email_agent()
        prompt = f"Produto: {request.product_name}\nPúblico: {request.audience_name}\nObjetivo: {request.objective}"
        response = agent.run(prompt)
        return json.loads(response.content.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/message")
def generate_message(request: MessageRequest):
    try:
        agent = get_message_agent()
        prompt = f"Contexto: {request.context}\nTom de voz: {request.tone}"
        response = agent.run(prompt)
        return json.loads(response.content.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from agents.brain_agent import get_brain_agent, process_document

class BrainQueryRequest(BaseModel):
    query: str
    user_id: str = "default"

@app.post("/api/brain/upload")
async def upload_knowledge(file: UploadFile): # Removed metadata/DocumentRequest dependency for simplicity
    try:
        # TODO: Get user_id from auth token (future task)
        result = await process_document(file, user_id="default")
        return result
    except Exception as e:
        print(f"Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/brain/query")
def query_brain(request: BrainQueryRequest):
    try:
        agent = get_brain_agent()
        if not agent:
             return {"response": "Base de Conhecimento não configurada."}
             
        response = agent.run(request.query)
        return {"response": response.content}
    except Exception as e:
         print(f"Erro na consulta ao Cérebro: {e}")
         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_interceptor(request: AgentRequest):
    """
    Main Chat Interface Endpoint.
    Uses the Interceptor Agent to route requests or answer directly.
    """
    try:
        agent = get_agent(user_id=request.user_id)
        response = agent.run(request.message)
        
        # Check if response attempts to be JSON (Action)
        content = response.content
        try:
             # Try to parse if it looks like JSON
            if content.strip().startswith('{') and content.strip().endswith('}'):
                json_content = json.loads(content)
                return json_content
        except json.JSONDecodeError:
            pass # Not JSON, just return text
            
        return {"response": content}
    except Exception as e:
        print(f"Erro no Chat Interceptador: {e}")
        raise HTTPException(status_code=500, detail=str(e))
