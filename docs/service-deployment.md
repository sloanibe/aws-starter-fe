# Service Deployment Guide

This document describes how microservices in this project are built, securely configured, and deployed to AWS EC2, following best practices and ensuring consistency across all services.

---

## Overview

Each microservice in this project (e.g., Config Server, Login Service, Email Service) is built as a standalone Spring Boot JAR and deployed to a managed EC2 instance. Deployment is automated through dedicated shell scripts, and service configuration is managed using environment variables and a centralized config repository.

---

## Build & Deployment Workflow

**1. Build**
- Each service includes a Maven wrapper (`mvnw`).
- The deployment script runs `./mvnw clean package -DskipTests` to generate the JAR file in the `target/` directory.

**2. Prepare Environment File**
- Sensitive and environment-specific configuration (API keys, DB credentials, ports, etc.) are stored in a `.env` file in the service directory.
- The deployment script generates or updates this file before copying to the server.

**3. Transfer Files to EC2**
- The script uses `scp` and `ssh` with a secure SSH key to transfer:
  - The JAR file (e.g., `email-service.jar`)
  - The `.env` file
  - The systemd unit file (e.g., `email-service.service`)
- Files are placed in `/home/ubuntu/<service-name>/` on the EC2 instance (user and path must match systemd unit file).

**4. Systemd Service Installation**
- The systemd unit file is copied to `/etc/systemd/system/`.
- It specifies:
  - `User=ubuntu`
  - `WorkingDirectory=/home/ubuntu/<service-name>`
  - `EnvironmentFile=/home/ubuntu/<service-name>/.env`
  - `ExecStart=/usr/bin/java -jar <service-name>.jar`
- The script reloads systemd, enables, and restarts the service.

**5. Health Check**
- After restart, the script checks the `/actuator/health` endpoint to confirm the service is running and healthy.

---

## Configuration & Secrets Management

- **Centralized Config:**
  - Shared and service-specific configuration is stored in a GitHub `config-repo` (see `microservices-architecture.md` for structure).
  - The Config Server loads these at runtime and exposes them to services.

- **Environment Variables:**
  - `.env` files are used for secrets and sensitive settings.
  - These are never committed to source control.
  - Deployment scripts generate or update `.env` files as needed.

- **Security:**
  - SSH keys are used for secure file transfer and remote commands.
  - Secrets are injected at deploy time, not stored in code.

---

## Example: Email Service Deployment

1. Build the JAR:
   ```bash
   ./mvnw clean package -DskipTests
   ```
2. Generate `.env` file with secrets and config.
3. Copy JAR, `.env`, and `.service` files to `/home/ubuntu/email-service/` on EC2.
4. Copy systemd unit to `/etc/systemd/system/email-service.service`.
5. Reload systemd and (re)start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable email-service.service
   sudo systemctl restart email-service.service
   ```
6. Confirm health at `http://<EC2_IP>:8082/actuator/health`.

---

## Troubleshooting
- Check service logs with:
  ```bash
  sudo systemctl status <service>.service
  sudo journalctl -u <service>.service --no-pager | tail -40
  ```
- Ensure `.env` and JAR files exist and match paths in the systemd unit file.
- Verify config server is running if services rely on it.

---

## References
- See [`docs/microservices-architecture.md`](./microservices-architecture.md) for the overall system architecture and config repo structure.
- Deployment scripts are located in `scripts/deploy/`.

---

This guide ensures all services are deployed in a secure, consistent, and reliable manner on AWS EC2.
