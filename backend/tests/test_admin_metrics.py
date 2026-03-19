def test_admin_metrics_requires_super_admin(client, auth_headers):
    response = client.get("/api/admin/metrics-summary", headers=auth_headers)
    assert response.status_code == 403


def test_admin_metrics_allows_super_admin(client, admin_auth_headers):
    response = client.get("/api/admin/metrics-summary", headers=admin_auth_headers)
    assert response.status_code == 200
    payload = response.json()

    assert "request_id" in payload
    assert "uptime_seconds" in payload
    assert "http_requests_total" in payload
    assert "agent_calls_total" in payload
    assert "http_duration_ms_percentiles" in payload
    assert "agent_duration_ms_percentiles" in payload
