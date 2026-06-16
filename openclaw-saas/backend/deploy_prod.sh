#!/bin/bash
set -e

export AWS_PROFILE=pragith
REGION="us-east-1"
ACCOUNT_ID="582604091763"
REPO_NAME="openclaw-backend"
IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest"

echo "🔑 Logging in to AWS ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "📦 Building Docker Image..."
docker build -t $REPO_NAME .
docker tag $REPO_NAME:latest $IMAGE_URI

echo "🚀 Pushing Docker Image to AWS ECR..."
docker push $IMAGE_URI

echo "🎯 Initiating ECS Fargate Deployment..."
python3 deploy_ecs.py

echo "✅ Deployment complete!"
