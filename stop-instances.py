import boto3
import os

def lambda_handler(event, context):
    ec2 = boto3.client('ec2', region_name='us-west-1')
    
    # Get instance IDs with the specified tag
    instances_to_stop = []
    response = ec2.describe_instances(
        Filters=[
            {
                'Name': 'tag:AutoStop',
                'Values': ['true']
            },
            {
                'Name': 'instance-state-name',
                'Values': ['running']
            }
        ]
    )
    
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instances_to_stop.append(instance['InstanceId'])
    
    if instances_to_stop:
        ec2.stop_instances(InstanceIds=instances_to_stop)
        print(f"Stopped instances: {instances_to_stop}")
    else:
        print("No instances to stop")
    
    return {
        'statusCode': 200,
        'body': f"Processed instances: {instances_to_stop}"
    }
