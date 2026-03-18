import time

import jwt
import pytest
from fastapi.testclient import TestClient

import auth
from main import app


TEST_JWT_SECRET = "test-supabase-jwt-secret-32-bytes-min"


class DummyResponse:
    def __init__(self, content: str):
        self.content = content


class DummyAgent:
    def __init__(self, content: str):
        self._content = content

    def run(self, _message: str):
        return DummyResponse(self._content)


@pytest.fixture
def auth_secret(monkeypatch):
    monkeypatch.setattr(auth, "SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    return TEST_JWT_SECRET


@pytest.fixture
def auth_headers(auth_secret):
    return build_auth_headers(auth_secret=auth_secret, user_id="user-test-123")


def build_auth_headers(
    auth_secret: str,
    user_id: str,
    role: str | None = None,
) -> dict:
    payload = {
        "sub": user_id,
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,
    }
    if role:
        payload["app_metadata"] = {"role": role}

    token = jwt.encode(payload, auth_secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(auth_secret):
    return build_auth_headers(auth_secret=auth_secret, user_id="admin-test-1", role="super_admin")


@pytest.fixture
def client(auth_secret):
    return TestClient(app)
