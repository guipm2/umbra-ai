def test_metrics_endpoint_exposes_prometheus_text(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers.get("content-type", "")
    assert "umbra_http_requests_total" in response.text


def test_request_id_is_returned_in_response_headers(client):
    response = client.get("/health", headers={"X-Request-ID": "rid-test-123"})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == "rid-test-123"


def test_request_id_is_generated_when_missing(client):
    response = client.get("/health")
    assert response.status_code == 200
    request_id = response.headers.get("X-Request-ID")
    assert request_id is not None
    assert len(request_id) >= 8