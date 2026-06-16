#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# OpenClaw SaaS Backend — DigitalOcean Automated Deployment Script
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

# --- COLOR DEFS ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting DigitalOcean Deployment Automation...${NC}"

# --- CONFIGURATION ---
# Load configuration from a local deployment env file if it exists, or fall back
DEPLOY_ENV_FILE=".env.deploy"

if [ -f "$DEPLOY_ENV_FILE" ]; then
    echo -e "ℹ️  Loading configuration from $DEPLOY_ENV_FILE"
    # shellcheck disable=SC1090
    source "$DEPLOY_ENV_FILE"
else
    echo -e "${YELLOW}⚠️  No $DEPLOY_ENV_FILE found. Please enter configuration details below.${NC}"
    read -rp "Enter Droplet IP Address: " DROPLET_IP
    read -rp "Enter SSH User [root]: " SSH_USER
    SSH_USER=${SSH_USER:-root}
    read -rp "Enter Path to SSH Private Key [~/.ssh/id_rsa]: " SSH_KEY
    SSH_KEY=${SSH_KEY:-~/.ssh/id_rsa}
    read -rp "Enter Target Remote Directory [/opt/openclaw/backend]: " REMOTE_DIR
    REMOTE_DIR=${REMOTE_DIR:-/opt/openclaw/backend}
    
    # Save for future deployments
    cat <<EOF > "$DEPLOY_ENV_FILE"
DROPLET_IP="$DROPLET_IP"
SSH_USER="$SSH_USER"
SSH_KEY="$SSH_KEY"
REMOTE_DIR="$REMOTE_DIR"
EOF
    echo -e "${GREEN}✅ Saved config to $DEPLOY_ENV_FILE for next time.${NC}"
fi

# Ensure SSH Key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH Key not found at $SSH_KEY${NC}"
    exit 1
fi

SSH_CMD="ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$DROPLET_IP"
SCP_CMD="scp -i $SSH_KEY -o StrictHostKeyChecking=no"

# --- 1. PRE-CHECK REMOTE SSH & DOCKER ---
echo -e "\n${BLUE}🔍 Checking connection to Droplet ($DROPLET_IP)...${NC}"
if ! $SSH_CMD "docker --version" >/dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to Droplet, or Docker is not installed on it.${NC}"
    echo -e "Please ensure your Droplet is running and has Docker installed (e.g. Docker 1-Click image)."
    exit 1
fi
echo -e "${GREEN}✅ SSH connection verified. Docker is available on remote host.${NC}"

# --- 2. BUILD DOCKER IMAGE LOCALLY ---
IMAGE_NAME="openclaw-backend"
echo -e "\n${BLUE}📦 Building Docker Image locally...${NC}"
docker build -t "$IMAGE_NAME:latest" .
echo -e "${GREEN}✅ Local Docker build succeeded.${NC}"

# --- 3. EXPORT IMAGE TO ARCHIVE ---
ARCHIVE_NAME="openclaw-backend-latest.tar.gz"
echo -e "\n${BLUE}💾 Compressing Docker Image...${NC}"
docker save "$IMAGE_NAME:latest" | gzip > "$ARCHIVE_NAME"
echo -e "${GREEN}✅ Exported and compressed image to $ARCHIVE_NAME (${YELLOW}$(du -sh "$ARCHIVE_NAME" | cut -f1)${NC})${NC}"

# --- 4. PREPARE REMOTE DIRECTORIES ---
echo -e "\n${BLUE}📁 Preparing remote directories...${NC}"
$SSH_CMD "mkdir -p $REMOTE_DIR/sessions"

# --- 5. TRANSFER FILES TO DROPLET ---
echo -e "\n${BLUE}📤 Transferring Docker image and configurations to Droplet...${NC}"

# Copy Docker Compose config
if [ -f "docker-compose.prod.yml" ]; then
    $SCP_CMD docker-compose.prod.yml "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/docker-compose.yml"
elif [ -f "docker-compose.yml" ]; then
    $SCP_CMD docker-compose.yml "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/docker-compose.yml"
else
    # Generate a default docker-compose.yml on the fly if it doesn't exist locally
    echo -e "${YELLOW}⚠️  Local docker-compose.yml not found. Generating default on Droplet...${NC}"
    cat <<EOF > docker-compose.temp.yml
version: '3.8'
services:
  backend:
    image: openclaw-backend:latest
    container_name: openclaw-backend
    restart: always
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - ./sessions:/app/app/whatsapp/sessions
    env_file:
      - .env
EOF
    $SCP_CMD docker-compose.temp.yml "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/docker-compose.yml"
    rm docker-compose.temp.yml
fi

# Copy local .env if present and remote .env does not exist
if [ -f ".env" ]; then
    echo -e "ℹ️  Checking if remote .env needs to be initialized..."
    if ! $SSH_CMD "[ -f $REMOTE_DIR/.env ]" >/dev/null 2>&1; then
        echo -e "📤 Initializing remote .env with local template..."
        $SCP_CMD .env "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/.env"
    else
        echo -e "ℹ️  Remote .env already exists. Skipping overwrite to protect production settings."
    fi
fi

# Transfer the large docker image archive
$SCP_CMD "$ARCHIVE_NAME" "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/$ARCHIVE_NAME"
echo -e "${GREEN}✅ File transfer complete.${NC}"

# --- 6. REMOTE EXECUTION (LOAD, RUN, CLEANUP) ---
echo -e "\n${BLUE}🚀 Performing remote deployment tasks...${NC}"
$SSH_CMD "cd $REMOTE_DIR && \
    echo '➡️ Loading Docker image...' && \
    docker load < $ARCHIVE_NAME && \
    echo '➡️ Cleaning up archive file...' && \
    rm $ARCHIVE_NAME && \
    echo '➡️ Restarting containers...' && \
    docker compose down || true && \
    docker compose up -d && \
    echo '➡️ Pruning unused Docker resources to free disk space...' && \
    docker image prune -f"

# --- 7. CLEANUP LOCAL TEMP FILES ---
echo -e "\n${BLUE}🧹 Cleaning up local temporary files...${NC}"
rm -f "$ARCHIVE_NAME"

echo -e "\n${GREEN}🎉 Deployment to DigitalOcean finished successfully!${NC}"
echo -e "🌐 API running on Droplet port 8000 (proxied internally to localhost)."
echo -e "👉 Make sure your reverse proxy (Nginx) is directing traffic to http://127.0.0.1:8000"
echo -e "👉 Verify container status with: ssh -i $SSH_KEY $SSH_USER@$DROPLET_IP 'docker ps'"
