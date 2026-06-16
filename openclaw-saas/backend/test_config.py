from sqlalchemy import create_engine
import requests

res = requests.post("http://localhost:8000/api/tenant/testuser123/config", json={"whatsapp_model": "gemini"})
print(res.status_code)
print(res.text)
