# @AI-HINT: Pydantic schemas for email verification API requests and responses

from pydantic import BaseModel, ConfigDict, Field


class EmailVerificationRequest(BaseModel):
    """Request to verify email with token"""
    token: str = Field(..., min_length=10, description="Verification token from email")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
        }
    })


class EmailVerificationResponse(BaseModel):
    """Response after email verification"""
    message: str = Field(..., description="Success or error message")
    email_verified: bool = Field(..., description="Whether email is now verified")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "message": "Email verified successfully",
            "email_verified": True
        }
    })


class ResendVerificationRequest(BaseModel):
    """Request to resend verification email (no body needed, uses auth)"""
    pass


class ResendVerificationResponse(BaseModel):
    """Response after resending verification email"""
    message: str = Field(..., description="Confirmation message")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "message": "Verification email sent successfully"
        }
    })
