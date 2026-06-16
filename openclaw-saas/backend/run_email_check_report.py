#!/usr/bin/env python3
import sys
import os
import json
import imaplib
import email as email_lib
from email.header import decode_header
import re
from datetime import datetime, timezone, timedelta

# Ensure we can import app modules
sys.path.insert(0, "/app")

from app.db import models
from app.db.database import SessionLocal

def decode_str(s):
    if s is None: return ""
    parts = decode_header(s)
    return "".join(p.decode(enc or "utf-8") if isinstance(p, bytes) else p for p, enc in parts)

def run_report():
    db = SessionLocal()
    try:
        subdomain = "itranga"
        
        # Get customer credentials
        skill_cred_row = db.query(models.TenantSkillCredential).filter(
            models.TenantSkillCredential.subdomain == subdomain,
            models.TenantSkillCredential.skill_id == "gmail-payment-forwarder"
        ).first()
        
        if not skill_cred_row:
            print("ERROR: No gmail-payment-forwarder credentials found for itranga")
            return
            
        creds = json.loads(skill_cred_row.credentials)
        email_address = creds.get("email")
        app_password = creds.get("app_password", "").replace(" ", "")
        search_query = creds.get("search_query", "payment")
        
        customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
        if not customer or not customer.config:
            print("ERROR: No customer/config found for itranga")
            return
            
        config = customer.config
        
        print(f"Connecting to IMAP for {email_address}...")
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        try:
            mail.login(email_address, app_password)
        except Exception as e:
            print(f"ERROR: IMAP login failed: {e}")
            return
            
        try:
            mail.select("inbox")
            # Search last 30 days of emails to make sure we find at least 10 emails
            since_date_imap = (datetime.now() - timedelta(days=30)).strftime("%d-%b-%Y")
            status, messages = mail.uid('search', 'SINCE', since_date_imap)
            
            if not messages[0]:
                print("No emails found in the last 30 days.")
                return
                
            uids = [int(x) for x in messages[0].split()]
            if not uids:
                print("No emails found in the last 30 days.")
                return
                
            uids.sort(reverse=True)
            # Pick last 10 emails
            target_uids = uids[:10]
            print(f"Found {len(uids)} total emails. Analyzing the 10 most recent UIDs: {target_uids}")
            
            report_items = []
            
            for index, uid in enumerate(target_uids, 1):
                print(f"Fetching and analyzing email {index}/10 (UID: {uid})...")
                status, data = mail.uid('fetch', str(uid), '(RFC822)')
                if status != "OK" or not data or not data[0]:
                    print(f"  Failed to fetch UID {uid}")
                    continue
                    
                msg = email_lib.message_from_bytes(data[0][1])
                subject = decode_str(msg["Subject"])
                sender = decode_str(msg["From"])
                date_str = msg["Date"] or ""
                
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        content_disposition = str(part.get("Content-Disposition"))
                        if content_type == "text/plain" and "attachment" not in content_disposition:
                            try:
                                body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                            except:
                                pass
                            break
                else:
                    try:
                        body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
                    except:
                        pass
                        
                body_clean = re.sub(r'\s+', ' ', body).strip()
                
                # Run the exact same LLM prompt
                prompt = f"""Analyze this email and determine if it is a notification of an INCOMING payment or deposit RECEIVED by us/the recipient.

Email From: {sender}
Subject: {subject}
Body: {body_clean[:1500]}

CRITICAL RULES for classification:
1. ONLY return `is_payment: true` if the email is a notification of funds/money actually RECEIVED by, DEPOSITED to, or PAID to us/the recipient (e.g., "you received $400", "payment received", "payment of $400 has been successfully deposited", "customer paid you").
2. MUST return `is_payment: false` if:
   - It is a request for payment, an invoice, a bill, or a demand for payment (e.g., "please make the payment of $30 asap", "invoice due", "bill ready to pay").
   - It is an OUTGOING payment receipt, purchase confirmation, or thank you message for a payment made BY us/the recipient to someone else (e.g., "thank you for your payment of $200", "receipt for your purchase").
   - It is a general discussion, pricing quote, or unrelated email.

If it IS a valid incoming payment/deposit notification:
1. Extract the payment amount (number only, e.g. 2500.50 or 180)
2. Extract the currency (e.g. USD, AUD, EUR, etc. Default to USD if symbol is $ and no other currency is specified)
3. Identify the sender/payer name
4. Provide a 1-sentence summary of the payment context.

Return a JSON object with this structure (nothing else):
{{
  "is_payment": true,
  "amount": 2500.50,
  "currency": "USD",
  "sender": "Sender Name",
  "summary": "Summary of payment."
}}
"""
                parsed_payment = None
                
                # Try OpenAI first
                if config.openai_api_key:
                    try:
                        import openai
                        client = openai.OpenAI(api_key=config.openai_api_key)
                        response = client.chat.completions.create(
                            model="gpt-4o",
                            messages=[{"role": "user", "content": prompt}],
                            response_format={"type": "json_object"}
                        )
                        res_json = json.loads(response.choices[0].message.content)
                        parsed_payment = res_json
                    except Exception as e:
                        print(f"  OpenAI call failed: {e}")
                        
                # Try Gemini next
                if not parsed_payment and config.gemini_token:
                    try:
                        import google.generativeai as genai
                        genai.configure(api_key=config.gemini_token)
                        model = genai.GenerativeModel("gemini-2.5-flash")
                        response = model.generate_content(
                            prompt,
                            generation_config={"response_mime_type": "application/json"}
                        )
                        res_json = json.loads(response.text)
                        parsed_payment = res_json
                    except Exception as e:
                        print(f"  Gemini call failed: {e}")
                        
                # Handle Fallback
                if not parsed_payment:
                    # Fallback simulation of LLM fail
                    parsed_payment = {"is_payment": False, "reason": "LLM failed or not configured"}
                    
                report_items.append({
                    "index": index,
                    "uid": uid,
                    "date": date_str,
                    "from": sender,
                    "subject": subject,
                    "body_preview": body_clean[:120] + "..." if len(body_clean) > 120 else body_clean,
                    "classification": parsed_payment
                })
                
            # Print Markdown Report
            print("\n" + "="*50)
            print("GMAIL-TO-WHATSAPP CLASSIFICATION REPORT")
            print("="*50 + "\n")
            
            print("| # | UID | Date | From / Subject | Classification | Details |")
            print("|---|---|---|---|---|---|")
            for item in report_items:
                c = item["classification"]
                is_pay = c.get("is_payment", False)
                status_icon = "✅ **INCOMING DEPOSIT**" if is_pay else "❌ **SKIPPED (Not Deposit)**"
                
                details = ""
                if is_pay:
                    details = f"Amount: {c.get('amount')} {c.get('currency')} | Payer: {c.get('sender')} | {c.get('summary')}"
                else:
                    details = "Reason: Outgoing payment receipt, request, invoice, or general email."
                    
                from_subj = f"**From:** {item['from']}<br>**Subject:** {item['subject']}"
                print(f"| {item['index']} | {item['uid']} | {item['date']} | {from_subj} | {status_icon} | {details} |")
                
        finally:
            try:
                mail.logout()
            except:
                pass
    finally:
        db.close()

if __name__ == "__main__":
    run_report()
