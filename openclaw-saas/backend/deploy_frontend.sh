#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# OpenClaw SaaS — Frontend (Next.js) DigitalOcean Deploy Script
# Target: https://claw.niyogen.com
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}🚀 OpenClaw Frontend Deployment — claw.niyogen.com${NC}"

# ── Config ────────────────────────────────────────────────────────
DEPLOY_ENV_FILE=".env.deploy"
if [ -f "$DEPLOY_ENV_FILE" ]; then
    source "$DEPLOY_ENV_FILE"
else
    echo -e "${YELLOW}⚠️  No $DEPLOY_ENV_FILE found. Please enter details below.${NC}"
    read -rp "Enter Droplet IP: " DROPLET_IP
    read -rp "Enter SSH User [root]: " SSH_USER
    SSH_USER=${SSH_USER:-root}
    read -rp "Enter SSH Key path [~/.ssh/id_rsa]: " SSH_KEY
    SSH_KEY=${SSH_KEY:-~/.ssh/id_rsa}
    cat <<EOF > "$DEPLOY_ENV_FILE"
DROPLET_IP="$DROPLET_IP"
SSH_USER="$SSH_USER"
SSH_KEY="$SSH_KEY"
EOF
fi

REMOTE_DIR="/opt/openclaw/backend"
SSH_CMD="ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$DROPLET_IP"
SCP_CMD="scp -i $SSH_KEY -o StrictHostKeyChecking=no"
IMAGE_NAME="openclaw-frontend"
ARCHIVE="openclaw-frontend-latest.tar.gz"

# ── Build-time env vars (public, safe to bake into image) ─────────
NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL:-https://openclaw.niyogen.com}"
NEXT_PUBLIC_APP_URL="https://claw.niyogen.com"
NEXT_PUBLIC_STRIPE_PK="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}"

# ── 1. Pre-flight check ───────────────────────────────────────────
echo -e "\n${BLUE}🔍 Checking SSH connection...${NC}"
if ! $SSH_CMD "docker --version" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot reach Droplet or Docker not installed.${NC}"; exit 1
fi
echo -e "${GREEN}✅ Connected. Docker available.${NC}"

# ── 2. Build Docker image locally ────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../../openclaw-saas-website" && pwd)"

echo -e "\n${BLUE}📦 Building Next.js Docker image from $FRONTEND_DIR ...${NC}"
docker build \
    --build-arg NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL" \
    --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
    --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PK" \
    -t "$IMAGE_NAME:latest" \
    "$FRONTEND_DIR"
echo -e "${GREEN}✅ Build succeeded.${NC}"

# ── 3. Export & compress ──────────────────────────────────────────
echo -e "\n${BLUE}💾 Compressing image...${NC}"
docker save "$IMAGE_NAME:latest" | gzip > "$ARCHIVE"
echo -e "${GREEN}✅ Compressed: $(du -sh "$ARCHIVE" | cut -f1)${NC}"

# ── 4. Prepare remote directories ────────────────────────────────
echo -e "\n${BLUE}📁 Preparing remote directories...${NC}"
$SSH_CMD "mkdir -p $REMOTE_DIR/nginx/conf.d $REMOTE_DIR/nginx/ssl $REMOTE_DIR/sessions"

# ── 5. Transfer files ─────────────────────────────────────────────
echo -e "\n${BLUE}📤 Transferring files...${NC}"
$SCP_CMD "$ARCHIVE" "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/$ARCHIVE"

# Transfer docker-compose only if it exists here
if [ -f "docker-compose.prod.yml" ]; then
    $SCP_CMD "docker-compose.prod.yml" "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/docker-compose.yml"
elif [ -f "docker-compose.yml" ]; then
    $SCP_CMD "docker-compose.yml" "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/docker-compose.yml"
fi

# Transfer nginx config
if [ -d "nginx/conf.d" ]; then
    $SCP_CMD -r nginx "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/"
fi

# Copy frontend.env (secrets like STRIPE_SECRET_KEY)
if [ -f "frontend.env" ]; then
    if ! $SSH_CMD "[ -f $REMOTE_DIR/frontend.env ]" > /dev/null 2>&1; then
        $SCP_CMD frontend.env "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/frontend.env"
        echo -e "${GREEN}✅ frontend.env initialized on server.${NC}"
    else
        echo -e "ℹ️  Remote frontend.env already exists — skipping to protect secrets."
    fi
fi

# ── 6. Load image & restart frontend container ────────────────────
echo -e "\n${BLUE}🚀 Loading image and restarting frontend...${NC}"
$SSH_CMD "cd $REMOTE_DIR && \
    echo '➡️  Loading image...' && \
    docker load < $ARCHIVE && \
    rm -f $ARCHIVE && \
    echo '➡️  Restarting frontend container...' && \
    docker compose up -d --no-deps frontend && \
    docker image prune -f"

# ── 7. Cleanup local archive ──────────────────────────────────────
rm -f "$ARCHIVE"

echo -e "\n${GREEN}🎉 Frontend deployment complete!${NC}"
echo -e "🌐 https://claw.niyogen.com should now be live."
echo -e "👉 Tail logs: ssh -i $SSH_KEY $SSH_USER@$DROPLET_IP 'docker logs -f openclaw-frontend'"
