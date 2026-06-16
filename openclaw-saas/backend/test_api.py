import requests
import json

url = "https://openclaw.niyogen.com/api/tenant/singer/config"
headers = {"Content-Type": "application/json"}

print("Setting to test1234")
res = requests.post(url, headers=headers, json={"discord_token": "test1234"})
print(res.json())

print("Setting to empty string")
res = requests.post(url, headers=headers, json={"discord_token": ""})
print(res.json())

print("Checking config")
res = requests.get(url)
print(res.json().get("discord_token"))

