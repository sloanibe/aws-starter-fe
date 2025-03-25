#!/bin/bash
# Install RabbitMQ on an existing EC2 instance

set -e

# Configuration
EC2_IP=${1:-50.18.33.169}
EC2_USER=${2:-ubuntu}
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"

echo "Installing RabbitMQ on ${EC2_IP}..."

# Create installation script
echo "Creating installation script..."
cat > rabbitmq-install.sh << 'EOF'
#!/bin/bash
set -e

# Wait for apt locks to be released
wait_for_apt() {
  while sudo fuser /var/lib/dpkg/lock >/dev/null 2>&1 || sudo fuser /var/lib/apt/lists/lock >/dev/null 2>&1 || sudo fuser /var/cache/apt/archives/lock >/dev/null 2>&1; do
    echo "Waiting for apt locks to be released..."
    sleep 5
  done
}

# Update package lists
echo "Updating package lists..."
wait_for_apt
sudo apt-get update
wait_for_apt
sudo apt-get upgrade -y

# Install RabbitMQ server
echo "Installing RabbitMQ server..."
wait_for_apt
sudo apt-get install rabbitmq-server -y

# Enable and start RabbitMQ service
echo "Starting RabbitMQ service..."
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server

# Wait for RabbitMQ to be fully up
echo "Waiting for RabbitMQ to be ready..."
for i in {1..30}; do
  if sudo rabbitmqctl status >/dev/null 2>&1; then
    echo "RabbitMQ is ready!"
    break
  fi
  echo "Waiting for RabbitMQ... ($i/30)"
  sleep 5
  if [ $i -eq 30 ]; then
    echo "Timed out waiting for RabbitMQ to start"
    exit 1
  fi
done

# Enable RabbitMQ Management UI
echo "Enabling RabbitMQ Management UI..."
sudo rabbitmq-plugins enable rabbitmq_management

# Create admin user for management
echo "Creating admin user..."
sudo rabbitmqctl add_user admin admin123 || echo "User may already exist"
sudo rabbitmqctl set_user_tags admin administrator
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# Create application user with limited permissions
echo "Creating application user..."
sudo rabbitmqctl add_user aws-starter aws-starter-password || echo "User may already exist"
sudo rabbitmqctl set_permissions -p / aws-starter ".*" ".*" ".*"

# Install rabbitmqadmin CLI tool
echo "Installing rabbitmqadmin..."
wait_for_apt
sudo apt-get install -y python3 python3-pip
pip3 install requests

# Download rabbitmqadmin
sudo curl -o /usr/local/bin/rabbitmqadmin http://localhost:15672/cli/rabbitmqadmin
sudo chmod +x /usr/local/bin/rabbitmqadmin

# Create Exchange for Login Events
echo "Creating login.exchange..."
sudo rabbitmqadmin declare exchange name=login.exchange type=topic durable=true

# Create Queue for Login Events
echo "Creating login.events.queue..."
sudo rabbitmqadmin declare queue name=login.events.queue durable=true

# Bind Queue to Exchange
echo "Binding queue to exchange..."
sudo rabbitmqadmin declare binding source=login.exchange destination=login.events.queue routing_key="login.events"

# Enable HA policy for login queue
echo "Setting HA policy..."
sudo rabbitmqctl set_policy ha-login "^login\." '{"ha-mode":"all","ha-sync-mode":"automatic"}' --apply-to queues

# Open firewall ports for RabbitMQ
echo "Opening firewall ports..."
sudo ufw allow 5672/tcp
sudo ufw allow 15672/tcp

# Add hosts file entry for service discovery
echo "Adding hosts file entry for rabbitmq.internal..."
echo "127.0.0.1 rabbitmq.internal" | sudo tee -a /etc/hosts

echo "RabbitMQ installation completed successfully!"
EOF

# Make the installation script executable
chmod +x rabbitmq-install.sh

# Copy installation script to EC2
echo "Copying installation script to EC2..."
scp -i "${SSH_KEY}" rabbitmq-install.sh ${EC2_USER}@${EC2_IP}:~/

# Execute installation script on EC2
echo "Executing installation script on EC2..."
ssh -i "${SSH_KEY}" ${EC2_USER}@${EC2_IP} "chmod +x ~/rabbitmq-install.sh && ~/rabbitmq-install.sh"

# Clean up local installation script
rm rabbitmq-install.sh

echo "RabbitMQ installed successfully!"
echo "Management UI available at: http://${EC2_IP}:15672"
echo "Username: admin"
echo "Password: admin123"

# Update configuration in other services
echo "Updating RabbitMQ configuration in services..."

# Update Login Service configuration
LOGIN_ENV_FILE="/home/msloan/gitprojects/aws-starter/login-service/.env"
if [ -f "${LOGIN_ENV_FILE}" ]; then
  echo "Updating Login Service .env file..."
  sed -i "s/RABBITMQ_HOST=.*/RABBITMQ_HOST=${EC2_IP}/g" "${LOGIN_ENV_FILE}"
  sed -i "s/RABBITMQ_ENABLED=.*/RABBITMQ_ENABLED=true/g" "${LOGIN_ENV_FILE}"
  echo "Login Service configuration updated."
fi

# Update Email Service configuration
EMAIL_ENV_FILE="/home/msloan/gitprojects/aws-starter/email-service/.env"
if [ -f "${EMAIL_ENV_FILE}" ]; then
  echo "Updating Email Service .env file..."
  sed -i "s/RABBITMQ_HOST=.*/RABBITMQ_HOST=${EC2_IP}/g" "${EMAIL_ENV_FILE}"
  echo "Email Service configuration updated."
fi

echo ""
echo "Next steps:"
echo "1. Deploy the Login Service with: ./scripts/deploy/deploy-login-service.sh"
echo "2. Deploy the Email Service with: ./scripts/deploy/deploy-email-service.sh"
echo "3. Test the end-to-end login flow with RabbitMQ integration"
