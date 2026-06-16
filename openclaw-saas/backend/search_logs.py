import boto3

def search_logs():
    client = boto3.client('logs', region_name='us-east-1')
    log_group = '/ecs/openclaw-backend'
    
    try:
        response = client.filter_log_events(
            logGroupName=log_group,
            filterPattern='?Error ?Exception ?500',
            interleaved=True,
            limit=50
        )
        
        for event in response.get('events', []):
            print(event['timestamp'], event['message'])
                
    except Exception as e:
        print(f"Error fetching logs: {e}")

if __name__ == '__main__':
    search_logs()
