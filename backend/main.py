from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.content_agent import get_content_agent
from agents.analytics_agent import get_analytics_agent
from agents.ugc_agent import get_ugc_agent
from knowledge_base import get_knowledge_base
from agno.knowledge.document import Document
import json

app = FastAPI(title="Aura AI Backend")

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
    return {"message": "Aura AI Backend is running with Multi-Agent Support"}

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
        print(f"Content Agent Error: {e}")
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
        print(f"Analytics Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ugc")
def generate_ugc(request: UGCRequest):
    """
    Generate a Viral Video Script based on structured inputs.
    """
    try:
        agent = get_ugc_agent()
        
        prompt = f"""
        Create a viral UGC video script.
        Product: {request.product_name}
        Target Audience: {request.audience_name}
        Brand Persona/Expert: {request.expert_name}
        Video Style: {request.style}
        """
        
        response = agent.run(prompt)
        
        # Parse JSON from response
        # The agent is instructed to return JSON, but we clean it just in case
        content_str = response.content.replace('```json', '').replace('```', '').strip()
        script_json = json.loads(content_str)
        
        return script_json
    except Exception as e:
        print(f"UGC Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/brain/upload")
def upload_knowledge(request: DocumentRequest):
    """
    Endpoint to ingest text directly into the Knowledge Base.
    """
    try:
        kb = get_knowledge_base()
        if not kb:
            raise HTTPException(status_code=500, detail="Knowledge Base not configured")
        
        # Create a document and load it
        doc = Document(content=request.content, meta_data=request.metadata)
        kb.load_documents([doc], split=True)
        
        return {"status": "success", "message": "Document ingested into Brain"}
    except Exception as e:
        print(f"Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
