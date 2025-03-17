#!/bin/bash

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Set email address
EMAIL="sloanibe@gmail.com"
ENVIRONMENT="dev"

# Deploy CloudFormation stack
STACK_NAME="aws-starter-ses-$ENVIRONMENT"

echo "Deploying SES configuration..."
aws cloudformation deploy \
    --template-file ../../cloudformation/ses-email.yml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        SenderEmail=$EMAIL \
        NotificationEmail=$EMAIL \
        Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]; then
    echo "SES stack deployment completed successfully!"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Check your email ($EMAIL) for a verification request from AWS SES"
    echo "2. Click the verification link in the email"
    echo "4. The template and IAM roles will be ready once emails are verified"
    echo ""
    echo "Note: Your SES account will be in sandbox mode initially."
    echo "This is perfect for development but has these limitations:"
    echo "- Can only send to verified email addresses"
    echo "- Daily sending quota of 200 emails"
    echo ""
    echo "To move out of sandbox mode (for production), you'll need to request"
    echo "production access through the AWS SES console."
else
    echo "SES stack deployment failed. Check the AWS CloudFormation console for details."
fi
