import hmac
import os
from typing import Optional

from fastapi import HTTPException, Query, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from utils.logger import logger

bearer_scheme = HTTPBearer(auto_error=False)


def verify_service_access(
    auth: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
    token: Optional[str] = Query(None, description='Fallback service access token'),
) -> None:
    """Validate service-to-service access token using FastAPI's HTTPBearer or query parameter fallback.

    Compares the Bearer token in the 'Authorization' header or 'token' query parameter
    against the 'SECRET_TOKEN' environment variable.

    :param auth: Optional HTTPAuthorizationCredentials extracted by FastAPI's HTTPBearer.
    :type auth: Optional[HTTPAuthorizationCredentials]
    :param token: Optional fallback service token from query parameters.
    :type token: Optional[str]

    :raises HTTPException: 500 if SECRET_TOKEN is not configured on the server.
    :raises HTTPException: 401 if Authorization token is missing or invalid.
    """
    raw_secret = os.environ.get('SECRET_TOKEN')
    secret_token = raw_secret.strip() if raw_secret else None
    if not secret_token:
        logger.error('SECRET_TOKEN environment variable is not configured')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Server configuration error: SECRET_TOKEN is not configured',
        )

    valid = False
    if auth and auth.credentials and hmac.compare_digest(auth.credentials.strip(), secret_token):
        valid = True
    elif token and isinstance(token, str) and hmac.compare_digest(token.strip(), secret_token):
        valid = True

    if not valid:
        logger.warning('Invalid or missing Authorization token')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or missing Authorization token',
        )