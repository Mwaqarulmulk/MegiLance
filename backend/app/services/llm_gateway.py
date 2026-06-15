import os
import re
import logging
import asyncio
from typing import Optional, List
import httpx
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _resolve_key(value: Optional[str]) -> Optional[str]:
    """Return None if value is missing or an unresolved DO secret placeholder like ${VAR}."""
    if not value:
        return None
    if re.match(r'^\$\{[A-Z0-9_]+\}$', value.strip()):
        return None
    return value


class LLMGateway:
    """Central AI Gateway — DigitalOcean AI (OpenAI-compatible)."""

    def __init__(self):
        settings = get_settings()
        self.do_api_key = _resolve_key(getattr(settings, "do_ai_api_key", None) or os.getenv("DO_AI_API_KEY"))
        self.do_api_base = getattr(settings, "do_ai_api_base", None) or os.getenv("DO_AI_API_BASE", "https://inference.do-ai.run/v1")
        self.do_model = getattr(settings, "do_ai_model", None) or os.getenv("DO_AI_MODEL", "llama3.3-70b-instruct")

        if self.do_api_key:
            self.provider = "digitalocean"
            self.is_active = True
            logger.info(f"✓ LLM Gateway: DigitalOcean AI ({self.do_model})")
        else:
            self.provider = None
            self.is_active = False
            logger.warning("⚠ LLM Gateway: No DO_AI_API_KEY found. Chatbot will use FAQ-only mode.")

    async def get_available_models(self) -> List[str]:
        if not self.is_active:
            return []
        return [self.do_model]

    async def generate_text(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        max_tokens: int = 1500,
        temperature: float = 0.7,
        retries: int = 2,
    ) -> Optional[str]:
        """Generate text using DigitalOcean AI. Returns None on failure for graceful fallback."""
        if not self.is_active:
            logger.warning("LLM Gateway inactive — no API key configured.")
            return None
        return await self._generate_digitalocean(prompt, system_message, max_tokens, temperature, retries)

    async def _generate_digitalocean(
        self,
        prompt: str,
        system_message: Optional[str],
        max_tokens: int,
        temperature: float,
        retries: int,
    ) -> Optional[str]:
        if not self.do_api_key:
            return None

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        f"{self.do_api_base}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.do_api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": self.do_model,
                            "messages": messages,
                            "max_tokens": max_tokens,
                            "temperature": temperature,
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        choices = data.get("choices", [])
                        if choices:
                            text = choices[0].get("message", {}).get("content", "").strip()
                            if text:
                                return text
                    if resp.status_code >= 500 and attempt < retries:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    logger.error(f"DigitalOcean API error (attempt {attempt+1}): {resp.status_code}")
                    return None
            except httpx.ConnectError as e:
                logger.warning(f"DO AI connect error (attempt {attempt+1}): {e}")
                if attempt < retries:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return None
            except Exception as e:
                logger.error(f"DO AI error (attempt {attempt+1}): {type(e).__name__}: {e}")
                if attempt < retries:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return None
        return None


llm_gateway = LLMGateway()
