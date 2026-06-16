from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TenantConfig(BaseModel):
    discord_token: str | None = None

@app.post("/test")
def test(config: TenantConfig):
    config_dict = config.dict(exclude_unset=True)
    return {"dict": config_dict}
