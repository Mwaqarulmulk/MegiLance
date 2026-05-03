# Manual AI Service Deployment Steps for DigitalOcean

Due to CLI spec validation issues, here are the manual steps to add the AI service to your existing MegiLance app on DigitalOcean App Platform:

## Option 1: Via DigitalOcean Web Dashboard (RECOMMENDED)

1.  **Go to your App**: https://cloud.digitalocean.com/apps/c11a4609-da2f-4a63-bbe4-bebc5829c54d

2.  **Add New Component**:
    - Click "Components" tab
    - Click "Create Component" → "From Source Code"
    - Select your repo: `Mwaqarulmulk/MegiLance`
    - Branch: `main`
    - Source Directory: `ai`
    - Dockerfile Path: `ai/Dockerfile`

3.  **Configure the AI Service**:
    - Name: `ai-service`
    - HTTP Port: `8001`
    - Instance Size: **Basic ($12/mo)** or Professional XS ($24/mo) for more RAM
    - Instance Count: `1`
    - HTTP Routes: **Leave empty** (internal service only)

4.  **Add Environment Variables**:
    ```
    PORT = 8001
    ML_WORKERS = 1
    CORS_ORIGINS = *
    ```

5.  **Configure Health Check**:
    - HTTP Path: `/health`
    - Initial Delay: `120` seconds
    - Period: `30` seconds
    - Timeout: `10` seconds
    - Success Threshold: `1`
    - Failure Threshold: `5`

6.  **Update Backend Service**:
    - Go to "backend" component settings
    - Add environment variable:
      ```
      AI_SERVICE_URL = http://ai-service:8001
      ```

7.  **Deploy**: Click "Save" and let it deploy.

## Option 2: Push Config to GitHub

1.  **Commit the working spec**:
    ```powershell
    git add do-app-spec-deploy.yaml
    git add ai/
    git commit -m "Add AI service for chatbot"
    git push origin main
    ```

2.  **Manually trigger deployment** via the DO dashboard or wait for auto-deploy.

## Expected Costs

- Frontend: $5/mo (Basic XS)
- Backend: $12/mo (Basic S)
- AI Service: $12/mo (Basic S) - **Minimum for ML models**
- Total: ~$29/mo

## Troubleshooting

If AI service fails with OOM (Out of Memory):
1.  Upgrade AI service to "Professional XS" ($24/mo) which has 2GB RAM
2.  Or optimize models by using even smaller variants

## Verification

Once deployed, check:
1.  All 3 services show "Active" status
2.  Backend logs show: `AI Service connected at http://ai-service:8001`
3.  Visit: https://megilance.site/ai/chatbot
4.  Test the chatbot - it should respond with AI-generated answers

## Alternative: Free Tier Option

If you want to keep it FREE or very low cost:
1.  Host ONLY the AI service on **Hugging Face Spaces** (Free tier)
2.  Change `AI_SERVICE_URL` in backend to point to your HF Space URL
3.  Keep Frontend + Backend on DigitalOcean ($17/mo total)

Would you like me to create a Hugging Face Space deployment guide instead?
