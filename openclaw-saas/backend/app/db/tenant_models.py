from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

TenantBase = declarative_base()

class Integration(TenantBase):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g. "whatsapp", "gmail", "openai", "gemini"
    api_key = Column(String, nullable=True)
    model = Column(String, nullable=True) # e.g. "gpt-4", "gemini-pro"
    is_active = Column(Boolean, default=False)
    config_data = Column(JSON, nullable=True) # Extra config
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MessageLog(TenantBase):
    __tablename__ = "message_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_name = Column(String, index=True)
    content = Column(String)
    direction = Column(String) # "inbound", "outbound"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgentTask(TenantBase):
    __tablename__ = "agent_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String)
    status = Column(String, default="pending")
    result = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
