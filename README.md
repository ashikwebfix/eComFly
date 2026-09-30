# eComFly - Server-Side Tracking SaaS Platform

eComFly is a modern SaaS platform built for provisioning and managing Server-Side Google Tag Manager (sGTM) containers. It features user and admin dashboards, automated subdomain generation, billing management, and real-time usage tracking.

## 🚀 Tech Stack & Dependencies

To run eComFly on a live VPS (Ubuntu 22.04 / 24.04 recommended), you will need the following dependencies installed:

1. **Node.js** (v18 or v20 LTS) - Runtime for backend and frontend build.
2. **PostgreSQL** (v14 or higher) - Relational database for storing users, plans, containers, and payments. *(Note: Do not use MySQL/MariaDB, as the schema utilizes PostgreSQL-specific features like `UUID` and `JSONB`)*.
3. **PM2** - Process manager to keep the backend API running 24/7.
4. **Nginx** - Web server to serve the frontend build and reverse-proxy requests to the backend API and sGTM containers.
5. **Git** - To clone the repository.
6. **Docker** *(Optional but required for physical container provisioning)* - To spin up the actual `gcr.io/cloud-tagging-10302018/gtm-cloud-image` instances.

---

## 🛠️ Step-by-Step VPS Installation Guide

### 1. Update Server & Install Core Dependencies
SSH into your VPS as `root` and update the system:
```bash
apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib
```

### 2. Install Node.js (via NVM) & PM2
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Install PM2 globally
npm install -g pm2
```

### 3. Clone the Repository
```bash
cd /var/www
git clone https://github.com/ashikwebfix/eComFly.git
cd eComFly
```

### 4. Setup PostgreSQL Database
Log into the Postgres shell:
```bash
sudo -u postgres psql
```
Run the following commands to create the database and user:
```sql
CREATE DATABASE ecomfly_db;
CREATE USER ecomfly_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecomfly_db TO ecomfly_user;
\c ecomfly_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```
Import the schema:
```bash
sudo -u postgres psql ecomfly_db < /var/www/eComFly/backend/schema.sql
```

### 5. Setup the Backend
Navigate to the backend folder and install dependencies:
```bash
cd /var/www/eComFly/backend
npm install
```
Create your environment variable file:
```bash
cp .env.example .env
nano .env
```
Ensure your `.env` looks like this:
```env
PORT=5001
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgres://ecomfly_user:your_secure_password@localhost:5432/ecomfly_db
```
Start the backend using PM2:
```bash
pm2 start server.js --name "ecomfly-api"
pm2 save
pm2 startup
```

### 6. Build the Frontend
Navigate to the frontend folder, install dependencies, and build for production:
```bash
cd /var/www/eComFly/frontend
npm install
npm run build
```
The optimized production files are now inside `/var/www/eComFly/frontend/dist`.

### 7. Configure Nginx
Create an Nginx configuration file for your domain:
```bash
nano /etc/nginx/sites-available/ecomfly
```
Paste the following configuration (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve the React Frontend
    location / {
        root /var/www/eComFly/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy for the Node.js API
    location /api/ {
        proxy_pass http://localhost:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/ecomfly /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 8. Secure with SSL (Certbot)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🎉 You're Live!
Your platform should now be accessible at `https://ecomfly.ecomfixr.com`.

**Default Login Credentials:**
- **Admin:** `admin@ecomfly.com` / `admin123`
*(Make sure to change this immediately in the admin dashboard!)*

## 🔄 Updating the App
Whenever you push new changes to GitHub, pull them to your server and rebuild:
```bash
cd /var/www/eComFly
git pull
cd frontend && npm install && npm run build
cd ../backend && npm install && pm2 restart ecomfly-api
```
