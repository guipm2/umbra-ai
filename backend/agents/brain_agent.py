from agno.agent import Agent
from agno.models.openai import OpenAIChat
from knowledge_base import get_knowledge_base
from agno.knowledge.document import Document
from fastapi import UploadFile
import io
import pypdf
import docx

def get_brain_agent():
    kb = get_knowledge_base()
    if not kb:
        return None

    return Agent(
        model=OpenAIChat(id="gpt-4o"),
        knowledge=kb,
        search_knowledge=True,
        description="You are the Brain of the company. You have access to all internal documents.",
        instructions=[
            "Always search your knowledge base first.",
            "If the answer is found in the documents, cite the source.",
            "If not found, use your general knowledge but mention it.",
        ],
    )

async def process_document(file: UploadFile, user_id: str):
    """
    Extracts text from file and loads it into Knowledge Base
    """
    content = ""
    filename = file.filename
    file_type = filename.split('.')[-1].lower()
    
    # Read file content
    file_bytes = await file.read()
    
    try:
        if file_type == "pdf":
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                content += page.extract_text() + "\n"
                
        elif file_type in ["doc", "docx"]:
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                content += para.text + "\n"
                
        elif file_type in ["txt", "md"]:
            content = file_bytes.decode("utf-8")
            
        else:
            return {"status": "error", "message": "Arquivo não suportado"}

        if not content.strip():
             return {"status": "error", "message": "Nenhum texto extraído do documento"}

        # Load into Vector DB
        kb = get_knowledge_base()
        if kb:
            doc = Document(
                content=content,
                meta_data={
                    "source": filename,
                    "user_id": user_id,
                    "type": file_type
                }
            )
            kb.vector_db.upsert(content_hash=filename, documents=[doc])
            return {"status": "success", "message": f"Documento processado com sucesso: {filename}"}
        
        return {"status": "error", "message": "Base de Conhecimento indisponível"}

    except Exception as e:
        print(f"Erro ao processar documento: {e}")
        return {"status": "error", "message": str(e)}
