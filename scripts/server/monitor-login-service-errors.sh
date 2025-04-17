#!/bin/bash
# Real-time Login Service Error Monitor
# Tails the login-service systemd logs and highlights error conditions (RabbitMQ, ERROR, Exception, etc)
# Usage: ./monitor-login-service-errors.sh [login-service-name]

SERVICE_NAME="${1:-login-service}"

# Patterns to watch for (case-insensitive)
PATTERNS="ERROR|Exception|rabbitmq|connection refused|amqp|fail|unreachable|timeout"

# Colors for highlighting
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print header
printf "${YELLOW}Monitoring logs for service: %s${NC}\n" "$SERVICE_NAME"
printf "${YELLOW}Highlighting lines containing: %s${NC}\n" "$PATTERNS"
printf "Press Ctrl+C to stop.\n\n"

# Tail logs and highlight error lines
journalctl -u "$SERVICE_NAME" -f -n 20 |
  grep --line-buffered -Ei "$PATTERNS" |
  while IFS= read -r line; do
    printf "${RED}[ALERT][%s] %s${NC}\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$line"
  done
