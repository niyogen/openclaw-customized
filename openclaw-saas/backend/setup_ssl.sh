#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# SSL Certificate Setup — uses Let's Encrypt via Certbot (standalone)
# Run this ONCE on the Droplet to get/renew SSL certs for both domains
# ─────────────────────────────────────────────────────────────────
# Usage: bash setup_ssl.sh <droplet-ip> <ssh-key-path>
set -euo pipefail

DROPLET_IP="${1:?Usage: $0 <droplet-ip> <ssh-key>}"
SSH_KEY="${2:-~/.ssh/id_rsa}"
SSH_USER="root"
EMAIL="admin@niyogen.com"          # Change to your email
DOMAIN_FRONTEND="claw.niyogen.com"
DOMAIN_BACKEND="openclaw.niyogen.com"
SSL_DIR="/opt/openclaw/nginx/ssl"

SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$DROPLET_IP"

echo "🔐 Installing Certbot on Droplet..."
$SSH "apt-get update -q && apt-get install -y certbot"

echo "🔐 Stopping Nginx temporarily for standalone cert issuance..."
$SSH "docker compose -f /opt/openclaw/docker-compose.yml stop nginx 2>/dev/null || true"

echo "🔐 Issuing cert for $DOMAIN_FRONTEND ..."
$SSH "certbot certonly --standalone --non-interactive --agree-tos \
    --email $EMAIL \
    -d $DOMAIN_FRONTEND"

echo "🔐 Issuing cert for $DOMAIN_BACKEND ..."
$SSH "certbot certonly --standalone --non-interactive --agree-tos \
    --email $EMAIL \
    -d $DOMAIN_BACKEND"

echo "📋 Copying certs to Nginx SSL directory ($SSL_DIR)..."
$SSH "mkdir -p $SSL_DIR && \
    cp /etc/letsencrypt/live/$DOMAIN_FRONTEND/fullchain.pem $SSL_DIR/$DOMAIN_FRONTEND.crt && \
    cp /etc/letsencrypt/live/$DOMAIN_FRONTEND/privkey.pem   $SSL_DIR/$DOMAIN_FRONTEND.key && \
    cp /etc/letsencrypt/live/$DOMAIN_BACKEND/fullchain.pem  $SSL_DIR/$DOMAIN_BACKEND.crt  && \
    cp /etc/letsencrypt/live/$DOMAIN_BACKEND/privkey.pem    $SSL_DIR/$DOMAIN_BACKEND.key"

echo "🚀 Restarting Nginx..."
$SSH "docker compose -f /opt/openclaw/docker-compose.yml up -d nginx"

echo ""
echo "✅ SSL setup complete!"
echo "   Add this cron job on the Droplet for auto-renewal:"
echo "   0 3 * * * certbot renew --quiet && \\"
echo "   cp /etc/letsencrypt/live/$DOMAIN_FRONTEND/fullchain.pem $SSL_DIR/$DOMAIN_FRONTEND.crt && \\"
echo "   cp /etc/letsencrypt/live/$DOMAIN_FRONTEND/privkey.pem $SSL_DIR/$DOMAIN_FRONTEND.key && \\"
echo "   cp /etc/letsencrypt/live/$DOMAIN_BACKEND/fullchain.pem $SSL_DIR/$DOMAIN_BACKEND.crt && \\"
echo "   cp /etc/letsencrypt/live/$DOMAIN_BACKEND/privkey.pem $SSL_DIR/$DOMAIN_BACKEND.key && \\"
echo "   docker exec openclaw-nginx nginx -s reload"
