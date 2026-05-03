# @AI-HINT: Dockerfile for Advanced AI Service - Digital Ocean & HuggingFace compatible
# Build context: repo root (when using dockerfile_path: ai/Dockerfile)
FROM python:3.10-slim

WORKDIR /app

# Install curl for health checks and build essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements from ai subdirectory (build context is repo root)
COPY ai/requirements.txt requirements.txt

# Install Python dependencies
# Note: Using CPU version of PyTorch to save space/memory
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy application code from ai subdirectory
COPY ai/ .

# Create a non-root user for security
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PORT=${PORT:-8001}

# Expose the port (default 8001 for DO, 7860 for HF)
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:${PORT:-8001}/health || exit 1

# Run the advanced application with dynamic port
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8001}"]