import boto3
from datetime import datetime, timedelta

def get_recent_logs():
    client = boto3.client('logs', region_name='us-east-1')
    log_group = '/ecs/openclaw-backend'
    
    try:
        # Get all log streams, ordered by last event time
        streams = client.describe_log_streams(
            logGroupName=log_group,
            orderBy='LastEventTime',
            descending=True,
            limit=5
        )
        
        for stream in streams['logStreams']:
            print(f"\n--- Log Stream: {stream['logStreamName']} ---")
            events = client.get_log_events(
                logGroupName=log_group,
                logStreamName=stream['logStreamName'],
                startFromHead=False,
                limit=50
            )
            for event in events['events']:
                print(event['message'])
                
    except Exception as e:
        print(f"Error fetching logs: {e}")

if __name__ == '__main__':
    get_recent_logs()
