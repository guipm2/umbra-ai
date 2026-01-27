import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_upload():
    print("Testing Knowledge Upload...")
    payload = {
        "content": "Aura AI style guide: We prefer a friendly, futuristic tone. Use emojis sparingly. Focus on clarity.",
        "metadata": {"type": "style_guide"}
    }
    try:
        resp = requests.post(f"{BASE_URL}/api/brain/upload", json=payload)
        if resp.status_code == 200:
            print("Upload Success:", resp.json())
        else:
            print("Upload Failed:", resp.text)
    except Exception as e:
        print("Upload Error:", e)

def test_content_agent():
    print("\nTesting Content Agent (should use RAG)...")
    payload = {"message": "Write a short intro tweet about Aura AI."}
    try:
        resp = requests.post(f"{BASE_URL}/api/content", json=payload)
        if resp.status_code == 200:
            print("Content Agent Response:", resp.json())
        else:
            print("Content Agent Failed:", resp.text)
    except Exception as e:
        print("Content Agent Error:", e)

if __name__ == "__main__":
    test_upload()
    test_content_agent()
