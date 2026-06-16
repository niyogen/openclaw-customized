import boto3
import time
import os

ec2 = boto3.client('ec2', region_name='us-east-1')
ecs = boto3.client('ecs', region_name='us-east-1')
elbv2 = boto3.client('elbv2', region_name='us-east-1')
iam = boto3.client('iam', region_name='us-east-1')

# 1. Configuration
VPC_ID = "vpc-07d3fbd9a2fad7114"
SUBNETS = ["subnet-08045516e5615a6aa", "subnet-08f2ca560ce78af06", "subnet-0d975cd04551c1491"]
IMAGE_URI = "582604091763.dkr.ecr.us-east-1.amazonaws.com/openclaw-backend:latest"
CLUSTER_NAME = "openclaw-production-cluster"
APP_NAME = "openclaw-backend"

print("🚀 Starting ECS Fargate Deployment...")

# 2. Security Groups
print("Creating Security Groups...")
try:
    sg_response = ec2.create_security_group(GroupName=f"{APP_NAME}-sg", Description="Allow HTTP", VpcId=VPC_ID)
    sg_id = sg_response['GroupId']
    ec2.authorize_security_group_ingress(GroupId=sg_id, IpPermissions=[
        {'IpProtocol': 'tcp', 'FromPort': 80, 'ToPort': 80, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
        {'IpProtocol': 'tcp', 'FromPort': 8000, 'ToPort': 8000, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
    ])
except Exception as e:
    print(f"SG Exists, retrieving... ({e})")
    sg_id = ec2.describe_security_groups(Filters=[{'Name': 'group-name', 'Values': [f"{APP_NAME}-sg"]}])['SecurityGroups'][0]['GroupId']

# 3. Application Load Balancer
print("Creating Application Load Balancer...")
try:
    alb_response = elbv2.create_load_balancer(
        Name=f"{APP_NAME}-alb",
        Subnets=SUBNETS,
        SecurityGroups=[sg_id],
        Scheme='internet-facing',
        Type='application',
        IpAddressType='ipv4'
    )
    alb_arn = alb_response['LoadBalancers'][0]['LoadBalancerArn']
    alb_dns = alb_response['LoadBalancers'][0]['DNSName']
    
    # Target Group
    tg_response = elbv2.create_target_group(
        Name=f"{APP_NAME}-tg",
        Protocol='HTTP',
        Port=8000,
        VpcId=VPC_ID,
        TargetType='ip',
        HealthCheckPath='/docs'
    )
    tg_arn = tg_response['TargetGroups'][0]['TargetGroupArn']
    
    # Listener
    elbv2.create_listener(
        LoadBalancerArn=alb_arn,
        Protocol='HTTP',
        Port=80,
        DefaultActions=[{'Type': 'forward', 'TargetGroupArn': tg_arn}]
    )
except Exception as e:
    print(f"ALB might exist: {e}")
    alb_arn = elbv2.describe_load_balancers(Names=[f"{APP_NAME}-alb"])['LoadBalancers'][0]['LoadBalancerArn']
    alb_dns = elbv2.describe_load_balancers(Names=[f"{APP_NAME}-alb"])['LoadBalancers'][0]['DNSName']
    tg_arn = elbv2.describe_target_groups(Names=[f"{APP_NAME}-tg"])['TargetGroups'][0]['TargetGroupArn']

# 4. ECS Cluster
print("Creating ECS Cluster...")
ecs.create_cluster(clusterName=CLUSTER_NAME)

# 5. ECS Task Definition
print("Registering Task Definition...")
task_def_response = ecs.register_task_definition(
    family=APP_NAME,
    networkMode='awsvpc',
    requiresCompatibilities=['FARGATE'],
    cpu='256',
    memory='512',
    executionRoleArn='arn:aws:iam::582604091763:role/ecsTaskExecutionRole',
    taskRoleArn='arn:aws:iam::582604091763:role/ecsTaskRole',
    containerDefinitions=[{
        'name': APP_NAME,
        'image': IMAGE_URI,
        'essential': True,
        'portMappings': [{'containerPort': 8000, 'hostPort': 8000, 'protocol': 'tcp'}],
        'environment': [
            {'name': 'ENVIRONMENT', 'value': 'production'},
            {'name': 'DATABASE_URL', 'value': os.environ.get('DATABASE_URL', 'postgresql://postgres:placeholder@placeholder:5432/postgres')},
            {'name': 'STRIPE_SECRET_KEY', 'value': os.environ.get('STRIPE_SECRET_KEY', 'sk_test_placeholder')},
            {'name': 'STRIPE_WEBHOOK_SECRET', 'value': os.environ.get('STRIPE_WEBHOOK_SECRET', 'whsec_placeholder')},
            {'name': 'ADMIN_SECRET', 'value': os.environ.get('ADMIN_SECRET', 'placeholder')},
        ],
        'logConfiguration': {
            'logDriver': 'awslogs',
            'options': {
                'awslogs-group': '/ecs/openclaw-backend',
                'awslogs-region': 'us-east-1',
                'awslogs-stream-prefix': 'ecs'
            }
        }
    }]
)

# 6. ECS Service
print("Creating ECS Fargate Service...")
try:
    ecs.create_service(
        cluster=CLUSTER_NAME,
        serviceName=f"{APP_NAME}-service",
        taskDefinition=APP_NAME,
        launchType='FARGATE',
        desiredCount=1, # Change to 2 or 3 for High Availability
        networkConfiguration={
            'awsvpcConfiguration': {
                'subnets': SUBNETS,
                'securityGroups': [sg_id],
                'assignPublicIp': 'ENABLED'
            }
        },
        loadBalancers=[{
            'targetGroupArn': tg_arn,
            'containerName': APP_NAME,
            'containerPort': 8000
        }]
    )
except Exception as e:
    print(f"Updating existing service... ({e})")
    ecs.update_service(
        cluster=CLUSTER_NAME,
        service=f"{APP_NAME}-service",
        taskDefinition=APP_NAME,
        desiredCount=1
    )

print("-------------------------------------------------------------------")
print("✅ ECS Fargate Deployment Initiated!")
print(f"🌐 Your Load Balancer URL: http://{alb_dns}")
print("   Please create a CNAME record in Route53 mapping 'openclaw.niyogen.com' to this URL.")
print("   (It may take 3-5 minutes for the ECS Tasks to boot and attach to the ALB)")
print("-------------------------------------------------------------------")
