import os
import re
import json
import logging
import asyncio
from typing import Optional, List, Dict, Any, Iterable
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


# ──────────────────────────────────────────────────────────────────────────────
# Task → model routing.
#
# IMPORTANT: only DigitalOcean-hosted open models are reachable on our gateway
# subscription. Real OpenAI (gpt-*) and Anthropic (claude-*) models are listed
# by /models but return 403 on our key, so they are intentionally NOT used here.
# Each task lists models in preference order; the gateway falls through to the
# next one if a model errors, and finally to the configured default model.
#
# Verified working (HTTP 200 + content) on 2026-06: deepseek-v4-pro,
# deepseek-4-flash, deepseek-3.2, kimi-k2.6, qwen3.5-397b-a17b, qwen3-coder-flash,
# glm-5, minimax-m2.5, nemotron-3-ultra-550b, mistral-3-14B, gemma-4-31B-it,
# llama-4-maverick, llama3.3-70b-instruct, openai-gpt-oss-120b/20b,
# router:general/writing/software-engineering. Embeddings: bge-m3 (+others).
# Reranker: bge-reranker-v2-m3.
# ──────────────────────────────────────────────────────────────────────────────

TASK_MODELS: Dict[str, List[str]] = {
    # Deep analysis / judgement (rate advice, fraud narratives, risk reasoning)
    "reasoning": ["deepseek-v4-pro", "qwen3.5-397b-a17b", "llama3.3-70b-instruct"],
    # Low-latency conversational / extraction
    "fast": ["deepseek-4-flash", "gemma-4-31B-it", "llama3.3-70b-instruct"],
    # Long-form, polished prose (proposals, summaries, emails)
    "writing": ["router:writing", "kimi-k2.6", "llama3.3-70b-instruct"],
    # Code-heavy tasks
    "coding": ["qwen3-coder-flash", "router:software-engineering", "deepseek-v4-pro"],
    # Cheap deterministic classification / labelling
    "classify": ["llama3.3-70b-instruct", "gemma-4-31B-it"],
    # Chatbot reasoning and support automation
    "chatbot": ["deepseek-v4-pro", "qwen3.5-397b-a17b", "llama3.3-70b-instruct"],
    # General default
    "general": ["router:general", "llama3.3-70b-instruct"],
}

DEFAULT_EMBED_MODEL = "bge-m3"
DEFAULT_RERANK_MODEL = "bge-reranker-v2-m3"


class LLMGateway:
    """Central AI Gateway — DigitalOcean AI (OpenAI-compatible).

    Multi-model: routes each request to the most suitable *working* model for the
    task, with automatic fall-through. Exposes chat (sync + async), JSON-mode
    chat, embeddings and reranking. Always degrades gracefully (returns None /
    empty) so callers can fall back to deterministic logic.
    """

    def __init__(self):
        settings = get_settings()
        self.do_api_key = _resolve_key(getattr(settings, "do_ai_api_key", None) or os.getenv("DO_AI_API_KEY"))
        self.do_api_base = getattr(settings, "do_ai_api_base", None) or os.getenv("DO_AI_API_BASE", "https://inference.do-ai.run/v1")
        # Backwards-compatible single default model (still referenced elsewhere).
        self.do_model = getattr(settings, "do_ai_model", None) or os.getenv("DO_AI_MODEL", "llama3.3-70b-instruct")

        # DigitalOcean GenAI Agent & Knowledge Base configuration
        self.do_ai_agent_endpoint = _resolve_key(getattr(settings, "do_ai_agent_endpoint", None) or os.getenv("DO_AI_AGENT_ENDPOINT"))
        self.do_ai_agent_key = _resolve_key(getattr(settings, "do_ai_agent_key", None) or os.getenv("DO_AI_AGENT_KEY") or self.do_api_key)
        self.do_ai_kb_id = _resolve_key(getattr(settings, "do_ai_kb_id", None) or os.getenv("DO_AI_KB_ID"))

        if self.do_api_key:
            self.provider = "digitalocean"
            self.is_active = True
            logger.info(f"✓ LLM Gateway: DigitalOcean AI (default={self.do_model}, multi-model routing enabled)")
            if self.do_ai_agent_endpoint:
                logger.info(f"✓ LLM Gateway Agent: Deployed Agent at {self.do_ai_agent_endpoint}")
            if self.do_ai_kb_id:
                logger.info(f"✓ LLM Gateway KB: Deployed Knowledge Base ID {self.do_ai_kb_id}")
        else:
            self.provider = None
            self.is_active = False
            logger.warning("⚠ LLM Gateway: No DO_AI_API_KEY found. AI features will use deterministic fallbacks.")

    # ── model selection ─────────────────────────────────────────────────────
    def models_for(self, task: str) -> List[str]:
        """Ordered candidate models for a task, always ending with the safe default."""
        chain = list(TASK_MODELS.get(task, TASK_MODELS["general"]))
        if self.do_model not in chain:
            chain.append(self.do_model)
        return chain

    # ── headers ──────────────────────────────────────────────────────────────
    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.do_api_key}", "Content-Type": "application/json"}

    # ── async chat ─────────────────────────────────────────────────────────
    async def chat(
        self,
        messages: List[Dict[str, str]],
        task: str = "general",
        model: Optional[str] = None,
        max_tokens: int = 1200,
        temperature: float = 0.7,
        json_mode: bool = False,
        retries: int = 1,
    ) -> Optional[str]:
        """Run a chat completion. Returns content string, or None on total failure."""
        if not self.is_active:
            return None
        candidates = [model] if model else self.models_for(task)
        for mdl in candidates:
            payload: Dict[str, Any] = {
                "model": mdl,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}
            for attempt in range(retries + 1):
                try:
                    async with httpx.AsyncClient(timeout=45.0) as client:
                        resp = await client.post(
                            f"{self.do_api_base}/chat/completions",
                            headers=self._headers(),
                            json=payload,
                        )
                    if resp.status_code == 200:
                        content = (
                            resp.json().get("choices", [{}])[0].get("message", {}).get("content") or ""
                        ).strip()
                        if content:
                            return content
                        break  # empty content — try next model
                    if resp.status_code in (403, 404):
                        logger.warning(f"LLM model unavailable on key: {mdl} ({resp.status_code}); trying next")
                        break  # don't retry, switch model
                    if resp.status_code >= 500 and attempt < retries:
                        await asyncio.sleep(1.5 * (attempt + 1))
                        continue
                    logger.error(f"LLM chat error {resp.status_code} on {mdl}: {resp.text[:160]}")
                    break
                except Exception as e:
                    logger.warning(f"LLM chat exception on {mdl} (attempt {attempt+1}): {type(e).__name__}: {e}")
                    if attempt < retries:
                        await asyncio.sleep(1.0)
                        continue
                    break
        return None

    async def chat_json(
        self,
        messages: List[Dict[str, str]],
        task: str = "reasoning",
        max_tokens: int = 1200,
        temperature: float = 0.3,
    ) -> Optional[dict]:
        """Chat that returns parsed JSON. Tries JSON mode, then best-effort extraction."""
        raw = await self.chat(messages, task=task, max_tokens=max_tokens, temperature=temperature, json_mode=True)
        if not raw:
            raw = await self.chat(messages, task=task, max_tokens=max_tokens, temperature=temperature)
        return _extract_json(raw)

    # ── sync chat (for non-async routers) ────────────────────────────────────
    def chat_sync(
        self,
        messages: List[Dict[str, str]],
        task: str = "general",
        model: Optional[str] = None,
        max_tokens: int = 1200,
        temperature: float = 0.7,
        json_mode: bool = False,
    ) -> Optional[str]:
        if not self.is_active:
            return None
        candidates = [model] if model else self.models_for(task)
        for mdl in candidates:
            payload: Dict[str, Any] = {
                "model": mdl,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}
            try:
                with httpx.Client(timeout=45.0) as client:
                    resp = client.post(
                        f"{self.do_api_base}/chat/completions",
                        headers=self._headers(),
                        json=payload,
                    )
                if resp.status_code == 200:
                    content = (
                        resp.json().get("choices", [{}])[0].get("message", {}).get("content") or ""
                    ).strip()
                    if content:
                        return content
                elif resp.status_code in (403, 404):
                    continue
                else:
                    logger.error(f"LLM chat_sync {resp.status_code} on {mdl}: {resp.text[:160]}")
            except Exception as e:
                logger.warning(f"LLM chat_sync exception on {mdl}: {type(e).__name__}: {e}")
        return None

    def chat_json_sync(
        self,
        messages: List[Dict[str, str]],
        task: str = "reasoning",
        max_tokens: int = 1200,
        temperature: float = 0.3,
    ) -> Optional[dict]:
        raw = self.chat_sync(messages, task=task, max_tokens=max_tokens, temperature=temperature, json_mode=True)
        if not raw:
            raw = self.chat_sync(messages, task=task, max_tokens=max_tokens, temperature=temperature)
        return _extract_json(raw)

    # ── embeddings ───────────────────────────────────────────────────────────
    async def embed(self, texts: Iterable[str], model: str = DEFAULT_EMBED_MODEL) -> List[List[float]]:
        if not self.is_active:
            return []
        items = list(texts)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{self.do_api_base}/embeddings",
                    headers=self._headers(),
                    json={"model": model, "input": items},
                )
            if resp.status_code == 200:
                data = resp.json().get("data", [])
                return [d.get("embedding", []) for d in data]
            logger.error(f"Embeddings error {resp.status_code}: {resp.text[:160]}")
        except Exception as e:
            logger.warning(f"Embeddings exception: {type(e).__name__}: {e}")
        return []

    # ── rerank ─────────────────────────────────────────────────────────────
    async def rerank(
        self, query: str, documents: List[str], model: str = DEFAULT_RERANK_MODEL, top_n: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Return [{'index', 'relevance_score'}] sorted best-first. Empty on failure."""
        if not self.is_active or not documents:
            return []
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{self.do_api_base}/rerank",
                    headers=self._headers(),
                    json={"model": model, "query": query, "documents": documents},
                )
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                results.sort(key=lambda r: r.get("relevance_score", 0), reverse=True)
                return results[:top_n] if top_n else results
            logger.error(f"Rerank error {resp.status_code}: {resp.text[:160]}")
        except Exception as e:
            logger.warning(f"Rerank exception: {type(e).__name__}: {e}")
        return []

    # ── backwards-compatible helpers ─────────────────────────────────────────
    async def get_available_models(self) -> List[str]:
        if not self.is_active:
            return []
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(f"{self.do_api_base}/models", headers=self._headers())
            if resp.status_code == 200:
                return [m.get("id") for m in resp.json().get("data", [])]
        except Exception:
            pass
        return [self.do_model]

    async def generate_text(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        max_tokens: int = 1500,
        temperature: float = 0.7,
        retries: int = 2,
        task: str = "general",
    ) -> Optional[str]:
        """Generate text. Kept for backward compatibility; now task-routed."""
        if not self.is_active:
            logger.warning("LLM Gateway inactive — no API key configured.")
            return None
        messages: List[Dict[str, str]] = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        return await self.chat(messages, task=task, max_tokens=max_tokens, temperature=temperature, retries=retries)

    async def retrieve_from_knowledge_base(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve context chunks from a DigitalOcean GenAI Knowledge Base."""
        if not self.is_active or not self.do_ai_kb_id:
            return []
        try:
            url = f"https://kbaas.do-ai.run/v1/{self.do_ai_kb_id}/retrieve"
            payload = {
                "query": query,
                "num_results": limit,
                "alpha": 0.5
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    url,
                    headers={"Authorization": f"Bearer {self.do_api_key}", "Content-Type": "application/json"},
                    json=payload
                )
            if resp.status_code == 200:
                # DigitalOcean KB retrieve returns a list of results
                return resp.json().get("results", [])
            logger.error(f"DO KB Retrieve error {resp.status_code}: {resp.text[:160]}")
        except Exception as e:
            logger.warning(f"DO KB Retrieve exception: {type(e).__name__}: {e}")
        return []

    async def query_agent(self, messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7) -> Optional[str]:
        """Send a chat prompt directly to a deployed DigitalOcean GenAI Agent."""
        if not self.do_ai_agent_endpoint:
            return None
        base_url = self.do_ai_agent_endpoint.rstrip("/")
        url = f"{base_url}/api/v1/chat/completions"
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        headers = {
            "Authorization": f"Bearer {self.do_ai_agent_key}",
            "Content-Type": "application/json"
        }
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                return resp.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            logger.error(f"DO GenAI Agent error {resp.status_code}: {resp.text[:160]}")
        except Exception as e:
            logger.warning(f"DO GenAI Agent exception: {type(e).__name__}: {e}")
        return None


def _extract_json(raw: Optional[str]) -> Optional[dict]:
    """Best-effort parse of a JSON object/array from an LLM reply."""
    if not raw:
        return None
    raw = raw.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-zA-Z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    # Grab the first {...} or [...] block
    match = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            return None
    return None


llm_gateway = LLMGateway()
