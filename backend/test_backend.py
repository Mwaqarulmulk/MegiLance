import requests
import json

def test_backend():
    base_url = "http://localhost:8000"
    
    # Test root endpoint
    print("Testing root endpoint...")
    response = requests.get(f"{base_url}/")
    print(f"Root endpoint status: {response.status_code}")
    print(f"Root endpoint response: {response.json()}")
    
    # Test health endpoints
    print("\nTesting health endpoints...")
    response = requests.get(f"{base_url}/api/health/live")
    print(f"Health live status: {response.status_code}")
    print(f"Health live response: {response.json()}")
    
    response = requests.get(f"{base_url}/api/health/ready")
    print(f"Health ready status: {response.status_code}")
    print(f"Health ready response: {response.json()}")
    
    # Test users endpoint
    print("\nTesting users endpoint...")
    response = requests.get(f"{base_url}/api/users")
    print(f"Users endpoint status: {response.status_code}")
    print(f"Users endpoint response: {response.json()}")
    
    # Test API root
    print("\nTesting API root...")
    response = requests.get(f"{base_url}/api")
    print(f"API root status: {response.status_code}")
    print(f"API root response: {response.json()}")
    
    print("\nBackend test completed!")

if __name__ == "__main__":
    test_backend()