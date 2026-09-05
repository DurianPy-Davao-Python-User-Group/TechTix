import hmac
import os
from typing import Optional

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from utils.logger import logger

bearer_scheme = HTTPBearer(auto_error=False)


def verify_service_access(
    auth: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> None:
    """Validate service-to-service access token using FastAPI's HTTPBearer.

    Compares the Bearer token in the 'Authorization' header against
    the 'SECRET_TOKEN' environment variable.

    :param auth: Optional HTTPAuthorizationCredentials extracted by FastAPI's HTTPBearer.
    :type auth: Optional[HTTPAuthorizationCredentials]

    :raises HTTPException: 500 if SECRET_TOKEN is not configured on the server.
    :raises HTTPException: 401 if Authorization Bearer token is missing or invalid.
    """
    raw_secret = os.environ.get('SECRET_TOKEN')
    secret_token = raw_secret.strip() if raw_secret else None
    if not secret_token:
        logger.error('SECRET_TOKEN environment variable is not configured')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Server configuration error: SECRET_TOKEN is not configured',
        )

    if not auth or not auth.credentials or not hmac.compare_digest(auth.credentials.strip(), secret_token):
        logger.warning('Invalid or missing Authorization header')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or missing Authorization token',
        )