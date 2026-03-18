"""
JWT authentication dependency for FastAPI.

Validates Supabase access tokens using the project's JWT secret.
Requires SUPABASE_JWT_SECRET environment variable.
"""

import os
import logging
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_bearer_scheme = HTTPBearer(auto_error=False)

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPER_ADMIN_USER_IDS = {
    user_id.strip()
    for user_id in os.getenv("SUPER_ADMIN_USER_IDS", "").split(",")
    if user_id.strip()
}
SUPER_ADMIN_ROLES = {
    role.strip().lower()
    for role in os.getenv("SUPER_ADMIN_ROLES", "super_admin,admin,owner").split(",")
    if role.strip()
}


def _decode_token(token: str) -> dict:
    """Decode and verify a Supabase JWT. Returns the payload dict."""
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth not configured",
        )
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> str:
    """
    FastAPI dependency that extracts and validates the Supabase JWT.
    Returns the user ID (sub claim).
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    payload = _decode_token(credentials.credentials)
    user_id: Optional[str] = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return user_id


async def get_current_user_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> dict:
    """FastAPI dependency that validates Supabase JWT and returns payload."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    return _decode_token(credentials.credentials)


def _extract_user_role(payload: dict) -> str:
    """Extract role from common JWT claim locations used with Supabase."""
    app_metadata = payload.get("app_metadata") or {}
    user_metadata = payload.get("user_metadata") or {}

    role_candidates = [
        payload.get("platform_role"),
        payload.get("role"),
        app_metadata.get("role"),
        user_metadata.get("role"),
        user_metadata.get("subscription_tier"),
    ]

    for role in role_candidates:
        if isinstance(role, str) and role.strip():
            return role.strip().lower()
    return ""


async def require_super_admin(
    payload: dict = Depends(get_current_user_payload),
) -> str:
    """Allow access only to super-admin users via role claims or explicit allowlist."""
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user_role = _extract_user_role(payload)
    if user_role in SUPER_ADMIN_ROLES or user_id in SUPER_ADMIN_USER_IDS:
        return user_id

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient privileges",
    )
