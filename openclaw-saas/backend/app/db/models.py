from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, unique=True, index=True)
    subdomain = Column(String, unique=True, index=True)
    aws_task_arn = Column(String, nullable=True)
    name_servers = Column(String, nullable=True)
    
    # Billing & Tier Limits
    plan_type = Column(String, default="pro")
    monthly_credits_limit = Column(Integer, default=30000)
    credits_used = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    stripe_customer_id = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    config = relationship("CustomerConfig", back_populates="customer", uselist=False)


class CustomerConfig(Base):
    __tablename__ = "customer_configs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True)
    
    openai_api_key = Column(String, nullable=True)
    anthropic_token = Column(String, nullable=True)
    gemini_token = Column(String, nullable=True)
    xai_token = Column(String, nullable=True)
    hermes_token = Column(String, nullable=True)
    whatsapp_token = Column(String, nullable=True)
    telegram_token = Column(String, nullable=True)
    discord_token = Column(String, nullable=True)
    slack_token = Column(String, nullable=True)
    gmail_token = Column(String, nullable=True)
    github_token = Column(String, nullable=True)
    notion_token = Column(String, nullable=True)
    trello_token = Column(String, nullable=True)
    homeassistant_token = Column(String, nullable=True)
    hue_token = Column(String, nullable=True)
    webhook_url = Column(String, nullable=True)

    # AI Agent Model Routing
    whatsapp_model = Column(String, nullable=True)
    whatsapp_reply_groups = Column(Boolean, default=False)
    telegram_model = Column(String, nullable=True)
    discord_model = Column(String, nullable=True)
    slack_model = Column(String, nullable=True)
    gmail_model = Column(String, nullable=True)
    github_model = Column(String, nullable=True)
    notion_model = Column(String, nullable=True)
    trello_model = Column(String, nullable=True)
    homeassistant_model = Column(String, nullable=True)
    hue_model = Column(String, nullable=True)
    webhook_model = Column(String, nullable=True)
    allowed_numbers = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="config")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    email = Column(String, index=True)
    stripe_session_id = Column(String, unique=True, index=True)
    status = Column(String, default="pending")
    amount = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Coupon(Base):
    """Admin-issued coupons that grant free access for N days to a specific email."""
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    days = Column(Integer, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_by = Column(String, default="admin")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ── NEW TABLES ─────────────────────────────────────────────────────────────────

class TenantAgent(Base):
    """AI agents per tenant — persisted in DB, survive redeploys."""
    __tablename__ = "tenant_agents"

    id = Column(String, primary_key=True, index=True)        # agent-{uuid}
    subdomain = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    persona = Column(Text, default="Helpful assistant")
    channel = Column(String, default="WhatsApp")
    model = Column(String, default="OpenAI (GPT-4)")
    enabled = Column(Boolean, default=True)
    messages_handled = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TenantSchedule(Base):
    """Scheduled tasks per tenant — executed by APScheduler."""
    __tablename__ = "tenant_schedules"

    id = Column(String, primary_key=True, index=True)        # sched-{uuid}
    subdomain = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    cron_preset = Column(String, nullable=False)             # e.g. "daily-morning", "hourly"
    cron_expr = Column(String, nullable=False)               # "0 9 * * *"
    task = Column(Text, nullable=False)                      # Task description / chat message
    enabled = Column(Boolean, default=True)
    last_run = Column(String, nullable=True)
    next_run = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TenantSkillCredential(Base):
    """Skill API credentials stored per tenant in DB."""
    __tablename__ = "tenant_skill_credentials"

    id = Column(Integer, primary_key=True, index=True)
    subdomain = Column(String, index=True, nullable=False)
    skill_id = Column(String, nullable=False)                # e.g. "github-copilot"
    credentials = Column(Text, nullable=False)               # JSON-encoded {key: value}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TenantDocument(Base):
    """Documents uploaded by tenant for chat context (RAG)."""
    __tablename__ = "tenant_documents"

    id = Column(String, primary_key=True, index=True)        # doc-{uuid}
    subdomain = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    file_size = Column(Integer, default=0)                   # size in bytes
    created_at = Column(DateTime(timezone=True), server_default=func.now())

