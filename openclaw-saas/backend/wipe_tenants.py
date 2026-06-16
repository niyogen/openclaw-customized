import os
import boto3

os.environ["DATABASE_URL"] = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

from app.db.database import SessionLocal
from app.db import models

db = SessionLocal()
customers = db.query(models.Customer).all()

ecs_client = boto3.client('ecs', region_name='us-east-1')
elbv2_client = boto3.client('elbv2', region_name='us-east-1')
ssm_client = boto3.client('ssm', region_name='us-east-1')

cluster = 'openclaw-production-cluster'
alb_name = "openclaw-backend-alb"

for c in customers:
    subdomain = c.subdomain
    print(f"Cleaning up {subdomain}...")
    
    # 1. Delete ECS Service
    service_name = f"tenant-{subdomain}-service"
    try:
        ecs_client.update_service(cluster=cluster, service=service_name, desiredCount=0)
        ecs_client.delete_service(cluster=cluster, service=service_name, force=True)
        print(f"  - Deleted ECS Service {service_name}")
    except Exception as e:
        print(f"  - ECS Service error: {e}")

    # 2. Delete Listener Rule and Target Group
    tg_name = f"oc-tg-{subdomain}"[:32]
    try:
        tgs = elbv2_client.describe_target_groups(Names=[tg_name])['TargetGroups']
        if tgs:
            tg_arn = tgs[0]['TargetGroupArn']
            
            # Find and delete rules using this TG
            albs = elbv2_client.describe_load_balancers(Names=[alb_name])['LoadBalancers']
            alb_arn = albs[0]['LoadBalancerArn']
            listeners = elbv2_client.describe_listeners(LoadBalancerArn=alb_arn)['Listeners']
            
            for listener in listeners:
                rules = elbv2_client.describe_rules(ListenerArn=listener['ListenerArn'])['Rules']
                for rule in rules:
                    for action in rule.get('Actions', []):
                        if action.get('TargetGroupArn') == tg_arn:
                            elbv2_client.delete_rule(RuleArn=rule['RuleArn'])
                            print(f"  - Deleted Listener Rule for {subdomain}")
            
            elbv2_client.delete_target_group(TargetGroupArn=tg_arn)
            print(f"  - Deleted Target Group {tg_name}")
    except Exception as e:
        print(f"  - Target Group error: {e}")

    # 3. Delete SSM Params
    try:
        ssm_client.delete_parameter(Name=f"/openclaw/customers/{subdomain}/ADMIN_EMAIL")
        ssm_client.delete_parameter(Name=f"/openclaw/customers/{subdomain}/ADMIN_PASSWORD")
        print(f"  - Deleted SSM credentials")
    except Exception as e:
        pass

    # 4. Delete Database Record
    try:
        db.delete(c)
        db.commit()
        print(f"  - Deleted DB record")
    except Exception as e:
        db.rollback()
        print(f"  - DB error: {e}")

print("Cleanup complete!")
