from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(min_length=10)


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None
    iat: Optional[int] = None
    nbf: Optional[int] = None
    jti: Optional[str] = None


class AuthResponse(Token):
    user: UserRead
