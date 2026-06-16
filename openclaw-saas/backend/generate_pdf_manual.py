#!/usr/bin/env python3
import os
import sys

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Suppress headers/footers on the cover page (page 1)
        if self._pageNumber == 1:
            return
            
        self.saveState()
        
        # Primary Color theme
        primary_color = colors.HexColor("#4F46E5") # Indigo 600
        slate_gray = colors.HexColor("#64748B") # Slate 500
        border_color = colors.HexColor("#CBD5E1") # Slate 300
        
        # ── Header ──
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(primary_color)
        self.drawString(54, 750, "GMAIL-TO-WHATSAPP NOTIFICATION SYSTEM")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(slate_gray)
        self.drawRightString(558, 750, "Operations & Engineering Manual")
        
        self.setStrokeColor(border_color)
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # ── Footer ──
        self.line(54, 52, 558, 52)
        self.setFont("Helvetica", 8)
        self.setFillColor(slate_gray)
        self.drawString(54, 40, "CONFIDENTIAL  |  OpenClaw Enterprise SAAS Platform")
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 40, page_text)
        
        self.restoreState()

def build_pdf(filename):
    # Document dimensions (Letter: 612 x 792 points)
    # Margins: 0.75" left/right (54 pt), top/bottom margin 72 pt to prevent overlapping with headers/footers
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()

    # Define color scheme
    c_indigo_950 = colors.HexColor("#1E1B4B")
    c_indigo_600 = colors.HexColor("#4F46E5")
    c_slate_900 = colors.HexColor("#0F172A")
    c_slate_700 = colors.HexColor("#334155")
    c_slate_500 = colors.HexColor("#64748B")
    c_slate_100 = colors.HexColor("#F1F5F9")
    c_border = colors.HexColor("#E2E8F0")

    # Override defaults
    styles['Normal'].textColor = c_slate_700
    styles['Normal'].fontSize = 9.5
    styles['Normal'].leading = 14

    styles['BodyText'].textColor = c_slate_700
    styles['BodyText'].fontSize = 9.5
    styles['BodyText'].leading = 14

    # Custom typography styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=c_indigo_950,
        alignment=1, # Center
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_indigo_600,
        alignment=1, # Center
        spaceAfter=30
    )

    meta_label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=c_slate_900,
    )

    meta_val_style = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=c_slate_500,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_indigo_950,
        spaceBefore=16,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_indigo_600,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['BodyText'],
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=c_slate_900
    )

    def code_block(text):
        escaped = text.strip().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>').replace(' ', '&nbsp;')
        p = Paragraph(escaped, code_style)
        t = Table([[p]], colWidths=[500])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_slate_100),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return t

    story = []

    # ==========================================
    # COVER PAGE
    # ==========================================
    story.append(Spacer(1, 140))
    story.append(Paragraph("GMAIL-TO-WHATSAPP PAYMENT<br/>NOTIFICATION SYSTEM", title_style))
    story.append(Paragraph("Operations, Engineering & Troubleshooting Manual", subtitle_style))
    
    # Decorative line
    line_table = Table([[""]], colWidths=[504])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 2.5, c_indigo_600),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 140))

    # Metadata Block
    meta_data = [
        [Paragraph("Document Ref:", meta_label_style), Paragraph("OM-GWA-001", meta_val_style)],
        [Paragraph("System Version:", meta_label_style), Paragraph("v2.4.1 (Stable)", meta_val_style)],
        [Paragraph("Target Tenant:", meta_label_style), Paragraph("itranga / Global Multitenant", meta_val_style)],
        [Paragraph("Author:", meta_label_style), Paragraph("OpenClaw Conversational Engineering Group", meta_val_style)],
        [Paragraph("Date:", meta_label_style), Paragraph("June 2026", meta_val_style)],
        [Paragraph("Classification:", meta_label_style), Paragraph("Confidential - Internal Use Only", meta_val_style)],
    ]
    meta_table = Table(meta_data, colWidths=[100, 404])
    meta_table.setStyle(TableStyle([
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(meta_table)
    
    story.append(PageBreak())

    # ==========================================
    # SECTION 1: SYSTEM OVERVIEW
    # ==========================================
    story.append(Paragraph("1. System Overview & Architecture", h1_style))
    story.append(Paragraph(
        "The Gmail-to-WhatsApp Payment Notification pipeline connects a secure email gateway (Google Gmail) "
        "to WhatsApp group chats. It operates as an autonomous, scheduled background poller designed to extract "
        "incoming payment/deposit details, classify them via Large Language Models (LLMs), and instantly forward "
        "summaries to business staff on WhatsApp. This eliminates latency in order fulfillment and cash flow visibility.",
        body_style
    ))
    
    story.append(Paragraph("Core Architecture Components:", h2_style))
    story.append(Paragraph("• <b>FastAPI Application Scheduler:</b> APScheduler handles the execution of background tasks. Every 60 seconds, it launches a thread to query active skills across all tenants.", bullet_style))
    story.append(Paragraph("• <b>Gmail IMAP SSL Gateway:</b> Secure login to gmail.com via App Passwords. Fetches unread or recent messages matching custom search criteria.", bullet_style))
    story.append(Paragraph("• <b>AI Classification Pipeline:</b> Intercepts email bodies and uses LLM routing (OpenAI GPT-4o-mini or Gemini 1.5 Flash) to analyze context, filtering out false positives.", bullet_style))
    story.append(Paragraph("• <b>Node.js WhatsApp Worker:</b> A modular Node subprocess powered by <i>@whiskeysockets/baileys</i>. It hosts a dynamic HTTP relay server for sending outward-bound group messages.", bullet_style))
    story.append(Paragraph("• <b>Relational Database (PostgreSQL):</b> Persists tenant configurations, skill credentials (e.g. <i>last_uid</i> processing offset), API keys, and activity logs.", bullet_style))

    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 2: THE EMAIL PIPELINE & SCHEDULING
    # ==========================================
    story.append(Paragraph("2. The Email Polling & Scheduling Sequence", h1_style))
    story.append(Paragraph(
        "Every 60 seconds, the scheduler executes the task <code>check_all_gmail_payment_forwarders</code>. "
        "The step-by-step process is as follows:",
        body_style
    ))
    story.append(Paragraph("1. <b>Credential Lookup:</b> Fetch enabled <code>gmail-payment-forwarder</code> configs for subdomains (e.g., <i>itranga</i>) from the database.", bullet_style))
    story.append(Paragraph("2. <b>WhatsApp Worker Probe:</b> Verifies if the WhatsApp process is running. If not, calls the auto-start shell process.", bullet_style))
    story.append(Paragraph("3. <b>Gmail IMAP Login:</b> logs in using the tenant's email address and custom Google App Password.", bullet_style))
    story.append(Paragraph("4. <b>Query Filters:</b> Queries emails using a custom Gmail raw search string (e.g., <i>X-GM-RAW</i>). Standard IMAP fallback query is used if custom terms fail.", bullet_style))
    story.append(Paragraph("5. <b>High-Water Mark (UID) Check:</b> Processes only emails whose UID is strictly greater than the database's <i>last_uid</i>. This prevents duplicated reports.", bullet_style))
    story.append(Paragraph("6. <b>HTML/Plain Parsing:</b> Decodes the body content, strips excessive white spaces, and slices it to the first 1,500 characters to optimize prompt token usage.", bullet_style))

    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 3: AI-POWERED PAYMENT CLASSIFICATION
    # ==========================================
    story.append(Paragraph("3. AI-Powered Payment Classification", h1_style))
    story.append(Paragraph(
        "To prevent spam and false alarms from outgoing invoices, bills, or subscription renewals, "
        "the pipeline applies strict Few-Shot Chain-of-Thought (CoT) Prompting. The LLM is forced to output "
        "structured JSON containing a step-by-step <i>thought_process</i> before declaring the final Boolean status.",
        body_style
    ))

    story.append(Paragraph("Classification Prompt Architecture:", h2_style))
    
    prompt_sample = (
        "CRITICAL RULES for classification:\n"
        "1. is_payment MUST be true ONLY if the email is a notification of funds/money actually\n"
        "   RECEIVED by or DEPOSITED to us.\n"
        "2. is_payment MUST be false if the email is a request for payment, an invoice, a bill,\n"
        "   or an OUTGOING payment receipt made BY us to someone else.\n\n"
        "Expected output format:\n"
        "{\n"
        "  \"thought_process\": \"Step-by-step reasoning...\",\n"
        "  \"is_payment\": true or false,\n"
        "  \"amount\": 123.45,\n"
        "  \"currency\": \"USD/AUD/EUR\",\n"
        "  \"sender\": \"Sender Name\",\n"
        "  \"summary\": \"One-sentence context summary\"\n"
        "}"
    )
    story.append(code_block(prompt_sample))
    
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>Fail-Safe Regex Fallback:</b> If API credentials are empty or the LLM provider experiences downtime, the python service falls back to a regex parser. It searches the email body for payment keywords and standard currency strings, ensuring that notifications continue to flow even in degraded states.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # SECTION 4: WHATSAPP WORKER DYNAMIC ROUTING
    # ==========================================
    story.append(Paragraph("4. WhatsApp Worker Gateway & Dynamic Routing", h1_style))
    story.append(Paragraph(
        "The WhatsApp integration is handled by an isolated Node.js daemon (<code>worker.js</code>) per tenant. "
        "To prevent port conflicts in containerized deployments, a dynamic port discovery model is utilized:",
        body_style
    ))
    
    story.append(Paragraph("1. <b>Dynamic Server Binding:</b> The Node worker is initialized with a dynamic port config by listening on port 0. The OS assigns a random free port.", bullet_style))
    story.append(Paragraph("2. <b>Port Registry File:</b> Upon listening, the worker writes its allocated port to <code>sessions/wa_{subdomain}_port.txt</code>.", bullet_style))
    story.append(Paragraph("3. <b>State Check:</b> A companion file <code>wa_{subdomain}_status.json</code> stores connection states ('connected', 'qr', 'reconnecting').", bullet_style))
    story.append(Paragraph("4. <b>Local API Gateway:</b> The backend scheduler reads the port file, verifies the connection state is 'connected', and relays the message via a local HTTP POST request to <code>http://127.0.0.1:{port}/send</code>.", bullet_style))
    story.append(Paragraph("5. <b>IP/Number Whitelist:</b> The worker fetches <code>/api/tenant/{subdomain}/config</code> and checks inbound WhatsApp messages against <code>allowed_numbers</code> to block unauthorized chat prompts.", bullet_style))

    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 5: CRITICAL ISSUES RESOLVED
    # ==========================================
    story.append(Paragraph("5. Key Issues Solved & Engineering Fixes", h1_style))
    story.append(Paragraph(
        "Several development cycles resolved major operational blockages. Below is a summary of key issues and their resolutions:",
        body_style
    ))
    
    # Let's create a beautiful Table for issues
    issue_data = [
        [Paragraph("<b>Historical Problem</b>", meta_label_style), Paragraph("<b>Root Cause & Structural Fix</b>", meta_label_style)],
        [
            Paragraph("False Positive Alerts on outgoing bills & receipts", body_style),
            Paragraph("Replaced generic regex with Few-Shot Chain-of-Thought prompting, forcing the AI to evaluate directionality before returning boolean flags.", body_style)
        ],
        [
            Paragraph("WhatsApp Worker Port Bind Conflicts & crashes", body_style),
            Paragraph("Migrated from static port allocations to dynamic port binding (port 0) with a local registry file (.txt) discovery system.", body_style)
        ],
        [
            Paragraph("Local Environment Failures (Missing AWS SSM Credentials)", body_style),
            Paragraph("Built database configuration table fallback (customer_configs) to allow standalone deployments without calling AWS parameter stores.", body_style)
        ],
        [
            Paragraph("File Descriptor Exhaustion & System slowdowns", body_style),
            Paragraph("Wrapped file reads (like port or status lookups) in context managers (with open() as f) to guarantee instant OS resource cleanup.", body_style)
        ]
    ]
    
    issue_table = Table(issue_data, colWidths=[180, 324])
    issue_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_slate_100),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(issue_table)

    story.append(PageBreak())

    # ==========================================
    # SECTION 6: TROUBLESHOOTING PLAYBOOK
    # ==========================================
    story.append(Paragraph("6. Operations & Troubleshooting Playbook", h1_style))
    
    story.append(Paragraph("How to Run Diagnostic Reports (Dry Run):", h2_style))
    story.append(Paragraph(
        "To check the 10 most recent emails on Gmail and audit how the AI is classifying them without saving "
        "the progress or updating UIDs, execute the custom reporting tool:",
        body_style
    ))
    story.append(code_block("python /app/run_email_check_report.py"))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("How to Re-Process Skipped Payment Emails:", h2_style))
    story.append(Paragraph(
        "If a notification was skipped (due to network drops, API downtime, or invalid states) "
        "and you need to force the scheduler to inspect historical emails again:",
        body_style
    ))
    story.append(Paragraph("1. Open the PostgreSQL console or an administration shell.", bullet_style))
    story.append(Paragraph("2. Select the credentials string: <br/><code>SELECT credentials FROM tenant_skill_credentials WHERE subdomain = 'itranga' AND skill_id = 'gmail-payment-forwarder';</code>", bullet_style))
    story.append(Paragraph("3. Identify the value of <code>\"last_uid\": &lt;ID&gt;</code> in the JSON object.", bullet_style))
    story.append(Paragraph("4. Decrement the number (e.g. subtract 5 or 10) or set <code>\"last_uid\": null</code> to reset the cursor to the first processed email.", bullet_style))
    story.append(Paragraph("5. Wait 60 seconds for the cron loop to check the mailbox and forward missed alerts.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Diagnosing WhatsApp Connectivity Issues:", h2_style))
    story.append(Paragraph("• <b>Port Verification:</b> Check if the port registry file exists: <code>cat /app/whatsapp/sessions/wa_itranga_port.txt</code>", bullet_style))
    story.append(Paragraph("• <b>Local Connectivity Test:</b> Execute <code>curl -I http://127.0.0.1:$(cat /app/whatsapp/sessions/wa_itranga_port.txt)/send</code> to test the Node HTTP server.", bullet_style))
    story.append(Paragraph("• <b>Status Check:</b> Inspect <code>sessions/wa_itranga_status.json</code>. If the state is 'qr', the user must log into the Admin panel and scan the newly generated QR code to re-link.", bullet_style))

    story.append(Spacer(1, 20))
    
    # Sign-off box
    sign_off_data = [[
        Paragraph(
            "<b>Engineering Support & Maintenance Notes:</b><br/>"
            "This pipeline is optimized for minimal memory usage and high concurrency. For further support, "
            "review log reports using <code>tail_logs</code> backend endpoint or view container outputs in "
            "Amazon ECS CloudWatch groups.",
            body_style
        )
    ]]
    sign_off_table = Table(sign_off_data, colWidths=[500])
    sign_off_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_slate_100),
        ('BOX', (0,0), (-1,-1), 1, c_indigo_600),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(sign_off_table)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    output_path = "/home/ranga/code/pragith/cs/gmail_whatsapp_manual.pdf"
    if len(sys.argv) > 1:
        output_path = sys.argv[1]
    
    print(f"Generating PDF manual at: {output_path}...")
    build_pdf(output_path)
    print("PDF generation completed successfully!")
