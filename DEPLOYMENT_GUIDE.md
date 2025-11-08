# Brain Gym - Self-Hosting Deployment Guide

This comprehensive guide will help you deploy the Brain Gym application on your own infrastructure, completely independent of Replit.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Windows Setup Guide](#windows-setup-guide)
3. [Local Development Setup](#local-development-setup)
4. [Deployment Options](#deployment-options)
   - [Option 1: VPS (DigitalOcean, AWS EC2, Linode, etc.)](#option-1-vps-deployment)
   - [Option 2: Vercel (Frontend + Serverless Backend)](#option-2-vercel-deployment)
   - [Option 3: Railway](#option-3-railway-deployment)
   - [Option 4: Docker Deployment](#option-4-docker-deployment)
   - [Option 5: Windows Server (IIS) Deployment](#option-5-windows-server-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js 20.x or higher** installed on your local machine
- **npm** (comes with Node.js)
- **Git** for version control
- A code editor (VS Code recommended)
- Basic command line knowledge

---

## Windows Setup Guide

### Installing Node.js on Windows

**Step 1: Download Node.js**

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (20.x or higher)
3. Run the installer (.msi file)
4. Follow the installation wizard:
   - Accept the license agreement
   - Choose installation path (default is fine: `C:\Program Files\nodejs`)
   - **Check "Automatically install necessary tools"** (this includes build tools)
   - Click Install

**Step 2: Verify Installation**

Open **PowerShell** or **Command Prompt** and run:

```powershell
node --version
# Should show v20.x.x

npm --version
# Should show 10.x.x or higher
```

### Installing Git on Windows

1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer
3. Use default settings (recommended)
4. Verify installation:
   ```powershell
   git --version
   ```

### Recommended Tools for Windows

- **Windows Terminal** (from Microsoft Store) - Better terminal experience
- **Visual Studio Code** - Best code editor for this project
  - Download from [code.visualstudio.com](https://code.visualstudio.com/)
- **PowerShell 7** (optional but recommended)
  - Download from [Microsoft PowerShell](https://github.com/PowerShell/PowerShell)

### Using PowerShell vs Command Prompt

Throughout this guide:
- Commands starting with `$` are for PowerShell
- Commands without `$` work in both PowerShell and Command Prompt
- Linux commands (for VPS) remain as shown (run those on your server, not Windows)

### Windows-Specific Considerations

**File Paths:**
- Windows uses backslashes: `C:\Users\YourName\brain-gym`
- In commands, you can use forward slashes: `cd brain-gym`

**Environment Variables:**
Windows PowerShell:
```powershell
$env:NODE_ENV = "production"
```

Command Prompt:
```cmd
set NODE_ENV=production
```

**Port Issues:**
If port 5000 is in use on Windows:
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## Local Development Setup

### Step 1: Clone or Download the Project

If you have the project on Replit, download it:
1. Open your Replit project
2. Click on the three dots menu
3. Select "Download as zip"
4. Extract the zip file to your desired location

Or if you have it in Git:
```bash
git clone <your-repository-url>
cd brain-gym
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Locally

```bash
npm run dev
```

The application will start on `http://localhost:5000`

---

## Deployment Options

## Option 1: VPS Deployment

Deploy on a Virtual Private Server (DigitalOcean, AWS EC2, Linode, Vultr, etc.)

### Step 1: Set Up Your VPS

1. **Create a VPS instance**
   - Choose Ubuntu 22.04 LTS (recommended)
   - Minimum: 1GB RAM, 1 CPU core, 25GB storage
   - Recommended: 2GB RAM, 2 CPU cores, 50GB storage

2. **Connect to your VPS via SSH**
   ```bash
   ssh root@your-server-ip
   ```

### Step 2: Install Node.js and npm

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### Step 3: Install Process Manager (PM2)

```bash
sudo npm install -g pm2
```

### Step 4: Clone Your Project

```bash
# Install git if needed
sudo apt install -y git

# Clone your repository or upload files
# Option A: Using git
git clone <your-repository-url>
cd brain-gym

# Option B: Upload files using SCP from your local machine
# scp -r /path/to/brain-gym root@your-server-ip:/root/
```

### Step 5: Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Step 6: Start with PM2

```bash
# Start the application
pm2 start npm --name "brain-gym" -- run start

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

### Step 7: Set Up Nginx as Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/brain-gym
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/brain-gym /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Set Up SSL with Let's Encrypt (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically, verify with:
sudo certbot renew --dry-run
```

### Step 9: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### PM2 Management Commands

```bash
# View running applications
pm2 list

# View logs
pm2 logs brain-gym

# Restart application
pm2 restart brain-gym

# Stop application
pm2 stop brain-gym

# Monitor in real-time
pm2 monit
```

---

## Option 2: Vercel Deployment

Vercel is great for quick deployments with automatic HTTPS and global CDN.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Prepare Your Project

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### Step 3: Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: (select your account)
# - Link to existing project: N
# - Project name: brain-gym
# - Directory: ./
# - Override settings: N

# Deploy to production
vercel --prod
```

---

## Option 3: Railway Deployment

Railway offers simple deployments with automatic deployments from Git.

### Step 1: Sign Up and Connect Repository

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### Step 2: Configure Build Settings

Railway will auto-detect your Node.js app, but verify:

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

### Step 3: Add Environment Variables

In Railway dashboard:
1. Click on your project
2. Go to "Variables" tab
3. Add any required environment variables

### Step 4: Deploy

Railway will automatically deploy. Get your URL from the "Deployments" tab.

### Step 5: Add Custom Domain (Optional)

1. Go to "Settings" tab
2. Under "Domains", click "Add Domain"
3. Enter your custom domain
4. Add the provided DNS records to your domain registrar

---

## Option 4: Docker Deployment

Deploy using Docker containers for maximum portability.

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start application
CMD ["npm", "run", "start"]
```

### Step 2: Create .dockerignore

Create `.dockerignore` file:

```
node_modules
.git
.gitignore
README.md
.env
.DS_Store
npm-debug.log
```

### Step 3: Build Docker Image

```bash
docker build -t brain-gym:latest .
```

### Step 4: Run Docker Container

```bash
docker run -d \
  --name brain-gym \
  -p 5000:5000 \
  --restart unless-stopped \
  brain-gym:latest
```

### Step 5: Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run with:
```bash
docker-compose up -d
```

---

## Option 5: Windows Server Deployment

Deploy on Windows Server using IIS (Internet Information Services) or run as a Windows Service.

### Method A: Running as Windows Service with PM2

**Step 1: Install PM2 on Windows**

Open PowerShell as Administrator:

```powershell
npm install -g pm2
npm install -g pm2-windows-startup

# Configure PM2 to start on Windows boot
pm2-startup install
```

**Step 2: Navigate to Your Project**

```powershell
cd C:\Path\To\brain-gym
```

**Step 3: Install Dependencies and Build**

```powershell
npm install
npm run build
```

**Step 4: Start with PM2**

```powershell
# Start the application
pm2 start npm --name "brain-gym" -- run start

# Save PM2 configuration
pm2 save

# View status
pm2 status
```

**Step 5: Configure Windows Firewall**

```powershell
# Allow port 5000 through Windows Firewall
New-NetFirewallRule -DisplayName "Brain Gym App" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### Method B: Deploying with IIS (Advanced)

**Prerequisites:**
- Windows Server 2016 or higher
- IIS installed with URL Rewrite and Application Request Routing modules

**Step 1: Install IIS URL Rewrite Module**

1. Download from [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
2. Install the module

**Step 2: Install iisnode**

1. Download from [iisnode GitHub](https://github.com/Azure/iisnode/releases)
2. Install the appropriate version (x64 for 64-bit Windows)

**Step 3: Configure Your Application**

Create `web.config` in your project root:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeApp">
          <match url="/*" />
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode
      node_env="production"
      nodeProcessCommandLine="&quot;C:\Program Files\nodejs\node.exe&quot;"
      loggingEnabled="true"
      debuggingEnabled="false" />
  </system.webServer>
</configuration>
```

**Step 4: Create IIS Website**

1. Open **IIS Manager**
2. Right-click **Sites** → **Add Website**
3. Configure:
   - **Site name**: BrainGym
   - **Physical path**: `C:\Path\To\brain-gym`
   - **Port**: 80 (or 443 for HTTPS)
4. Click **OK**

**Step 5: Set Application Pool**

1. Select your site in IIS
2. Click **Application Pools**
3. Find your app pool → **Advanced Settings**
4. Set **.NET CLR Version** to **No Managed Code**

### Method C: Using Docker Desktop for Windows

**Step 1: Install Docker Desktop**

1. Download from [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install and restart your computer
3. Ensure WSL 2 is enabled

**Step 2: Build and Run**

```powershell
# Build the Docker image
docker build -t brain-gym:latest .

# Run the container
docker run -d `
  --name brain-gym `
  -p 5000:5000 `
  --restart unless-stopped `
  brain-gym:latest
```

### Windows Service Management

**Using PM2 (PowerShell):**

```powershell
# View all services
pm2 list

# View logs
pm2 logs brain-gym

# Restart service
pm2 restart brain-gym

# Stop service
pm2 stop brain-gym

# Delete service
pm2 delete brain-gym

# Monitor in real-time
pm2 monit
```

### Connecting from Windows to Linux VPS

**Using PuTTY (SSH Client for Windows):**

1. Download [PuTTY](https://www.putty.org/)
2. Run PuTTY
3. Enter your server IP in "Host Name"
4. Click "Open"
5. Login with your credentials

**Using Windows Terminal (Recommended):**

1. Install Windows Terminal from Microsoft Store
2. Open PowerShell tab
3. Connect via SSH:
   ```powershell
   ssh root@your-server-ip
   ```

**Using WinSCP for File Transfer:**

1. Download [WinSCP](https://winscp.net/)
2. Connect to your server
3. Drag and drop files to upload

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Add any other environment variables your app needs
```

---

## Database Setup

This application uses **in-memory storage** by default. For production, consider:

### Option 1: Continue with In-Memory Storage

- **Pros**: Simple, no database setup needed
- **Cons**: Data is lost when server restarts

The current implementation is fine for testing/demo purposes.

### Option 2: Add PostgreSQL Database

If you want persistent storage:

1. **Install PostgreSQL** on your VPS or use a managed service:
   - [Neon](https://neon.tech) - Free tier available
   - [Supabase](https://supabase.com) - Free tier available
   - [Railway](https://railway.app) - PostgreSQL addon

2. **Update your code** to use PostgreSQL instead of in-memory storage (modify `server/storage.ts`)

3. **Add database URL** to environment variables:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

---

## Custom Domain Setup

### DNS Configuration

Point your domain to your server:

1. **For VPS Deployment**:
   - Add an A record: `@` → `your-server-ip`
   - Add an A record: `www` → `your-server-ip`

2. **For Vercel/Railway**:
   - Follow their custom domain instructions in the dashboard
   - Usually requires adding CNAME or A records

### Common DNS Providers

- **Namecheap**: Dashboard → Domain List → Manage → Advanced DNS
- **GoDaddy**: Domains → DNS → Manage DNS
- **Cloudflare**: DNS → Add record

DNS propagation can take up to 48 hours but usually completes in 1-2 hours.

---

## Troubleshooting

### Application Won't Start

```bash
# Check if port 5000 is already in use
sudo lsof -i :5000

# Kill the process if needed
sudo kill -9 <PID>

# Check application logs
pm2 logs brain-gym
```

### Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Can't Access Website

1. **Check firewall**: `sudo ufw status`
2. **Verify Nginx is running**: `sudo systemctl status nginx`
3. **Check application is running**: `pm2 list`
4. **Verify DNS propagation**: Use [whatsmydns.net](https://www.whatsmydns.net)

### Application Crashes

```bash
# View PM2 logs
pm2 logs brain-gym --lines 100

# Restart application
pm2 restart brain-gym

# Check system resources
htop  # or: top
```

### Windows-Specific Troubleshooting

**Port Already in Use (Windows)**

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port by setting environment variable
$env:PORT = "3000"
npm run dev
```

**npm install Fails on Windows**

```powershell
# Run PowerShell as Administrator
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install

# If still fails, try with --legacy-peer-deps
npm install --legacy-peer-deps
```

**Permission Errors on Windows**

```powershell
# Run PowerShell as Administrator (right-click → Run as Administrator)

# Fix npm permissions
npm config set prefix "C:\Users\YourUsername\AppData\Roaming\npm"

# Add to PATH if needed
$env:Path += ";C:\Users\YourUsername\AppData\Roaming\npm"
```

**PM2 Not Starting on Windows Boot**

```powershell
# Reinstall PM2 startup
pm2 unstartup
pm2-startup install

# Save current PM2 list
pm2 save

# Test by restarting computer
```

**TypeScript Build Errors**

```powershell
# Delete dist folder
Remove-Item -Recurse -Force dist

# Clean install
npm run build
```

**IIS Issues (Windows Server)**

1. **Application Pool Crashes**:
   - Check Event Viewer → Windows Logs → Application
   - Ensure .NET CLR Version is set to "No Managed Code"

2. **500 Errors**:
   - Enable detailed errors in web.config
   - Check iisnode logs in `iisnode` folder

3. **Static Files Not Loading**:
   - Add static content handler in IIS
   - Check folder permissions

**Firewall Blocking Connection**

```powershell
# Check if firewall rule exists
Get-NetFirewallRule -DisplayName "Brain Gym*"

# Add rule if missing
New-NetFirewallRule -DisplayName "Brain Gym HTTP" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Or disable firewall temporarily for testing (not recommended for production)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

**Node Version Issues**

```powershell
# Check current version
node --version

# If wrong version, install Node.js 20 LTS from nodejs.org
# Or use nvm-windows:

# Install nvm-windows from: github.com/coreybutler/nvm-windows
nvm install 20
nvm use 20
```

**Git Bash vs PowerShell Issues**

If using Git Bash on Windows and commands don't work:
- Use PowerShell instead (recommended)
- Or Windows Terminal with PowerShell
- Git Bash may have path issues with npm/node

---

## Performance Optimization

### Enable Gzip Compression in Nginx

Add to your Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Set Up Caching Headers

The application already includes cache control headers, but you can enhance them in Nginx.

---

## Maintenance

### Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /path/to/brain-gym
git pull  # if using git
npm install
npm run build
pm2 restart brain-gym
```

### Backups

Set up automatic backups if using persistent storage:

```bash
# Create backup script
sudo nano /root/backup.sh
```

Add:
```bash
#!/bin/bash
tar -czf /root/backups/brain-gym-$(date +%Y%m%d).tar.gz /path/to/brain-gym
```

Make executable and add to cron:
```bash
chmod +x /root/backup.sh
crontab -e
# Add: 0 2 * * * /root/backup.sh  # Daily at 2 AM
```

---

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Docker Documentation](https://docs.docker.com/)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs: `pm2 logs brain-gym`
3. Check server logs: `sudo journalctl -u nginx -f`

---

## Summary

You now have multiple options to self-host Brain Gym:

1. **VPS (Recommended for full control)**: Complete control, custom domain, HTTPS
2. **Vercel**: Fastest deployment, automatic HTTPS, global CDN
3. **Railway**: Simple deployment from Git, managed infrastructure
4. **Docker**: Maximum portability, consistent environments
5. **Windows Server**: Run on Windows with PM2, IIS, or Docker Desktop

### Quick Start Recommendations

**For Windows Users:**
- **Just testing locally?** → Follow the [Windows Setup Guide](#windows-setup-guide) and [Local Development Setup](#local-development-setup)
- **Want quick cloud deployment?** → Use [Vercel](#option-2-vercel-deployment) or [Railway](#option-3-railway-deployment) (deploy from Windows, runs in cloud)
- **Have Windows Server?** → Use [Windows Server Deployment](#option-5-windows-server-deployment) with PM2
- **Want to use VPS from Windows?** → Follow [VPS Deployment](#option-1-vps-deployment) and use [Windows Terminal or PuTTY](#connecting-from-windows-to-linux-vps) to connect

**For Best Performance:**
- Production: VPS with Nginx + PM2 + HTTPS
- Quick Demo: Vercel or Railway
- Enterprise: Windows Server with IIS or Docker

Choose the option that best fits your needs and technical comfort level!
