#!/usr/bin/env python
"""
Test script to verify all AI endpoints are accessible and working without authentication.
Run this after starting the backend server.
"""

import asyncio
import json
import httpx
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"

class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    END = "\033[0m"

def print_result(endpoint: str, status: int, success: bool, message: str = ""):
    """Print test result with color coding"""
    icon = f"{Colors.GREEN}✓{Colors.END}" if success else f"{Colors.RED}✗{Colors.END}"
    status_text = f"[{status}]"
    result = f"{icon} {endpoint:50} {status_text} {message}"
    print(result)

async def test_endpoints():
    """Test all major AI endpoints"""

    client = httpx.AsyncClient(timeout=10.0)
    results = {"passed": 0, "failed": 0, "errors": []}

    try:
        print(f"\n{Colors.BLUE}Testing System Status Endpoints{Colors.END}")
        print("=" * 80)

        # Test system status
        endpoints = [
            ("GET", "/status/full", None, "Full system status"),
            ("GET", "/status/simple", None, "Simple status check"),
            ("GET", "/status/endpoints", None, "Endpoints listing"),
        ]

        for method, path, data, desc in endpoints:
            try:
                if method == "GET":
                    resp = await client.get(f"{BASE_URL}{path}")
                else:
                    resp = await client.post(f"{BASE_URL}{path}", json=data)

                success = 200 <= resp.status_code < 300
                if success:
                    results["passed"] += 1
                else:
                    results["failed"] += 1

                print_result(f"{method} {path}", resp.status_code, success, desc)
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{path}: {str(e)}")
                print_result(f"{method} {path}", 0, False, f"ERROR: {str(e)[:30]}")

        print(f"\n{Colors.BLUE}Testing AI Service Endpoints (No Auth Required){Colors.END}")
        print("=" * 80)

        # Test AI endpoints
        ai_endpoints = [
            ("GET", "/ai/status", None, "AI Service Status"),
            ("POST", "/ai/chat", {"message": "What is MegiLance?"}, "Chatbot"),
            ("POST", "/ai/estimate-price", {
                "category": "software_development",
                "skills_required": ["Python", "FastAPI"]
            }, "Price Estimator"),
            ("POST", "/ai/extract-skills", {"text": "I have 5 years of Python and React experience"}, "Skill Extraction"),
            ("POST", "/ai/analyze-sentiment", {"text": "This is amazing!"}, "Sentiment Analysis"),
            ("POST", "/ai/categorize-project", {
                "title": "Build a web app",
                "description": "I need a web application with React and Python"
            }, "Project Categorization"),
        ]

        for method, path, data, desc in ai_endpoints:
            try:
                if method == "GET":
                    resp = await client.get(f"{BASE_URL}{path}")
                else:
                    resp = await client.post(f"{BASE_URL}{path}", json=data)

                success = 200 <= resp.status_code < 300
                if success:
                    results["passed"] += 1
                else:
                    results["failed"] += 1

                print_result(f"{method} {path}", resp.status_code, success, desc)
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{path}: {str(e)}")
                print_result(f"{method} {path}", 0, False, f"ERROR: {str(e)[:30]}")

        print(f"\n{Colors.BLUE}Testing Chatbot Endpoints{Colors.END}")
        print("=" * 80)

        # Test chatbot endpoints
        chatbot_endpoints = [
            ("GET", "/chatbot/faq/categories", None, "FAQ Categories"),
            ("GET", "/chatbot/faq", None, "FAQ Search"),
            ("POST", "/chatbot/start", {}, "Start Conversation"),
        ]

        for method, path, data, desc in chatbot_endpoints:
            try:
                if method == "GET":
                    resp = await client.get(f"{BASE_URL}{path}")
                else:
                    resp = await client.post(f"{BASE_URL}{path}", json=data or {})

                success = 200 <= resp.status_code < 300
                if success:
                    results["passed"] += 1
                else:
                    results["failed"] += 1

                print_result(f"{method} {path}", resp.status_code, success, desc)
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{path}: {str(e)}")
                print_result(f"{method} {path}", 0, False, f"ERROR: {str(e)[:30]}")

        print(f"\n{Colors.BLUE}Testing Public Tool Endpoints{Colors.END}")
        print("=" * 80)

        # Test public tools
        public_endpoints = [
            ("GET", "/price-estimator/categories", None, "Price Estimator Options"),
            ("POST", "/price-estimator/estimate", {
                "category": "software_development",
                "service_type": "web_application"
            }, "Price Estimate"),
            ("GET", "/rate-advisor/options", None, "Rate Advisor Options"),
            ("GET", "/skill-analyzer/skills", None, "Skill Analyzer Skills"),
            ("GET", "/proposal-writer/options", None, "Proposal Writer Options"),
            ("GET", "/scope-planner/options", None, "Scope Planner Options"),
            ("GET", "/income-calculator/options", None, "Income Calculator Options"),
            ("GET", "/expense-tax-calculator/options", None, "Expense Tax Calculator Options"),
            ("GET", "/invoice-generator/options", None, "Invoice Generator Options"),
            ("GET", "/contract-builder-standalone/options", None, "Contract Builder Options"),
        ]

        for method, path, data, desc in public_endpoints:
            try:
                if method == "GET":
                    resp = await client.get(f"{BASE_URL}{path}")
                else:
                    resp = await client.post(f"{BASE_URL}{path}", json=data or {})

                success = 200 <= resp.status_code < 300
                if success:
                    results["passed"] += 1
                else:
                    results["failed"] += 1

                print_result(f"{method} {path}", resp.status_code, success, desc)
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{path}: {str(e)}")
                print_result(f"{method} {path}", 0, False, f"ERROR: {str(e)[:30]}")

        # Summary
        print("\n" + "=" * 80)
        print(f"{Colors.BLUE}Test Summary{Colors.END}")
        print("=" * 80)
        total = results["passed"] + results["failed"]
        print(f"{Colors.GREEN}Passed: {results['passed']}/{total}{Colors.END}")
        if results["failed"] > 0:
            print(f"{Colors.RED}Failed: {results['failed']}/{total}{Colors.END}")

        if results["errors"]:
            print(f"\n{Colors.YELLOW}Errors:{Colors.END}")
            for error in results["errors"]:
                print(f"  - {error}")

        return results["failed"] == 0

    finally:
        await client.aclose()

if __name__ == "__main__":
    print(f"{Colors.BLUE}MegiLance AI Endpoints Test Suite{Colors.END}")
    print("=" * 80)
    print("Testing API endpoints without authentication...")

    success = asyncio.run(test_endpoints())
    exit(0 if success else 1)
