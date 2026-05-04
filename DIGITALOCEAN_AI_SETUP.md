# DigitalOcean AI API Setup Guide - Complete Fix

## ✅ What Was Fixed

### 1. **Removed All OpenAI Dependencies**
- ❌ Deleted litellm fallback configurations
- ❌ Removed OPENAI_API_KEY checks
- ❌ Removed custom_llm_provider = "openai" that was causing authentication errors
- ✅ Now uses **DigitalOcean's LLM API EXCLUSIVELY**

### 2. **Updated Files**

#### `backend/app/services/llm_gateway.py` (COMPLETE REWRITE)
- **Old**: Used litellm with OpenAI fallback, causing "AuthenticationError"
- **New**: Direct HTTP client (httpx) to DigitalOcean API
- **Features**:
  - No external dependencies (httpx already in requirements.txt)
  - Direct API calls to DigitalOcean inference endpoint
  - Exponential backoff retry logic (2, 4, 8 seconds)
  - Proper error handling and logging

#### `backend/.env`
- **Added**: `DO_AI_API_KEY`, `DO_AI_API_BASE`, `DO_AI_MODEL`
- **Removed**: OPENAI_API_KEY dependency

#### `backend/app/core/config.py`
- **Updated**: Replaced `openai_api_key` with `do_ai_*` configurations
- **Removed**: OpenAI references

---

## 🔧 Required Configuration

### Step 1: Get DigitalOcean AI API Key

1. Go to: https://cloud.digitalocean.com/account/api/
2. Click **"Generate New Token"**
3. Name it: `megilance-llm-api-token`
4. Select scope: `read` and `write`
5. Copy the token (save securely!)

### Step 2: Update .env File

Open `backend/.env` and replace this line:
```
DO_AI_API_KEY=sk-doa2_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

With your actual token:
```
DO_AI_API_KEY=sk-doa2_YOUR_ACTUAL_TOKEN_HERE
```

### Step 3: Verify DigitalOcean Model Name

Check available models at: https://docs.digitalocean.com/products/ai-platform/

Default model (already configured):
```
DO_AI_MODEL=llama3.3-70b-instruct
```

If you want a different model, update accordingly.

---

## 🚀 Testing the Fix

### Local Development

1. **Restart the backend server**:
   ```bash
   cd backend
   python -m uvicorn main:app --reload --port 8000
   ```

2. **Check logs for confirmation**:
   ```
   ✓ DigitalOcean AI Gateway initialized with model: llama3.3-70b-instruct
   ```

3. **Test the chatbot endpoint**:
   ```bash
   # Start a conversation
   curl -X POST http://localhost:8000/api/chatbot/start \
     -H "Content-Type: application/json"
   
   # Get the conversation_id from response
   # Send a message
   curl -X POST http://localhost:8000/api/chatbot/{conversation_id}/message \
     -H "Content-Type: application/json" \
     -d '{"message": "what you can do for me"}'
   ```

4. **Expected Response**:
   - ✅ Chatbot responds with helpful text
   - ❌ No more "Error generating response from AI"
   - ❌ No more "Unable to authenticate you" errors

### DigitalOcean Live Deployment

1. **Update environment variables in DigitalOcean Dashboard**:
   - Go to App Platform → Your App → Settings → Environment
   - Add/update: `DO_AI_API_KEY=sk-doa2_YOUR_TOKEN`
   - Deploy changes

2. **Monitor logs**:
   ```bash
   doctl apps log your-app-id --type build
   doctl apps log your-app-id --type run
   ```

3. **Verify health**:
   ```bash
   curl https://api.megilance.site/api/health/ready
   ```

---

## 🔍 Troubleshooting

### Issue: "AI service not configured"
**Solution**: `DO_AI_API_KEY` is missing or empty in .env
```bash
# Verify the key is set
echo $DO_AI_API_KEY  # Should show: sk-doa2_xxx...
```

### Issue: 401 Unauthorized from DigitalOcean
**Solution**: API token is invalid or expired
- Generate a new token at: https://cloud.digitalocean.com/account/api/
- Update `DO_AI_API_KEY` in .env

### Issue: Model not found
**Solution**: Model name is incorrect
- Check available models: https://docs.digitalocean.com/products/ai-platform/
- Update `DO_AI_MODEL` in .env

### Issue: "All retry attempts failed"
**Solution**: API endpoint is unreachable
- Verify: `DO_AI_API_BASE=https://inference.do-ai.run/v1`
- Check DigitalOcean status: https://status.digitalocean.com/

---

## 📊 Model Details

### Llama 3.3 70B Instruct (Recommended)
- **Model**: `llama3.3-70b-instruct`
- **Provider**: Meta (via DigitalOcean)
- **Speed**: Fast, suitable for chatbots
- **Quality**: High quality responses
- **Cost**: DigitalOcean pricing

### Alternative Models (if needed)
```
# Mistral
DO_AI_MODEL=mistral-7b-instruct

# Llama 3 8B
DO_AI_MODEL=llama-3-8b-instruct

# Llama 2 70B
DO_AI_MODEL=llama-2-70b-instruct
```

---

## 📝 Code Changes Summary

### Before (❌ Broken):
```python
# litellm with OpenAI fallback - CAUSED AUTHENTICATION ERRORS
kwargs["custom_llm_provider"] = "openai"
response = await litellm.acompletion(**kwargs)
```

### After (✅ Fixed):
```python
# Direct HTTP to DigitalOcean - NO FALLBACK
async with httpx.AsyncClient(timeout=30.0) as client:
    response = await client.post(
        f"{self.do_api_base}/chat/completions",
        headers={"Authorization": f"Bearer {self.do_api_key}"}
    )
```

---

## ✅ Verification Checklist

- [ ] DO_AI_API_KEY is set in .env
- [ ] Backend logs show "✓ DigitalOcean AI Gateway initialized"
- [ ] Chatbot /start endpoint returns 200 with conversation_id
- [ ] Chatbot /message endpoint returns AI response (not error)
- [ ] No "Unable to authenticate you" errors in logs
- [ ] No "Error generating response from AI" in UI

---

## 🆘 Need Help?

1. Check logs: `docker compose logs backend -f`
2. Verify token: https://cloud.digitalocean.com/account/api/
3. Test endpoint directly with curl
4. Check DigitalOcean status page

**No more OpenAI anywhere in the project! 🎉**
