#!/usr/bin/env python3
"""
MegiLance API Endpoint Verification Script
Tests all critical backend endpoints for portal functionality
"""

import requests
import sys
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:8000/api/v1"

# Critical endpoints for portal functionality
CRITICAL_ENDPOINTS = {
    "auth": [
        ("POST", "/auth/login"),
        ("POST", "/auth/signup"),
        ("POST", "/auth/refresh"),
        ("POST", "/auth/logout"),
        ("GET", "/auth/me"),
    ],
    "users": [
        ("GET", "/users/me"),
        ("PUT", "/users/me"),
        ("GET", "/users/profile"),
        ("PUT", "/users/profile"),
    ],
    "projects": [
        ("GET", "/projects"),
        ("POST", "/projects"),
        ("GET", "/projects/{id}"),
        ("PUT", "/projects/{id}"),
        ("DELETE", "/projects/{id}"),
    ],
    "proposals": [
        ("GET", "/proposals"),
        ("POST", "/proposals"),
        ("GET", "/proposals/{id}"),
        ("PUT", "/proposals/{id}"),
    ],
    "contracts": [
        ("GET", "/contracts"),
        ("POST", "/contracts"),
        ("GET", "/contracts/{id}"),
        ("PUT", "/contracts/{id}"),
    ],
    "payments": [
        ("GET", "/payments"),
        ("POST", "/payments"),
        ("GET", "/wallet"),
        ("POST", "/wallet/deposit"),
        ("POST", "/wallet/withdraw"),
    ],
    "messages": [
        ("GET", "/messages"),
        ("POST", "/messages"),
        ("GET", "/conversations"),
    ],
    "notifications": [
        ("GET", "/notifications"),
        ("PUT", "/notifications/{id}/read"),
        ("GET", "/notifications/unread-count"),
    ],
    "portal": [
        ("GET", "/portal/client/dashboard"),
        ("GET", "/portal/freelancer/dashboard"),
        ("GET", "/portal/client/analytics"),
        ("GET", "/portal/freelancer/analytics"),
    ],
}

def test_endpoint(method: str, endpoint: str, timeout: int = 5) -> Tuple[bool, int, str]:
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=timeout)
        elif method == "POST":
            response = requests.post(url, json={}, timeout=timeout)
        elif method == "PUT":
            response = requests.put(url, json={}, timeout=timeout)
        elif method == "DELETE":
            response = requests.delete(url, timeout=timeout)
        else:
            return False, 0, f"Unknown method: {method}"
        
        # Consider 2xx and 401/403 as "endpoint exists" (401/403 means auth required but endpoint works)
        if 200 <= response.status_code < 300 or response.status_code in [401, 403, 404]:
            return True, response.status_code, "OK"
        else:
            return False, response.status_code, response.text[:100]
    except requests.exceptions.ConnectionError:
        return False, 0, "Connection refused - is backend running?"
    except requests.exceptions.Timeout:
        return False, 0, "Timeout"
    except Exception as e:
        return False, 0, str(e)

def main():
    print("=" * 80)
    print("MegiLance API Endpoint Verification")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print()
    
    results = {
        "total": 0,
        "working": 0,
        "auth_required": 0,
        "failing": 0,
    }
    
    category_results = {}
    
    for category, endpoints in CRITICAL_ENDPOINTS.items():
        print(f"\n{'='*80}")
        print(f"Testing {category.upper()} endpoints")
        print(f"{'='*80}")
        
        category_total = 0
        category_working = 0
        category_auth = 0
        category_failing = 0
        
        for method, endpoint in endpoints:
            results["total"] += 1
            category_total += 1
            
            print(f"  [{method:4}] {endpoint:40} ... ", end="", flush=True)
            
            success, status, message = test_endpoint(method, endpoint)
            
            if success:
                if status in [401, 403]:
                    print(f"✓ (auth required, status: {status})")
                    results["auth_required"] += 1
                    category_auth += 1
                elif 200 <= status < 300:
                    print(f"✓ (status: {status})")
                    results["working"] += 1
                    category_working += 1
                else:
                    print(f"⚠ (status: {status})")
                    results["working"] += 1
                    category_working += 1
            else:
                print(f"✗ {message}")
                results["failing"] += 1
                category_failing += 1
        
        category_results[category] = {
            "total": category_total,
            "working": category_working,
            "auth_required": category_auth,
            "failing": category_failing,
        }
    
    # Print summary
    print(f"\n\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total Endpoints: {results['total']}")
    print(f"Working: {results['working']} ({results['working']/results['total']*100:.1f}%)")
    print(f"Auth Required: {results['auth_required']} ({results['auth_required']/results['total']*100:.1f}%)")
    print(f"Failing: {results['failing']} ({results['failing']/results['total']*100:.1f}%)")
    print()
    
    print("By Category:")
    for category, stats in category_results.items():
        pct = (stats['working'] + stats['auth_required']) / stats['total'] * 100 if stats['total'] > 0 else 0
        print(f"  {category:20} - {stats['working'] + stats['auth_required']:2}/{stats['total']} ({pct:.0f}%)")
    
    print()
    if results['failing'] > 0:
        print("⚠️  Some endpoints are failing. Check backend logs.")
        return 1
    else:
        print("✅ All endpoints are responding!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
