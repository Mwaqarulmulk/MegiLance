# @AI-HINT: Pydantic schemas for password reset API requests and responses

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ForgotPasswordRequest(BaseModel):
    """Request to initiate password reset"""
    email: EmailStr = Field(..., description="Email address of account to reset")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email": "user@example.com"
        }
    })


class ForgotPasswordResponse(BaseModel):
    """Response after requesting password reset"""
    message: str = Field(..., description="Confirmation message")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "message": "If an account with that email exists, a password reset link has been sent."
        }
    })


class ResetPasswordRequest(BaseModel):
    """Request to reset password with token"""
    token: str = Field(..., min_length=10, description="Reset token from email")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
            "new_password": "NewSecurePassword123!"
        }
    })


class ResetPasswordResponse(BaseModel):
    """Response after successful password reset"""
    message: str = Field(..., description="Success message")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "message": "Password reset successfully. You can now log in with your new password."
        }
    })


class ValidateResetTokenRequest(BaseModel):
    """Request to validate a reset token"""
    token: str = Field(..., min_length=10, description="Reset token to validate")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
        }
    })


class ValidateResetTokenResponse(BaseModel):
    """Response showing if token is valid"""
    valid: bool = Field(..., description="Whether token is valid and not expired")
    message: str = Field(..., description="Validation message")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "valid": True,
            "message": "Token is valid"
        }
    })
