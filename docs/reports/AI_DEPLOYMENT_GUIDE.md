# AI Service Deployment Guide (DigitalOcean App Platform)

This guide explains how to deploy the MegiLance AI Service alongside the Backend and Frontend on DigitalOcean App Platform.

## Deployment Strategy

We have updated the `do-app-spec-unified.yaml` to include the `ai-service` as a separate component within the same App.

### Architecture
- **Frontend**: Next.js 14 (Port 3000)
- **Backend**: FastAPI (Port 8000)
- **AI Service**: FastAPI + Transformers (Port 8001)
- **Database**: Turso (External)

### Communication
- The **Backend** communicates with the **AI Service** internally using the hostname `http://ai-service:8001`.
- This internal traffic is free and fast within the App Platform.
- The AI Service is NOT exposed publicly to the internet (it has no routes defined in the spec), which is good for security. Only the backend can talk to it.

## Resource Requirements & Costs

### Important Note on RAM
The AI Service loads Machine Learning models (`distilgpt2` and `distilbert`) into memory.
- **Minimum Requirement**: 1GB RAM (`basic-xs` instance).
- **Recommended**: 2GB RAM (`basic-s` or higher) for better stability.

In the configuration, we have set it to `basic-xs` ($5/month) to keep costs low, but if you experience "Out of Memory" (OOM) crashes, you will need to upgrade this specific component to a larger size.

### Estimated Cost (Monthly)
- **Frontend**: $5 (Basic XS)
- **Backend**: $5 (Basic XS)
- **AI Service**: $5 (Basic XS)
- **Database**: Free (Turso Free Tier)
- **Total**: ~$15/month

*Note: DigitalOcean prices are subject to change.*

## How to Deploy

1.  **Commit Changes**:
    Ensure the updated `do-app-spec-unified.yaml` and `ai/Dockerfile` are committed to your GitHub repository.

2.  **Update App Spec**:
    If you already have the app running on DigitalOcean:
    - Go to your App Dashboard.
    - Settings -> App Spec.
    - Upload or paste the content of `do-app-spec-unified.yaml`.
    - Save. DigitalOcean will detect the new service and deploy it.

3.  **Verify Deployment**:
    - Check the "Deployment Logs" for the `ai-service`.
    - Look for "Application startup complete" and "Models loaded".
    - If the build fails or the service crashes immediately, check for OOM errors and consider upgrading the instance size.

## Alternative: "0 Cost" Deployment?

Running ML models requires computation and memory, which is rarely free in cloud environments.
- **DigitalOcean App Platform**: No free tier for backend services (only static sites).
- **Render / Railway**: Have free tiers, but they often spin down (sleep) and have very low RAM limits (512MB), which might not be enough for these models.
- **Hugging Face Spaces**: You could host *just* the AI part on a free Hugging Face Space (CPU Basic) and point your DigitalOcean backend to it.
    - **Pros**: Free.
    - **Cons**: Slower, "Cold starts" (pauses when not used), public URL management.

### Recommendation
For a production-like experience, the $5/month DigitalOcean component is the most reliable "low cost" option.
