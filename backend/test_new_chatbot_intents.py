
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_new_intents():
    # 1. Start session
    url = f"{BASE_URL}/chatbot/start"
    print(f"Calling: {url}")
    res = requests.post(url)
    print(f"Status: {res.status_code}")
    print(f"Body: {res.text}")
    data = res.json()
    conv_id = data["conversation_id"]
    print(f"Started: {conv_id}")

    # 2. Test matching intent
    url = f"{BASE_URL}/chatbot/{conv_id}/message"
    print(f"Calling: {url}")
    res = requests.post(url, json={"message": "Can you find some projects for me?"})
    print(f"Body: {res.text}")
    print(f"Matching Response: {res.json()['response']}")
    print(f"Intent detected: {res.json().get('intent')}")

    # 3. Test proposal intent
    res = requests.post(url, json={"message": "I need help writing a proposal for a React job"})
    print(f"Proposal Response: {res.json()['response']}")
    print(f"Intent detected: {res.json().get('intent')}")

if __name__ == "__main__":
    try:
        test_new_intents()
    except Exception as e:
        print(f"Error: {e}. Make sure backend is running on port 8000.")
