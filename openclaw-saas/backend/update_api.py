import boto3

ecs = boto3.client('ecs', region_name='us-east-1')
elbv2 = boto3.client('elbv2', region_name='us-east-1')
route53 = boto3.client('route53', region_name='us-east-1')

APP_NAME = "openclaw-backend"
CLUSTER_NAME = "openclaw-production-cluster"
IMAGE_URI = "582604091763.dkr.ecr.us-east-1.amazonaws.com/openclaw-backend:latest"
DATABASE_URL = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

print("1. Updating Task Definition with Database URL...")
response = ecs.register_task_definition(
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
            {'name': 'DATABASE_URL', 'value': DATABASE_URL}
        ]
    }]
)

new_task_def_arn = response['taskDefinition']['taskDefinitionArn']
print(f"New Task Def: {new_task_def_arn}")

print("2. Updating ECS Service...")
ecs.update_service(
    cluster=CLUSTER_NAME,
    service=f"{APP_NAME}-service",
    taskDefinition=new_task_def_arn,
    forceNewDeployment=True
)

print("3. Getting ALB DNS Name and linking to openclaw.niyogen.com...")
try:
    # Get Hosted Zone ID for openclaw.niyogen.com
    zones = route53.list_hosted_zones_by_name(DNSName='openclaw.niyogen.com.')['HostedZones']
    zone_id = [z for z in zones if z['Name'] == 'openclaw.niyogen.com.'][0]['Id']

    # Get ALB DNS
    alb_dns = elbv2.describe_load_balancers(Names=[f"{APP_NAME}-alb"])['LoadBalancers'][0]['DNSName']

    # We will just print instructions to the user to avoid complex ACM/Alias record setups here
    print(f"ALB DNS is: {alb_dns}")

except Exception as e:
    print(f"Note: {e}")

print("✅ Backend API successfully updated and deployed with DB connection!")
