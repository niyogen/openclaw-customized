import requests

url = "http://localhost:8001/api/tenant/singer/config"
payload = {
    "discord_token": "token123",
    "whatsapp_model": "openai",
    "slack_model": "gemini"
}

try:
    print("Starting uvicorn in background...")
    import subprocess
    import time
    p = subprocess.Popen(["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"])
    time.sleep(3)
    
    print("Testing POST...")
    res = requests.post(url, json=payload)
    print("POST status:", res.status_code)
    print("POST response:", res.json())
    
    print("Testing GET...")
    res = requests.get(url)
    print("GET status:", res.status_code)
    print("whatsapp_model:", res.json().get("whatsapp_model"))
    print("slack_model:", res.json().get("slack_model"))
    
    p.kill()
except Exception as e:
    print(e)
