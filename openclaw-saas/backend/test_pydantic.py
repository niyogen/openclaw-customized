from pydantic import BaseModel
class TenantConfig(BaseModel):
    discord_token: str | None = None
    whatsapp_token: str | None = None

config = TenantConfig.parse_raw('{"discord_token": ""}')
d = config.dict(exclude_unset=True)
print(d)
