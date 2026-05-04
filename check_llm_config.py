#!/usr/bin/env python3
"""
LLM & API Key Verification for MegiLance
Checks DigitalOcean AI connectivity and API keys
"""

import os
import sys
import httpx
import asyncio
from pathlib import Path
from typing import Optional

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

def print_header(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_status(label, status, details=""):
    icon = "✅" if status else "❌"
    print(f"{icon} {label}")
    if details:
        print(f"   └─ {details}")

async def check_do_ai_key() -> bool:
    """Check if DigitalOcean API key is configured"""
    print_header("1. DigitalOcean AI API Key Check")
    
    # Check environment variable
    do_key = os.getenv("DO_AI_API_KEY")
    
    if not do_key:
        print_status("Environment Variable", False, "DO_AI_API_KEY not set in environment")
        return False
    
    if len(do_key) < 10:
        print_status("API Key Format", False, f"Key too short: {len(do_key)} chars (expected >10)")
        return False
    
    masked_key = do_key[:10] + "*" * (len(do_key) - 20) + do_key[-10:]
    print_status("API Key Found", True, f"Key: {masked_key}")
    return True

async def check_do_ai_connection() -> bool:
    """Test connection to DigitalOcean AI API"""
    print_header("2. DigitalOcean AI Connection Test")
    
    do_key = os.getenv("DO_AI_API_KEY")
    if not do_key:
        print_status("Connection Test", False, "No API key available to test")
        return False
    
    do_api_base = os.getenv("DO_AI_API_BASE", "https://inference.do-ai.run/v1")
    do_model = os.getenv("DO_AI_MODEL", "llama3.3-70b-instruct")
    
    print(f"   API Base: {do_api_base}")
    print(f"   Model: {do_model}")
    print()
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Test with simple prompt
            response = await client.post(
                f"{do_api_base}/chat/completions",
                headers={
                    "Authorization": f"Bearer {do_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": do_model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant. Respond with exactly 'OK' and nothing else."},
                        {"role": "user", "content": "Say OK"}
                    ],
                    "max_tokens": 10,
                    "temperature": 0.1
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("choices") and len(data["choices"]) > 0:
                    content = data["choices"][0].get("message", {}).get("content", "").strip()
                    print_status("API Connection", True, f"Response: '{content}'")
                    return True
                else:
                    print_status("API Response", False, "No choices in response")
                    print(f"   Response: {data}")
                    return False
            else:
                status_msg = f"HTTP {response.status_code}: {response.text[:100]}"
                print_status("API Connection", False, status_msg)
                return False
                
    except httpx.TimeoutException:
        print_status("API Connection", False, "Request timeout (15s)")
        return False
    except httpx.HTTPError as e:
        print_status("API Connection", False, f"HTTP Error: {str(e)[:100]}")
        return False
    except Exception as e:
        print_status("API Connection", False, f"Error: {type(e).__name__}: {str(e)[:100]}")
        return False

async def check_local_ai_service() -> bool:
    """Check if local AI service is running"""
    print_header("3. Local AI Service Check")
    
    local_url = "http://localhost:8001/health"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(local_url)
            
            if response.status_code == 200:
                print_status("Local AI Service", True, f"Running at {local_url}")
                return True
            else:
                print_status("Local AI Service", False, f"HTTP {response.status_code}")
                return False
                
    except httpx.ConnectError:
        print_status("Local AI Service", False, "Not running (connection refused)")
        return False
    except httpx.TimeoutException:
        print_status("Local AI Service", False, "Timeout - service not responding")
        return False
    except Exception as e:
        print_status("Local AI Service", False, f"Error: {type(e).__name__}")
        return False

async def check_backend_llm_gateway() -> bool:
    """Check if backend LLM gateway is configured"""
    print_header("4. Backend LLM Gateway Configuration")
    
    try:
        from app.core.config import get_settings
        from app.services.llm_gateway import llm_gateway
        
        settings = get_settings()
        
        print(f"   API Base: {llm_gateway.do_api_base}")
        print(f"   Model: {llm_gateway.do_model}")
        print(f"   Active: {llm_gateway.is_active}")
        print()
        
        if llm_gateway.is_active:
            print_status("LLM Gateway", True, "Initialized and active")
            
            # Try to generate text
            result = await llm_gateway.generate_text("Say OK", max_tokens=5)
            if result and "OK" in result.upper():
                print_status("Text Generation", True, f"Response: '{result.strip()}'")
                return True
            else:
                print_status("Text Generation", False, f"Unexpected response: {result[:50]}")
                return False
        else:
            print_status("LLM Gateway", False, "Not active (API key missing)")
            return False
            
    except ImportError as e:
        print_status("Backend Import", False, f"Cannot import backend: {e}")
        return False
    except Exception as e:
        print_status("LLM Gateway Test", False, f"Error: {type(e).__name__}: {str(e)[:100]}")
        return False

async def main():
    print("\n" + "="*70)
    print("  MegiLance - LLM & API Key Verification")
    print("  DigitalOcean AI Configuration Checker")
    print("="*70)
    
    results = {}
    
    # Run all checks
    results["DO API Key"] = await check_do_ai_key()
    results["DO Connection"] = await check_do_ai_connection()
    results["Local AI Service"] = await check_local_ai_service()
    results["Backend Gateway"] = await check_backend_llm_gateway()
    
    # Summary
    print_header("Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for check_name, result in results.items():
        icon = "✅" if result else "❌"
        print(f"{icon} {check_name}: {'PASS' if result else 'FAIL'}")
    
    print()
    print(f"Result: {passed}/{total} checks passed")
    
    if results["DO API Key"] and results["DO Connection"]:
        print("\n✅ DigitalOcean AI is configured and working!")
        print("   - API Key: Set")
        print("   - Connection: Active")
        print("   - Model: llama3.3-70b-instruct")
        return 0
    else:
        print("\n❌ Issues found - see above for details")
        print("\nQuick Fixes:")
        if not results["DO API Key"]:
            print("\n1. Set DigitalOcean AI API Key:")
            print("   export DO_AI_API_KEY='your-key-here'")
            print("   or set in .env file")
        if not results["DO Connection"]:
            print("\n2. Check DigitalOcean AI credentials:")
            print("   - Visit: https://cloud.digitalocean.com/ai")
            print("   - Copy API Key to DO_AI_API_KEY environment variable")
            print("   - Verify key format (should start with 'dop_')")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
