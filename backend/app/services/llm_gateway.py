import os
import logging
import asyncio
from typing import Optional, Dict, Any, List
import httpx
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class LLMGateway:
    """Advanced Central AI Gateway using DigitalOcean AI API exclusively."""

    def __init__(self):
        settings = get_settings()
        # DigitalOcean AI configuration (REQUIRED - NO FALLBACKS)
        self.do_api_key = settings.do_ai_api_key or os.getenv("DO_AI_API_KEY")
        self.do_api_base = settings.do_ai_api_base or os.getenv("DO_AI_API_BASE", "https://inference.do-ai.run/v1")
        self.do_model = settings.do_ai_model or os.getenv("DO_AI_MODEL", "llama3.3-70b-instruct")

        if not self.do_api_key:
            logger.error("❌ DO_AI_API_KEY not set! DigitalOcean AI is REQUIRED for chatbot functionality.")
            self.is_active = False
        else:
            logger.info(f"✓ DigitalOcean AI Gateway initialized with model: {self.do_model}")
            self.is_active = True

    async def get_available_models(self) -> List[str]:
        """Return available models from DigitalOcean."""
        if not self.is_active:
            return []
        return [self.do_model]

    async def generate_text(
        self, 
        prompt: str, 
        system_message: Optional[str] = None, 
        max_tokens: int = 1500, 
        temperature: float = 0.7, 
        retries: int = 3
    ) -> Optional[str]:
        """Generate text using DigitalOcean LLM API. Returns None on failure for graceful fallback."""
        if not self.is_active:
            logger.warning("AI service not configured. Set DO_AI_API_KEY environment variable.")
            return None

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    # Call DigitalOcean LLM API (OpenAI-compatible)
                    response = await client.post(
                        f"{self.do_api_base}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.do_api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": self.do_model,
                            "messages": messages,
                            "max_tokens": max_tokens,
                            "temperature": temperature
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("choices") and len(data["choices"]) > 0:
                            content = data["choices"][0].get("message", {}).get("content", "").strip()
                            if content:
                                logger.debug(f"LLM response generated (attempt {attempt+1})")
                                return content
                    
                    if response.status_code >= 500 and attempt < retries:
                        await asyncio.sleep(2 ** attempt)
                        continue
                        
                    logger.error(f"DigitalOcean API error (attempt {attempt+1}): {response.status_code}")
                    return None
                        
            except httpx.ConnectError as e:
                logger.warning(f"AI service connection error (attempt {attempt+1}): {e}")
                if attempt < retries:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return None
            except Exception as e:
                logger.error(f"LLM Generation Error on attempt {attempt+1}: {type(e).__name__}: {e}")
                if attempt < retries:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return None

        logger.error("All retry attempts failed for LLM generation")
        return None


llm_gateway = LLMGateway()
