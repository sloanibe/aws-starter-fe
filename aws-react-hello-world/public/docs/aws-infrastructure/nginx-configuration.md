# NGINX Configuration for AWS Starter Project

## Introduction to NGINX

NGINX (pronounced "engine-x") is a powerful, open-source web server that can also function as a reverse proxy, load balancer, mail proxy, and HTTP cache. In the context of our AWS Starter Project, NGINX plays a crucial role in handling HTTP requests, managing SSL/TLS termination, and routing traffic to our Spring Boot application.

## Why We Need NGINX in This Application

### 1. Reverse Proxy Functionality

Our Spring Boot application runs on port 8080, but we want to expose it on standard HTTP/HTTPS ports (80/443). NGINX acts as a reverse proxy, accepting requests on ports 80 and 443, and forwarding them to our Spring Boot application running on port 8080.

```
Client Request (port 80/443) → NGINX → Spring Boot (port 8080)
```

### 2. SSL/TLS Termination

NGINX handles SSL/TLS termination for our application. This means:
- NGINX manages the SSL certificates
- Incoming HTTPS connections are decrypted by NGINX
- Requests are forwarded to the Spring Boot application as HTTP (internally)
- This offloads the CPU-intensive SSL processing from our application server

### 3. Security Benefits

- NGINX can hide the internal structure of our backend network
- It provides an additional layer of security by filtering requests
- It can protect against common web vulnerabilities and DDoS attacks
- Only necessary ports need to be exposed to the internet

### 4. Performance Optimization

- NGINX efficiently handles static content delivery
- It can compress responses to reduce bandwidth usage
- Connection pooling reduces the load on the backend server
- Caching capabilities improve response times for frequently accessed content

## Installation on EC2 Instance

NGINX was installed on our EC2 instance using the following steps:

1. Update the package index:
   ```bash
   sudo apt update
   ```

2. Install NGINX:
   ```bash
   sudo apt install nginx
   ```

3. Start NGINX and enable it to start on boot:
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

## NGINX Configuration

Our NGINX configuration is located at `/etc/nginx/sites-available/api.sloandev.net` with a symbolic link from `/etc/nginx/sites-enabled/`.

Here's the configuration we're using:

```nginx
server {
    listen 80;
    server_name api.sloandev.net;
    
    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.sloandev.net;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/api.sloandev.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sloandev.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Proxy settings for Spring Boot application
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Key Configuration Elements Explained

1. **HTTP to HTTPS Redirection**:
   The first server block listens on port 80 (HTTP) and redirects all traffic to HTTPS.

2. **SSL Configuration**:
   - `ssl_certificate` and `ssl_certificate_key`: Paths to our Let's Encrypt SSL certificate files
   - `ssl_protocols`: Specifies which SSL/TLS protocols are allowed (we only allow secure ones)
   - `ssl_ciphers`: Defines which encryption algorithms can be used
   - `ssl_session_cache` and `ssl_session_timeout`: Performance optimizations for SSL handshakes

3. **Proxy Settings**:
   - `proxy_pass`: Forwards requests to our Spring Boot application running on port 8080
   - `proxy_set_header`: Passes important headers to the backend, including:
     - Original host name
     - Client's real IP address
     - X-Forwarded headers for proper protocol detection

## SSL Certificate Setup with Let's Encrypt

We used Certbot to obtain and configure our SSL certificates from Let's Encrypt:

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain and install certificates:
   ```bash
   sudo certbot --nginx -d api.sloandev.net
   ```

3. Certbot automatically configured NGINX to use the new certificates and set up auto-renewal via a cron job.

## Testing NGINX Configuration

### 1. Syntax Validation

Before applying any configuration changes, always validate the NGINX configuration syntax:

```bash
sudo nginx -t
```

A successful test will show:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 2. Connection Testing

To verify NGINX is properly forwarding requests to our Spring Boot application:

1. **Check NGINX Status**:
   ```bash
   sudo systemctl status nginx
   ```
   
   Look for `active (running)` in the output.

2. **Test HTTP to HTTPS Redirection**:
   ```bash
   curl -I http://api.sloandev.net
   ```
   
   You should see a `301 Moved Permanently` response with a `Location` header pointing to the HTTPS URL.

3. **Test HTTPS Connection**:
   ```bash
   curl -I https://api.sloandev.net
   ```
   
   You should see a `200 OK` response if the Spring Boot application is running.

4. **Test API Endpoint**:
   ```bash
   curl https://api.sloandev.net/api/test
   ```
   
   This should return the expected response from your Spring Boot application.

### 3. SSL Certificate Validation

Verify your SSL certificate is properly configured:

```bash
openssl s_client -connect api.sloandev.net:443 -servername api.sloandev.net
```

Look for:
- Certificate chain information
- "Verify return code: 0 (ok)" indicating the certificate is valid

### 4. Browser Testing

Open a web browser and navigate to:
- http://api.sloandev.net (should redirect to HTTPS)
- https://api.sloandev.net/api/test (should show the API response)

Check that:
- The connection is secure (look for the padlock icon)
- No mixed content warnings appear
- The certificate is valid and trusted

## Troubleshooting NGINX

### Common Issues and Solutions

1. **NGINX Won't Start**:
   ```bash
   sudo systemctl status nginx
   ```
   
   Check the error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Permission Denied Errors**:
   Ensure NGINX has proper permissions to read configuration files and SSL certificates:
   ```bash
   sudo chmod -R 755 /etc/nginx/
   sudo chmod -R 755 /etc/letsencrypt/live/
   sudo chmod -R 755 /etc/letsencrypt/archive/
   ```

3. **Connection Refused to Backend**:
   Verify the Spring Boot application is running:
   ```bash
   sudo netstat -tulpn | grep 8080
   ```

4. **SSL Certificate Issues**:
   Check certificate expiration:
   ```bash
   sudo certbot certificates
   ```
   
   Renew certificates if needed:
   ```bash
   sudo certbot renew --dry-run
   ```

### NGINX Logs

NGINX logs are essential for troubleshooting:

- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`

To monitor logs in real-time:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Maintenance and Updates

### Reloading Configuration

After making changes to NGINX configuration files, reload NGINX to apply them without downtime:

```bash
sudo systemctl reload nginx
```

### Restarting NGINX

If a full restart is needed:

```bash
sudo systemctl restart nginx
```

### Updating NGINX

Keep NGINX updated with security patches:

```bash
sudo apt update
sudo apt upgrade nginx
```

### SSL Certificate Renewal

Let's Encrypt certificates are valid for 90 days. Certbot sets up automatic renewal, but you can manually trigger renewal:

```bash
sudo certbot renew
```

## Conclusion

NGINX plays a vital role in our AWS Starter Project by providing:
- A secure HTTPS endpoint for our API
- Professional-grade SSL/TLS handling
- Efficient request routing to our Spring Boot application
- An additional layer of security for our backend

Understanding how NGINX works and is configured helps with troubleshooting connectivity issues and ensures our application remains secure and accessible.
