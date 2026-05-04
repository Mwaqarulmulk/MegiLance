"""
@AI-HINT: Standardized API response helpers for consistent error handling and response formatting.
Provides type-safe response builders and error formatters across all endpoints.
"""

from typing import Any, Dict, List, Optional, TypeVar, Generic
from pydantic import BaseModel
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime, timezone


# Generic type for data
T = TypeVar('T')


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""
    success: bool
    message: str
    data: Optional[T] = None
    timestamp: str = None
    
    def __init__(self, **data):
        if 'timestamp' not in data or data['timestamp'] is None:
            data['timestamp'] = datetime.now(timezone.utc).isoformat()
        super().__init__(**data)


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper for list endpoints."""
    success: bool = True
    data: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


class ErrorDetail(BaseModel):
    """Detailed error information."""
    code: str
    message: str
    field: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: ErrorDetail
    timestamp: str = None
    
    def __init__(self, **data):
        if 'timestamp' not in data or data['timestamp'] is None:
            data['timestamp'] = datetime.now(timezone.utc).isoformat()
        super().__init__(**data)


# Error codes
class ErrorCodes:
    """Standardized error codes for consistent client handling."""
    # Authentication & Authorization
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    SESSION_EXPIRED = "SESSION_EXPIRED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    ACCOUNT_DISABLED = "ACCOUNT_DISABLED"
    
    # Validation
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_FIELD = "MISSING_FIELD"
    INVALID_FORMAT = "INVALID_FORMAT"
    
    # Resource
    NOT_FOUND = "NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    CONFLICT = "CONFLICT"
    
    # Rate Limiting
    RATE_LIMITED = "RATE_LIMITED"
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"
    
    # Server
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    DATABASE_ERROR = "DATABASE_ERROR"
    
    # Business Logic
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
    PROPOSAL_ALREADY_EXISTS = "PROPOSAL_ALREADY_EXISTS"
    CONTRACT_NOT_ACTIVE = "CONTRACT_NOT_ACTIVE"
    MILESTONE_NOT_PENDING = "MILESTONE_NOT_PENDING"


def success_response(
    data: Any = None,
    message: str = "Success"
) -> Dict[str, Any]:
    """Create a success response."""
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def error_response(
    code: str,
    message: str,
    field: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> JSONResponse:
    """Create an error response."""
    content = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "field": field,
            "details": details
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    return JSONResponse(status_code=status_code, content=content)


def paginated_response(
    data: List[Any],
    total: int,
    page: int,
    page_size: int
) -> Dict[str, Any]:
    """Create a paginated response."""
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return {
        "success": True,
        "data": data,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# Common HTTP exceptions with standardized format
class APIException(HTTPException):
    """Base API exception with standardized format."""
    
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        detail = {
            "code": code,
            "message": message,
            "field": field,
            "details": details
        }
        super().__init__(status_code=status_code, detail=detail)


class BadRequestException(APIException):
    """400 Bad Request with details."""
    
    def __init__(
        self,
        message: str,
        code: str = ErrorCodes.VALIDATION_ERROR,
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=code,
            message=message,
            field=field,
            details=details
        )


class UnauthorizedException(APIException):
    """401 Unauthorized."""
    
    def __init__(
        self,
        message: str = "Authentication required",
        code: str = ErrorCodes.UNAUTHORIZED
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=code,
            message=message
        )


class ForbiddenException(APIException):
    """403 Forbidden."""
    
    def __init__(
        self,
        message: str = "Access denied",
        code: str = ErrorCodes.FORBIDDEN
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code=code,
            message=message
        )


class NotFoundException(APIException):
    """404 Not Found."""
    
    def __init__(
        self,
        resource: str = "Resource",
        resource_id: Optional[Any] = None
    ):
        message = f"{resource} not found"
        if resource_id:
            message = f"{resource} with ID {resource_id} not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code=ErrorCodes.NOT_FOUND,
            message=message
        )


class ConflictException(APIException):
    """409 Conflict."""
    
    def __init__(
        self,
        message: str,
        code: str = ErrorCodes.CONFLICT,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code=code,
            message=message,
            details=details
        )


class RateLimitException(APIException):
    """429 Too Many Requests."""
    
    def __init__(
        self,
        message: str = "Too many requests. Please try again later.",
        retry_after: Optional[int] = None
    ):
        details = {"retry_after": retry_after} if retry_after else None
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code=ErrorCodes.RATE_LIMITED,
            message=message,
            details=details
        )


class ServiceUnavailableException(APIException):
    """503 Service Unavailable."""
    
    def __init__(
        self,
        message: str = "Service temporarily unavailable",
        code: str = ErrorCodes.SERVICE_UNAVAILABLE
    ):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code=code,
            message=message
        )


# Validation helpers
def validate_required(value: Any, field_name: str) -> None:
    """Validate that a required field is present."""
    if value is None or (isinstance(value, str) and not value.strip()):
        raise BadRequestException(
            message=f"{field_name} is required",
            code=ErrorCodes.MISSING_FIELD,
            field=field_name
        )


def validate_length(
    value: str,
    field_name: str,
    min_length: Optional[int] = None,
    max_length: Optional[int] = None
) -> None:
    """Validate string length."""
    if min_length and len(value) < min_length:
        raise BadRequestException(
            message=f"{field_name} must be at least {min_length} characters",
            code=ErrorCodes.VALIDATION_ERROR,
            field=field_name,
            details={"min_length": min_length, "actual_length": len(value)}
        )
    if max_length and len(value) > max_length:
        raise BadRequestException(
            message=f"{field_name} must be at most {max_length} characters",
            code=ErrorCodes.VALIDATION_ERROR,
            field=field_name,
            details={"max_length": max_length, "actual_length": len(value)}
        )


def validate_range(
    value: float,
    field_name: str,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None
) -> None:
    """Validate numeric range."""
    if min_val is not None and value < min_val:
        raise BadRequestException(
            message=f"{field_name} must be at least {min_val}",
            code=ErrorCodes.VALIDATION_ERROR,
            field=field_name,
            details={"min": min_val, "actual": value}
        )
    if max_val is not None and value > max_val:
        raise BadRequestException(
            message=f"{field_name} must be at most {max_val}",
            code=ErrorCodes.VALIDATION_ERROR,
            field=field_name,
            details={"max": max_val, "actual": value}
        )
