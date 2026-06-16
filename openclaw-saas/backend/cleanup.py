import boto3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

ssm_client = boto3.client('ssm', region_name='us-east-1')
route53_client = boto3.client('route53', region_name='us-east-1')

print("Fetching customers from DB...")
result = db.execute(text("SELECT id, subdomain FROM customers"))
customers = result.fetchall()

print(f"Found {len(customers)} customers.")

for customer in customers:
    subdomain = customer[1]
    print(f"\nCleaning up resources for: {subdomain}")
    
    # 1. Delete SSM Parameter
    param_name = f"/openclaw/customers/{subdomain}/OPENAI_API_KEY"
    try:
        ssm_client.delete_parameter(Name=param_name)
        print(f"Deleted SSM Parameter: {param_name}")
    except ssm_client.exceptions.ParameterNotFound:
        print(f"SSM Parameter not found: {param_name}")
    except Exception as e:
        print(f"Error deleting SSM Parameter: {e}")

    # 2. Delete Route53 Hosted Zone
    try:
        hz_name = f"{subdomain}.niyogen.com."
        zones_response = route53_client.list_hosted_zones_by_name(DNSName=hz_name)
        
        for zone in zones_response.get('HostedZones', []):
            if zone['Name'] == hz_name:
                zone_id = zone['Id']
                
                # We need to delete all non-default records before we can delete the zone
                print(f"Emptying Route53 Zone: {zone_id}")
                records = route53_client.list_resource_record_sets(HostedZoneId=zone_id)['ResourceRecordSets']
                changes = []
                for record in records:
                    if record['Type'] not in ['NS', 'SOA']:
                        changes.append({
                            'Action': 'DELETE',
                            'ResourceRecordSet': record
                        })
                
                if changes:
                    route53_client.change_resource_record_sets(
                        HostedZoneId=zone_id,
                        ChangeBatch={'Changes': changes}
                    )
                
                route53_client.delete_hosted_zone(Id=zone_id)
                print(f"Deleted Route53 Hosted Zone: {hz_name}")
                
    except Exception as e:
        print(f"Error deleting Route53 Hosted Zone: {e}")

print("\nDeleting all records from database...")
db.execute(text("DELETE FROM customers"))
db.commit()
print("Database cleared!")
