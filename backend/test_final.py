import requests

BASE_URL = "http://localhost:8000/api/chatbot"

def test():
    # Start
    res = requests.post(f"{BASE_URL}/start")
    conv_id = res.json()["conversation_id"]
    print(f"Started: {conv_id}")

    # Matching
    print("Testing matching...")
    res = requests.post(f"{BASE_URL}/{conv_id}/message", json={"message": "can you find matching projects for me?"})
    print(f"Matching: {res.json()}")

    # Proposal
    print("\nTesting proposal...")
    res = requests.post(f"{BASE_URL}/{conv_id}/message", json={"message": "help me write a proposal for a project"})
    print(f"Proposal: {res.json()}")

if __name__ == "__main__":
    test()
