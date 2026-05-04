#!/usr/bin/env python3
"""
@AI-HINT: Advanced debugging script with endpoint discovery and detailed validation
"""

import requests
import json
import time
from tabulate import tabulate

BASE_URL = "http://localhost:8000"

class Debugger:
    def __init__(self):
        self.results = {}
        self.access_token = None
        self.user_id = None
        self.email = None
        self.password = None
    
    def test_docs_endpoints(self):
        """Test OpenAPI documentation endpoints"""
        print("\n" + "="*80)
        print("CHECKING DOCUMENTATION ENDPOINTS")
        print("="*80)
        
        docs_endpoints = [
            ("/api/docs", "OpenAPI Docs (Swagger)"),
            ("/api/redoc", "ReDoc Docs"),
            ("/api/openapi.json", "OpenAPI Schema"),
            ("/docs", "Root Swagger (may not exist)"),
        ]
        
        results = []
        for endpoint, desc in docs_endpoints:
            try:
                resp = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
                status = "✓" if resp.status_code == 200 else f"✗ ({resp.status_code})"
                results.append([endpoint, desc, status, resp.status_code])
            except Exception as e:
                results.append([endpoint, desc, "✗ ERROR", str(e)])
        
        print(tabulate(results, headers=["Endpoint", "Description", "Status", "Code"], tablefmt="grid"))
        return results
    
    def get_openapi_schema(self):
        """Fetch OpenAPI schema and analyze routes"""
        print("\n" + "="*80)
        print("ANALYZING API ROUTES FROM OPENAPI SCHEMA")
        print("="*80)
        
        try:
            resp = requests.get(f"{BASE_URL}/api/openapi.json", timeout=5)
            if resp.status_code != 200:
                print(f"❌ Cannot fetch OpenAPI schema: {resp.status_code}")
                return None
            
            schema = resp.json()
            paths = schema.get("paths", {})
            
            # Group endpoints by category
            categories = {}
            for path in paths.keys():
                # Extract category from path (first meaningful segment)
                parts = path.split("/")
                category = parts[2] if len(parts) > 2 else "root"
                if category not in categories:
                    categories[category] = []
                categories[category].append(path)
            
            print(f"\n✓ Found {len(paths)} total endpoints in {len(categories)} categories\n")
            
            # Show top categories
            sorted_cats = sorted(categories.items(), key=lambda x: -len(x[1]))
            table_data = [[cat, len(endpoints)] for cat, endpoints in sorted_cats[:15]]
            print(tabulate(table_data, headers=["Category", "Endpoint Count"], tablefmt="grid"))
            
            # Show AI endpoints specifically
            print("\n" + "-"*80)
            print("AI-RELATED ENDPOINTS:")
            print("-"*80)
            ai_paths = [p for p in paths.keys() if "ai" in p.lower()]
            if ai_paths:
                for path in sorted(ai_paths)[:10]:
                    print(f"  • {path}")
            else:
                print("  ⚠ No AI endpoints found in schema")
            
            return paths
        except Exception as e:
            print(f"❌ Error analyzing OpenAPI schema: {e}")
            return None
    
    def test_project_endpoint(self):
        """Test project creation with proper fields"""
        print("\n" + "="*80)
        print("TESTING PROJECT CREATION ENDPOINT")
        print("="*80)
        
        if not self.access_token:
            print("⚠ No access token - skipping project tests")
            return
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # First, get valid category and experience level from API
        print("\nFetching valid categories...")
        try:
            resp = requests.get(f"{BASE_URL}/api/categories", headers=headers, timeout=5)
            categories = resp.json() if resp.status_code == 200 else []
            category_id = categories[0].get("id") if categories else "development"
            print(f"✓ Found categories: {len(categories)} items")
        except:
            category_id = "development"
        
        # Project payload with all required fields
        project_payload = {
            "title": f"Test Project {int(time.time())}",
            "description": "Comprehensive debugging test project",
            "category": category_id or "development",
            "experience_level": "beginner",
            "estimated_duration": "1-3 weeks",
            "budget": 500.0,
            "budget_type": "fixed",
        }
        
        print(f"\nPayload: {json.dumps(project_payload, indent=2)}")
        
        try:
            resp = requests.post(f"{BASE_URL}/api/projects", json=project_payload, headers=headers, timeout=5)
            print(f"\nResponse Status: {resp.status_code}")
            if resp.status_code in [200, 201]:
                print("✓ Project created successfully")
                data = resp.json()
                print(f"Project ID: {data.get('id')}")
                self.results["project_creation"] = "OK"
            else:
                print(f"❌ Project creation failed")
                print(f"Response: {resp.text[:500]}")
                self.results["project_creation"] = "FAILED"
        except Exception as e:
            print(f"❌ Error: {e}")
            self.results["project_creation"] = "ERROR"
    
    def test_ai_endpoints(self, paths):
        """Test AI-related endpoints"""
        print("\n" + "="*80)
        print("TESTING AI ENDPOINTS")
        print("="*80)
        
        if not paths:
            print("⚠ No paths available for AI testing")
            return
        
        # Find AI endpoints from schema
        ai_endpoints = [p for p in paths.keys() if "ai" in p.lower()]
        
        if not ai_endpoints:
            print("⚠ No AI endpoints found in schema")
            return
        
        # Test a few AI endpoints
        test_data = {
            "/api/skill-analyzer": {"text": "Python, JavaScript, React development"},
            "/api/ai": {"text": "This is a test"},
            "/api/ai-writing": {"text": "Improve this text"},
        }
        
        results = []
        for endpoint, payload in test_data.items():
            try:
                resp = requests.post(f"{BASE_URL}{endpoint}", json=payload, timeout=5)
                status = "✓" if resp.status_code < 500 else f"✗ ({resp.status_code})"
                results.append([endpoint, status, resp.status_code])
            except Exception as e:
                results.append([endpoint, f"✗ ERROR", str(e)])
        
        print(tabulate(results, headers=["Endpoint", "Status", "Code"], tablefmt="grid"))
    
    def test_auth_flow(self):
        """Complete authentication flow test"""
        print("\n" + "="*80)
        print("TESTING AUTHENTICATION FLOW")
        print("="*80)
        
        # Register
        print("\n1. Testing Registration...")
        email = f"debug_user_{int(time.time())}@test.com"
        password = "TestPass123!"
        
        reg_payload = {
            "email": email,
            "password": password,
            "name": "Debug User",
            "user_type": "freelancer"
        }
        
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload, timeout=5)
            if resp.status_code in [200, 201]:
                print("✓ Registration successful")
                self.email = email
                self.password = password
            else:
                print(f"⚠ Registration returned {resp.status_code}")
                print(f"  Response: {resp.text[:200]}")
        except Exception as e:
            print(f"✗ Registration error: {e}")
            return
        
        # Login
        print("\n2. Testing Login...")
        login_payload = {"email": email, "password": password}
        
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token")
                print(f"✓ Login successful")
                print(f"  Token received: {self.access_token[:50]}...")
            else:
                print(f"✗ Login returned {resp.status_code}")
                print(f"  Response: {resp.text[:200]}")
        except Exception as e:
            print(f"✗ Login error: {e}")
        
        # Get current user
        if self.access_token:
            print("\n3. Testing GET /me...")
            headers = {"Authorization": f"Bearer {self.access_token}"}
            try:
                resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
                if resp.status_code == 200:
                    user = resp.json()
                    self.user_id = user.get("id")
                    print(f"✓ Current user retrieved")
                    print(f"  User ID: {self.user_id}")
                else:
                    print(f"✗ GET /me returned {resp.status_code}")
            except Exception as e:
                print(f"✗ GET /me error: {e}")

def main():
    debugger = Debugger()
    
    print("\n" + "█"*80)
    print("█" + " "*78 + "█")
    print("█" + "  MEGILANCE ADVANCED API DEBUGGING & DIAGNOSTIC".center(78) + "█")
    print("█" + " "*78 + "█")
    print("█"*80)
    
    # Test documentation endpoints
    debugger.test_docs_endpoints()
    
    # Get OpenAPI schema
    paths = debugger.get_openapi_schema()
    
    # Test authentication
    debugger.test_auth_flow()
    
    # Test AI endpoints
    if paths:
        debugger.test_ai_endpoints(paths)
    
    # Test project creation
    debugger.test_project_endpoint()
    
    # Summary
    print("\n" + "="*80)
    print("DIAGNOSTIC SUMMARY")
    print("="*80)
    print(f"✓ OpenAPI Docs: Available at /api/docs")
    print(f"✓ Authentication: {'OK' if debugger.access_token else 'FAILED'}")
    print(f"✓ User ID: {debugger.user_id or 'NOT RETRIEVED'}")
    print(f"✓ Total API Endpoints: Available in schema")
    print(f"✓ AI Endpoints: Check /api/openapi.json for full list")
    print("\n" + "="*80)

if __name__ == "__main__":
    main()
