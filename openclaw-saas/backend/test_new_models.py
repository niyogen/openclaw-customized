import asyncio
import json
import imaplib
import email as email_lib
from email.header import decode_header
import re
from app.db.database import SessionLocal
from app.db import models

async def main():
    db = SessionLocal()
    # Reset last_uid to 149
    row = db.query(models.TenantSkillCredential).filter(
        models.TenantSkillCredential.subdomain == "itranga",
        models.TenantSkillCredential.skill_id == "gmail-payment-forwarder"
    ).first()
    
    creds = json.loads(row.credentials)
    creds["last_uid"] = 149
    row.credentials = json.dumps(creds)
    db.commit()
    print("Database last_uid reset to 149 successfully.")
    
    email_address = creds.get("email")
    app_password = creds.get("app_password").replace(" ", "")
    customer = db.query(models.Customer).filter(models.Customer.subdomain == "itranga").first()
    config = customer.config
    
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(email_address, app_password)
    mail.select("inbox")
    
    # Test UID 150 and 151
    for uid in [150, 151]:
        print(f"\n--- Testing UID: {uid} ---")
        status, data = mail.uid('fetch', str(uid), '(RFC822)')
        msg = email_lib.message_from_bytes(data[0][1])
        
        def decode_str(s):
            if s is None: return ""
            parts = decode_header(s)
            return "".join(p.decode(enc or "utf-8") if isinstance(p, bytes) else p for p, enc in parts)
            
        subject = decode_str(msg["Subject"])
        sender = decode_str(msg["From"])
        
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                if content_type == "text/plain" and "attachment" not in content_disposition:
                    body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                    break
        else:
            body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
            
        body_clean = re.sub(r'\s+', ' ', body).strip()
        
        # Exact prompt from main.py
        prompt = f"""You are an advanced financial analyst agent specializing in parsing email notifications for incoming payments and deposits.

Your task is to analyze the following email and determine if it is a notification of an INCOMING payment or deposit RECEIVED by us/the recipient.

Email From: {sender}
Subject: {subject}
Body: {body_clean[:1500]}

CRITICAL RULES for classification:
1. `is_payment` MUST be `true` only if the email states that funds/money have actually been RECEIVED by, DEPOSITED to, or PAID to the recipient.
2. `is_payment` MUST be `false` if the email is:
   - A request for payment, invoice, or bill (e.g., "payment due", "please make the payment", "invoice #123").
   - An outgoing payment receipt or confirmation for a purchase/payment made BY the recipient (e.g., "receipt for your payment", "thank you for your order").
   - A notification of a payment request or pending payment from someone else.

FEW-SHOT EXAMPLES:

Example 1 (Incoming Payment Done):
- Input Body: "Sarah Miller transferred 750 USD for invoice #1029."
- Thought Process: The text states money has been transferred by Sarah Miller to us. This is a completed incoming payment.
- Output JSON:
{{
  "thought_process": "The email states money has been transferred by Sarah Miller to us. This is a completed incoming payment.",
  "is_payment": true,
  "amount": 750.0,
  "currency": "USD",
  "sender": "Sarah Miller",
  "summary": "Transferred 750 USD for invoice #1029."
}}

Example 2 (Payment Request / Invoice):
- Input Body: "Please make the payment of $30 as soon as possible."
- Thought Process: This is a request to make a payment, not a notification of a payment received.
- Output JSON:
{{
  "thought_process": "This is a request for payment, not a completed deposit.",
  "is_payment": false
}}

Example 3 (Outgoing Payment Receipt):
- Input Body: "Receipt for your payment of $15.00 to OpenAI."
- Thought Process: This is an outgoing payment receipt for a purchase made by the recipient, not an incoming payment received.
- Output JSON:
{{
  "thought_process": "This is an outgoing receipt for a payment made by us, not an incoming payment.",
  "is_payment": false
}}

Return a JSON object with this structure (nothing else):
{{
  "thought_process": "Step-by-step reasoning about whether the payment is completed, incoming, and who the sender/recipient are.",
  "is_payment": true or false,
  "amount": 123.45 (only if is_payment is true),
  "currency": "USD/AUD/EUR" (only if is_payment is true),
  "sender": "Sender Name" (only if is_payment is true),
  "summary": "One-sentence summary" (only if is_payment is true)
}}"""

        if config.openai_api_key:
            import openai
            client = openai.OpenAI(api_key=config.openai_api_key)
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            print("gpt-4o-mini response:")
            print(completion.choices[0].message.content)
            
    mail.logout()
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
