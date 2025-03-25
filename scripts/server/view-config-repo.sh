#!/bin/bash

# Script to view the Spring Cloud Config Server's cloned repository
# Usage: ./view-config-repo.sh [list|view|search] [file-pattern|search-term]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Instance details
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"

# Default values
ACTION="list"
PATTERN=""
SERVICE=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        list|view|search|edit) ACTION="$1" ;;
        --service=*) SERVICE="${1#*=}" ;;
        --pattern=*) PATTERN="${1#*=}" ;;
        *) 
            if [ -z "$PATTERN" ]; then
                PATTERN="$1"
            else
                echo "Unknown parameter: $1"; exit 1
            fi
            ;;
    esac
    shift
done

# Function to find the latest config repo directory
find_config_repo() {
    echo "🔍 Finding the latest Config Server repository clone..."
    
    # Find the most recently modified config-repo directory
    CONFIG_REPO_DIR=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "find /tmp -path '*/config-repo' -type d -print0 | xargs -0 ls -td | head -n 1")
    
    if [ -z "$CONFIG_REPO_DIR" ]; then
        echo "❌ No Config Server repository clone found."
        exit 1
    fi
    
    echo "✅ Found Config Server repository at: $CONFIG_REPO_DIR"
    echo "$CONFIG_REPO_DIR"
}

# Function to list files in the config repo
list_files() {
    local repo_dir=$1
    local pattern=$2
    local service=$3
    
    echo "📋 Listing files in the Config Server repository..."
    
    if [ -n "$service" ]; then
        echo "🔍 Filtering by service: $service"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "find $repo_dir -path '*/$service/*' -type f | sort"
        return
    fi
    
    if [ -n "$pattern" ]; then
        echo "🔍 Filtering by pattern: $pattern"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "find $repo_dir -name \"$pattern\" -type f | sort"
        return
    fi
    
    # List all files
    ssh -i $SSH_KEY ubuntu@$EC2_IP "find $repo_dir -type f | sort"
}

# Function to view a file
view_file() {
    local repo_dir=$1
    local pattern=$2
    
    if [ -z "$pattern" ]; then
        echo "❌ Error: No file pattern specified for viewing."
        echo "Usage: ./view-config-repo.sh view [file-pattern]"
        exit 1
    fi
    
    echo "📄 Viewing file matching pattern: $pattern"
    
    # Find the file
    local file=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "find $repo_dir -name \"$pattern\" -type f | head -n 1")
    
    if [ -z "$file" ]; then
        echo "❌ No file found matching pattern: $pattern"
        exit 1
    fi
    
    echo "📄 Viewing file: $file"
    echo "----------------------------------------"
    ssh -i $SSH_KEY ubuntu@$EC2_IP "cat \"$file\""
    echo "----------------------------------------"
}

# Function to search for content within files
search_content() {
    local repo_dir=$1
    local search_term=$2
    local service=$3
    
    if [ -z "$search_term" ]; then
        echo "❌ Error: No search term specified."
        echo "Usage: ./view-config-repo.sh search [search-term]"
        exit 1
    fi
    
    echo "🔍 Searching for content: $search_term"
    
    if [ -n "$service" ]; then
        echo "🔍 Filtering by service: $service"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "grep -r \"$search_term\" $repo_dir/*/$service/ --include=\"*.yml\" --include=\"*.properties\" --include=\"*.json\" --color=always"
        return
    fi
    
    # Search all files
    ssh -i $SSH_KEY ubuntu@$EC2_IP "grep -r \"$search_term\" $repo_dir --include=\"*.yml\" --include=\"*.properties\" --include=\"*.json\" --color=always"
}

# Main script execution
CONFIG_REPO_DIR=$(find_config_repo)

case $ACTION in
    list)
        list_files "$CONFIG_REPO_DIR" "$PATTERN" "$SERVICE"
        ;;
    view)
        view_file "$CONFIG_REPO_DIR" "$PATTERN"
        ;;
    search)
        search_content "$CONFIG_REPO_DIR" "$PATTERN" "$SERVICE"
        ;;
    *)
        echo "❌ Unknown action: $ACTION"
        echo "Usage: ./view-config-repo.sh [list|view|search] [file-pattern|search-term]"
        exit 1
        ;;
esac
