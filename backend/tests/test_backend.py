import requests
import sys

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    # Test Health
    try:
        resp = requests.get(f"{base_url}/health")
        if resp.status_code == 200:
            print(f"Health Check Passed: {resp.json()}")
        else:
            print(f"Health Check Failed: {resp.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"Could not connect to server: {e}")
        sys.exit(1)

    # Test Chat
    try:
        payload = {"message": "Hello, are you working?"}
        resp = requests.post(f"{base_url}/api/chat", json=payload)
        if resp.status_code == 200:
            print(f"Chat Test Passed: {resp.json()}")
        else:
            print(f"Chat Test Failed: {resp.text}")
            sys.exit(1)
            
    except Exception as e:
        print(f"Chat request error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
