"""
Quick test of critical API endpoints for FYP demo
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(name, method, url, headers=None, data=None):
    """Test an endpoint and print result"""
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            r = requests.post(url, headers=headers, json=data, timeout=5)
        else:
            r = requests.request(method, url, headers=headers, json=data, timeout=5)
        
        status = "✓" if r.status_code < 400 else "✗"
        print(f"{status} {name}: {r.status_code}")
        return r
    except Exception as e:
        print(f"✗ {name}: ERROR - {e}")
        return None

def main():
    print("=" * 60)
    print("MegiLance API Tests")
    print("=" * 60)
    
    # Test health
    test_endpoint("Health/Ready", "GET", f"{BASE_URL}/api/health/ready")
    test_endpoint("Health/Live", "GET", f"{BASE_URL}/api/health/live")
    
    # Test auth
    login_response = test_endpoint("Auth Login (client)", "POST", f"{BASE_URL}/api/auth/login", 
        data={"email": "client@demo.com", "password": "Password123"})
    
    token = None
    if login_response and login_response.status_code == 200:
        token = login_response.json().get("access_token")
        print(f"  → Got access token")
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # Test freelancer login
    test_endpoint("Auth Login (freelancer)", "POST", f"{BASE_URL}/api/auth/login",
        data={"email": "freelancer@demo.com", "password": "Password123"})
    
    # Test public endpoints
    test_endpoint("Projects List", "GET", f"{BASE_URL}/api/projects")
    test_endpoint("Categories List", "GET", f"{BASE_URL}/api/categories")
    test_endpoint("Skills List", "GET", f"{BASE_URL}/api/skills")
    
    # Test authenticated endpoints
    if token:
        test_endpoint("Auth Me", "GET", f"{BASE_URL}/api/auth/me", headers=headers)
        test_endpoint("My Proposals", "GET", f"{BASE_URL}/api/proposals", headers=headers)
        test_endpoint("My Contracts", "GET", f"{BASE_URL}/api/contracts", headers=headers)
        test_endpoint("Notifications", "GET", f"{BASE_URL}/api/notifications", headers=headers)
        test_endpoint("Portal Dashboard", "GET", f"{BASE_URL}/api/portal/dashboard", headers=headers)
    
    # Test specific project
    test_endpoint("Project Details (ID 1)", "GET", f"{BASE_URL}/api/projects/1")
    
    # Test reviews
    test_endpoint("Reviews List", "GET", f"{BASE_URL}/api/reviews")
    
    print("=" * 60)
    print("Test Complete")
    print("=" * 60)

if __name__ == "__main__":
    main()
