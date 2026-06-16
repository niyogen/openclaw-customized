import os
import boto3
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Customer, CustomerConfig

ssm_client = boto3.client('ssm', region_name='us-east-1')

def migrate():
    db = SessionLocal()
    customers = db.query(Customer).all()
    
    keys = [
        "OPENAI_API_KEY", "ANTHROPIC_TOKEN", "GEMINI_TOKEN", "XAI_TOKEN",
        "WHATSAPP_TOKEN", "TELEGRAM_TOKEN", "DISCORD_TOKEN", "SLACK_TOKEN",
        "GMAIL_TOKEN", "GITHUB_TOKEN", "NOTION_TOKEN", "TRELLO_TOKEN",
        "HOMEASSISTANT_TOKEN", "HUE_TOKEN", "WEBHOOK_URL"
    ]
    
    for customer in customers:
        print(f"Migrating {customer.subdomain}...")
        
        # Get or create config
        config = customer.config
        if not config:
            config = CustomerConfig(customer_id=customer.id)
            db.add(config)
            
        for key in keys:
            param_name = f"/openclaw/customers/{customer.subdomain}/{key}"
            try:
                response = ssm_client.get_parameter(Name=param_name, WithDecryption=True)
                val = response['Parameter']['Value']
                
                # Update if it's not pending_configuration or empty
                if val and val != "pending_configuration":
                    # Only set if currently empty or we want to overwrite
                    current_val = getattr(config, key.lower())
                    if not current_val:
                        setattr(config, key.lower(), val)
                        print(f"  Migrated {key}")
            except ssm_client.exceptions.ParameterNotFound:
                pass
                
    db.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
