#!/bin/bash
set -e

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME="openclaw-backend"
IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest"

echo "1. Creating ECR Repository..."
aws ecr create-repository --repository-name $REPO_NAME --region $REGION || true

echo "2. Authenticating Docker to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "3. Building Docker Image..."
docker build -t $REPO_NAME .
docker tag $REPO_NAME:latest $IMAGE_URI

echo "4. Pushing Image to ECR..."
docker push $IMAGE_URI

echo "5. Creating AWS App Runner Access Role..."
cat > role-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "build.apprunner.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
aws iam create-role --role-name AppRunnerECRAccessRole --assume-role-policy-document file://role-trust-policy.json || true
aws iam attach-role-policy --role-name AppRunnerECRAccessRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess || true

echo "Waiting for role to propagate..."
sleep 10

echo "6. Creating App Runner Service..."
cat > apprunner.json <<EOF
{
    "ServiceName": "openclaw-backend",
    "SourceConfiguration": {
        "ImageRepository": {
            "ImageIdentifier": "$IMAGE_URI",
            "ImageConfiguration": {
                "Port": "8000"
            },
            "ImageRepositoryType": "ECR"
        },
        "AuthenticationConfiguration": {
            "AccessRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/AppRunnerECRAccessRole"
        },
        "AutoDeploymentsEnabled": true
    },
    "InstanceConfiguration": {
        "Cpu": "1 vCPU",
        "Memory": "2 GB"
    }
}
EOF

aws apprunner create-service --cli-input-json file://apprunner.json > apprunner-output.json

SERVICE_URL=$(cat apprunner-output.json | grep -o '"ServiceUrl": "[^"]*' | cut -d'"' -f4)
echo "--------------------------------------------------------"
echo "✅ Backend successfully deployed to AWS App Runner!"
echo "App Runner URL: https://$SERVICE_URL"
echo "To map 'openclaw.niyogen.com', go to AWS App Runner Console > Custom Domains."
echo "--------------------------------------------------------"
