const pino = require('pino');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Polyfill globalThis.crypto for Baileys
if (!globalThis.crypto) {
    globalThis.crypto = crypto.webcrypto;
}

const sessionId = process.argv[2];
if (!sessionId) {
    console.error('No session ID provided');
    process.exit(1);
}

const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}

const statusFile = path.join(sessionsDir, `${sessionId}_status.json`);
const updateStatus = (status) => {
    fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
};

async function connectToWhatsApp() {
    updateStatus({ state: 'starting' });
    
    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = await import('@whiskeysockets/baileys');
    
    const { state, saveCreds } = await useMultiFileAuthState(path.join(sessionsDir, sessionId));
    const version = [2, 3000, 1035194821];
    console.log(`using WA v${version.join('.')}`);
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'info' }),
        browser: Browsers.ubuntu('Chrome')
    });
    
    const http = require('http');
    let server;
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            updateStatus({ state: 'qr', qr });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                updateStatus({ state: 'reconnecting' });
                if (server) { try { server.close(); } catch (e) {} }
                const portFile = path.join(sessionsDir, `${sessionId}_port.txt`);
                try { fs.unlinkSync(portFile); } catch (e) {}
                connectToWhatsApp();
            } else {
                updateStatus({ state: 'logged_out' });
                if (server) { try { server.close(); } catch (e) {} }
                const portFile = path.join(sessionsDir, `${sessionId}_port.txt`);
                try { fs.unlinkSync(portFile); } catch (e) {}
                fs.rmSync(path.join(sessionsDir, sessionId), { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            updateStatus({ state: 'connected' });
            
            // Start HTTP server only when connection is open
            server = http.createServer((req, res) => {
                if (req.method === 'POST' && req.url === '/send') {
                    let body = '';
                    req.on('data', chunk => { body += chunk; });
                    req.on('end', async () => {
                        try {
                            const payload = JSON.parse(body);
                            const to = payload.to;
                            const message = payload.message;
                            
                            if (!to || !message) {
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Missing to or message' }));
                                return;
                            }
                            
                            let jid = to;
                            if (!jid.includes('@')) {
                                jid = `${jid.replace('+', '')}@s.whatsapp.net`;
                            }
                            
                            console.log(`[WA WORKER] Sending message to ${jid}`);
                            await sock.sendMessage(jid, { text: message });
                            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'sent' }));
                        } catch (e) {
                            console.error('[WA WORKER] Send error:', e);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: e.message }));
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end();
                }
            });
            
            server.listen(0, '127.0.0.1', () => {
                const port = server.address().port;
                const portFile = path.join(sessionsDir, `${sessionId}_port.txt`);
                fs.writeFileSync(portFile, port.toString());
                console.log(`[WA WORKER] Server listening on port ${port}, wrote to ${portFile}`);
            });
        }
    });
    
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        console.log(`[WA DEBUG] Received msg from ${msg.key.remoteJid}, fromMe: ${msg.key.fromMe}`);
        if (!msg.message || msg.key.fromMe) return;

        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        console.log(`[WA DEBUG] Message text: ${text}`);
        if (!text) return;

        const subdomain = sessionId.replace('wa_', '');

        // ── Whitelist check ──────────────────────────────────────────
        try {
            const cfgRes = await fetch(`http://127.0.0.1:8000/api/tenant/${subdomain}/config`);
            if (cfgRes.ok) {
                const cfg = await cfgRes.json();
                const raw = cfg.allowed_numbers || '';
                if (raw && raw.trim().length > 0) {
                    // Parse comma/newline-separated numbers, strip spaces and + prefix for comparison
                    const allowed = raw.split(/[,\n]/).map(n => n.trim().replace(/^\+/, ''));
                    // remoteJid is like "919876543210@s.whatsapp.net"
                    const senderNum = msg.key.remoteJid.split('@')[0].replace(/^\+/, '');
                    const permitted = allowed.some(n => senderNum.endsWith(n) || n.endsWith(senderNum));
                    if (!permitted) {
                        console.log(`[WA WHITELIST] Blocked message from ${senderNum} — not in allowed list.`);
                        return; // silently ignore
                    }
                }
            }
        } catch (e) {
            console.error('[WA WHITELIST] Error fetching config for whitelist check:', e);
        }
        // ─────────────────────────────────────────────────────────────

        try {
            console.log(`[WA DEBUG] Forwarding to backend...`);
            const response = await fetch(`http://127.0.0.1:8000/api/tenant/${subdomain}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: text,
                    is_group: isGroup
                })
            });
            const data = await response.json();
            console.log(`[WA DEBUG] Backend response status: ${response.status}, data:`, data);

            if (data.response) {
                await sock.sendMessage(msg.key.remoteJid, { text: data.response });
                console.log(`[WA DEBUG] Reply sent.`);
            } else {
                console.error(`[WA ERROR] No data.response from backend!`, data);
            }
        } catch (e) {
            console.error('[WA ERROR] Error forwarding message to backend:', e);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp().catch(err => {
    console.error(err);
    updateStatus({ state: 'error', error: err.message });
});
