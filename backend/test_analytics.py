import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_analytics():
    print("Testing Analytics Agent (Web Search)...")
    payload = {"message": "What is the current stock price of Apple?"}
    try:
        resp = requests.post(f"{BASE_URL}/api/analytics", json=payload)
        if resp.status_code == 200:
            print("Analytics Success:", resp.json())
        else:
            print("Analytics Failed:", resp.text)
    except Exception as e:
        print("Analytics Error:", e)

if __name__ == "__main__":
    test_analytics()
