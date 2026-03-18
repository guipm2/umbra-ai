from tests.conftest import DummyAgent


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_protected_endpoint_requires_auth(client):
    response = client.post("/api/chat", json={"message": "Hello"})
    assert response.status_code == 401


def test_chat_endpoint_with_auth(client, auth_headers, monkeypatch):
    import agent as router_agent

    monkeypatch.setattr(router_agent, "get_agent", lambda user_id: DummyAgent("pong"))

    response = client.post("/api/chat", json={"message": "ping"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == {"response": "pong"}
