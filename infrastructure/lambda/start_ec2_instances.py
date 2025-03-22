import boto3
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Lambda function to start EC2 instances tagged with AutoStop=true
    """
    ec2 = boto3.resource('ec2')
    
    # Find all stopped instances with AutoStop=true tag
    filters = [
        {'Name': 'tag:AutoStop', 'Values': ['true']},
        {'Name': 'instance-state-name', 'Values': ['stopped']}
    ]
    
    instances = ec2.instances.filter(Filters=filters)
    instance_ids = [instance.id for instance in instances]
    
    if not instance_ids:
        logger.info("No stopped instances found with AutoStop=true tag")
        return {
            'statusCode': 200,
            'body': 'No instances to start'
        }
    
    # Start the instances
    ec2.instances.filter(InstanceIds=instance_ids).start()
    
    logger.info(f"Starting instances: {', '.join(instance_ids)}")
    
    return {
        'statusCode': 200,
        'body': f"Starting instances: {', '.join(instance_ids)}"
    }
