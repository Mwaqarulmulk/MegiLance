# Multi-stage production Dockerfile for MegiLance backend
# Supports both PostgreSQL (dev) and Oracle Autonomous Database (production)
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    wget \
    unzip \
    libaio-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Oracle Instant Client (required for cx_Oracle)
RUN wget -q https://download.oracle.com/otn_software/linux/instantclient/2113000/instantclient-basic-linux.x64-21.13.0.0.0dbru.zip && \
    unzip instantclient-basic-linux.x64-21.13.0.0.0dbru.zip -d /opt/oracle && \
    rm instantclient-basic-linux.x64-21.13.0.0.0dbru.zip && \
    echo /opt/oracle/instantclient_21_13 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    libaio-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Oracle Instant Client from builder
COPY --from=builder /opt/oracle /opt/oracle
COPY --from=builder /etc/ld.so.conf.d/oracle-instantclient.conf /etc/ld.so.conf.d/
RUN ldconfig

# Copy Python packages from builder
COPY --from=builder /usr/local /usr/local

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Make sure scripts in .local are usable
ENV PATH=/usr/local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Oracle environment variables
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_13
ENV ORACLE_HOME=/opt/oracle/instantclient_21_13
ENV TNS_ADMIN=/app/oracle-wallet

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Use gunicorn with uvicorn workers for production
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-"]