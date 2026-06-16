import boto3
import os

ecs = boto3.client('ecs', region_name='us-east-1')
response = ecs.describe_task_definition(taskDefinition='tenant-ranga2-task:1')
task_def = response['taskDefinition']

# remove properties not needed for registration
del task_def['taskDefinitionArn']
del task_def['revision']
del task_def['status']
del task_def['requiresAttributes']
del task_def['compatibilities']
del task_def['registeredAt']
del task_def['registeredBy']

# append DATABASE_URL
env = task_def['containerDefinitions'][0]['environment']
env.append({
    'name': 'DATABASE_URL',
    'value': 'postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres'
})

new_response = ecs.register_task_definition(**task_def)
new_arn = new_response['taskDefinition']['taskDefinitionArn']

# update service
ecs.update_service(
    cluster='openclaw-production-cluster',
    service='tenant-ranga2-service',
    taskDefinition=new_arn,
    forceNewDeployment=True
)
print("Updated successfully")
