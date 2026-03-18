import io

import anyio
from fastapi import UploadFile

from tests.conftest import DummyAgent


def test_brain_upload_endpoint_accepts_multipart(client, auth_headers, monkeypatch):
    import main

    async def fake_process_document(file, user_id):
        return {"status": "success", "message": f"ok:{file.filename}:{user_id}"}

    monkeypatch.setattr(main, "process_document", fake_process_document)

    response = client.post(
        "/api/brain/upload",
        files={"file": ("manual.md", b"conteudo de teste", "text/markdown")},
        headers=auth_headers,
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["message"].startswith("ok:manual.md:user-test-123")


def test_brain_query_uses_user_scoped_agent(client, auth_headers, monkeypatch):
    import main

    captured = {"user_id": None}

    def fake_get_brain_agent(user_id: str):
        captured["user_id"] = user_id
        return DummyAgent("knowledge-answer")

    monkeypatch.setattr(main, "get_brain_agent", fake_get_brain_agent)

    response = client.post(
        "/api/brain/query",
        json={"query": "Qual nosso playbook interno?"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json() == {"response": "knowledge-answer"}
    assert captured["user_id"] == "user-test-123"


def test_content_endpoint_passes_user_id_to_content_agent(client, auth_headers, monkeypatch):
    import main

    captured = {"user_id": None}

    def fake_get_content_agent(user_id: str):
        captured["user_id"] = user_id
        return DummyAgent("content-ready")

    monkeypatch.setattr(main, "get_content_agent", fake_get_content_agent)

    response = client.post(
        "/api/content",
        json={"message": "Crie um post curto"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json() == {"response": "content-ready"}
    assert captured["user_id"] == "user-test-123"


def test_process_document_generates_user_scoped_hash(monkeypatch):
    from agents import brain_agent

    captured_hashes: list[str] = []

    class FakeVectorDb:
        def upsert(self, content_hash, documents):
            captured_hashes.append(content_hash)

    class FakeKnowledgeBase:
        vector_db = FakeVectorDb()

    monkeypatch.setattr(brain_agent, "get_knowledge_base", lambda: FakeKnowledgeBase())

    async def run_case():
        file_a = UploadFile(filename="manual.txt", file=io.BytesIO(b"hello"))
        file_b = UploadFile(filename="manual.txt", file=io.BytesIO(b"hello"))

        res_a = await brain_agent.process_document(file_a, user_id="user-a")
        res_b = await brain_agent.process_document(file_b, user_id="user-b")

        assert res_a["status"] == "success"
        assert res_b["status"] == "success"

    anyio.run(run_case)

    assert len(captured_hashes) == 2
    assert captured_hashes[0] != captured_hashes[1]
