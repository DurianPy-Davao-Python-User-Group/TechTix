import os
from typing import List, Optional

from constants.common_constants import UserRoles
from fastapi import Depends, HTTPException, status
from fastapi_cloudauth import Cognito
from pydantic import BaseModel, Field
from utils.logger import logger


class AccessUser(BaseModel):
    sub: str
    groups: List[str] = Field(default_factory=list, alias='cognito:groups')
    username: Optional[str] = None
    email: Optional[str] = None
    cognito_username: Optional[str] = Field(None, alias='cognito:username')

    def is_admin(self) -> bool:
        admin_roles = {UserRoles.ADMIN.value, UserRoles.SUPER_ADMIN.value}
        return bool(set(self.groups or []).intersection(admin_roles))

    def can_access_email(self, target_email: str) -> bool:
        if self.is_admin():
            return True
        user_identifiers = {
            ident.lower().strip()
            for ident in [self.email, self.username, self.cognito_username]
            if ident
        }
        if target_email.lower().strip() in user_identifiers:
            return True

        if self.sub and not self.email:
            return True
        return False


__auth = Cognito(
    region=os.environ['REGION'],
    userPoolId=os.environ['USER_POOL_ID'],
    client_id=os.environ['USER_POOL_CLIENT_ID'],
)


def get_current_user(
    current_user: AccessUser = Depends(__auth.claim(AccessUser)),
) -> AccessUser:
    """Get the current authenticated user.

    :param current_user: The current user claim from Cognito
    :type current_user: AccessUser

    :raises HTTPException: 401 Unauthorized if token/user is invalid

    :return: The current user
    :rtype: AccessUser
    """
    if not current_user.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid access token',
        )

    os.environ['CURRENT_USER'] = current_user.sub
    is_super_admin = UserRoles.SUPER_ADMIN.value in (current_user.groups or [])
    os.environ['CURRENT_USER_IS_ADMIN'] = str(is_super_admin)
    os.environ['CURRENT_USER_GROUPS'] = ','.join(current_user.groups or [])
    logger.info(f'CurrentUser: {current_user.sub} {current_user.groups}')
    return current_user


def require_roles(*required_roles: UserRoles):
    """Dependency factory for checking user group membership."""
    allowed_roles = {role.value for role in required_roles}

    def role_checker(current_user: AccessUser = Depends(get_current_user)) -> AccessUser:
        user_groups = set(current_user.groups or [])
        if not user_groups.intersection(allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='User is not an admin',
            )
        return current_user

    return role_checker


# Reusable dependencies for routers
is_admin_user = require_roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN)
is_super_admin_user = require_roles(UserRoles.SUPER_ADMIN)