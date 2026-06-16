import boto3

def search_logs():
    client = boto3.client('logs', region_name='us-east-1')
    log_group = '/ecs/openclaw-backend'
    
    try:
        streams = client.describe_log_streams(
            logGroupName=log_group,
            orderBy='LastEventTime',
            descending=True,
            limit=5
        )
        for stream in streams['logStreams']:
            events = client.get_log_events(
                logGroupName=log_group,
                logStreamName=stream['logStreamName'],
                startFromHead=False,
                limit=1000
            )
            for i, event in enumerate(events['events']):
                if '500 Internal Server Error' in event['message']:
                    start = max(0, i - 1)
                    end = min(len(events['events']), i + 20)
                    for j in range(start, end):
                        print(events['events'][j]['message'])
                    print("="*50)
                    break
                
    except Exception as e:
        print(f"Error fetching logs: {e}")

if __name__ == '__main__':
    search_logs()
