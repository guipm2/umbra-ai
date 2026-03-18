from tests.conftest import DummyAgent


def test_analytics_endpoint_with_auth(client, auth_headers, monkeypatch):
    import main

    monkeypatch.setattr(main, "get_analytics_agent", lambda: DummyAgent("analysis-ready"))

    response = client.post(
        "/api/analytics",
        json={"message": "Quais tendencias de IA em marketing hoje?"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json() == {"response": "analysis-ready"}
