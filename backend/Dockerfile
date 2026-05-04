# Simplified Dockerfile for MegiLance backend with Turso (libSQL)
# Security-hardened production build
# Build context: repo root (when using dockerfile_path: backend/Dockerfile)
FROM python:3.13-slim AS builder

WORKDIR /app

# Install build dependencies including gcc, make for compiling C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 \
    gcc \
    g++ \
    make \
    libc-dev \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final production image
FROM python:3.13-slim

# Security: Disable Python bytecode and buffering
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/home/appuser/.local/bin:$PATH" \
    # Security: Prevent pip from caching
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Create non-root user FIRST for security
RUN useradd -m -u 1000 -s /bin/bash appuser

# Copy installed packages from builder
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Copy application code with proper ownership - from backend subdirectory
COPY --chown=appuser:appuser backend/ .

# Create uploads directory with correct permissions
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app/uploads

# Install libmagic runtime dependency and clean up
RUN apt-get update && apt-get install -y --no-install-recommends libmagic1 && \
    apt-get purge -y --auto-remove && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Switch to non-root user
USER appuser

# Expose port (documentation only)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health/live').read()" || exit 1

# Use uvicorn directly for ASGI app (gunicorn adds unnecessary complexity with ASGI)
# Security: Limit worker processes to 2 per CPU
CMD ["python", "-m", "uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2", \
     "--loop", "uvloop"]