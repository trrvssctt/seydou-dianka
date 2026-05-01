# 🚀 Déploiement VPS - Complet avec Nginx & SSL

**Domaine**: `seydou-dianka.realtechprint.com`  
**IP VPS**: `144.91.96.142`  
**Repo**: `https://github.com/trrvssctt/seydou-dianka.git`

---

## 📋 Prérequis

- VPS avec Ubuntu/Debian
- SSH accès root
- Domaine pointant vers l'IP du VPS
- Node.js + npm
- Nginx
- PostgreSQL (optionnel si DB external)

---

## 🔧 ÉTAPE 1 : Préparation du VPS

```bash
# Se connecter au VPS
ssh root@144.91.96.142

# Mettre à jour le système
apt update && apt upgrade -y

# Installer les dépendances de base
apt install -y curl wget git build-essential
```

---

## 📦 ÉTAPE 2 : Installer Node.js & npm

```bash
# Installer Node.js (version LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Vérifier les versions
node --version
npm --version

# (Optionnel) Installer npm globalement
npm install -g npm@latest
```

---

## 🗄️ ÉTAPE 3 : Installer PostgreSQL (si besoin)

```bash
# Si ta DB est sur AlwaysData, tu peux passer cette étape

# Sinon, installer PostgreSQL
apt install -y postgresql postgresql-contrib

# Démarrer le service
systemctl start postgresql
systemctl enable postgresql

# Vérifier le statut
systemctl status postgresql
```

---

## 🔐 ÉTAPE 4 : Cloner le dépôt GitHub

```bash
# Se placer dans /opt
cd /opt

# Cloner le repository
git clone https://github.com/trrvssctt/seydou-dianka.git
cd mon-portefolio

# Vérifier la structure
ls -la
```

---

## 📝 ÉTAPE 5 : Configurer les variables d'environnement

```bash
# Créer le fichier .env
nano .env

# Remplir avec ceci (adapter selon tes besoins):
```

```env
# Frontend
VITE_API_URL="https://seydou-dianka.realtechprint.com/api"

# Backend
PORT=3000
NODE_ENV="production"

# PostgreSQL (AlwaysData)
DB_HOST="postgresql-gestionapp.alwaysdata.net"
DB_PORT=5432
DB_NAME="gestionapp_db_mon_portefolio"
DB_USER="gestionapp_mon_portefolio"
DB_PASSWORD="e~W?SZjq4CH>*ju"

# JWT
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"

# URLs de production
BACKEND_URL="https://seydou-dianka.realtechprint.com"
FRONTEND_URL="https://seydou-dianka.realtechprint.com"
```

```bash
# Sauvegarder: Ctrl+X → Y → Enter
```

---

## 📦 ÉTAPE 6 : Installer les dépendances

```bash
# Installer toutes les dépendances (y compris devDependencies)
npm install --include=dev

# Vérifier que tout est ok
npm list | head -20
```

---

## 🏗️ ÉTAPE 7 : Builder l'application

```bash
# Build du frontend
npm run build

# Vérifier que le dossier dist a été créé
ls -la dist/
```

---

## 🛠️ ÉTAPE 8 : Installer & Configurer Nginx

```bash
# Installer Nginx
apt install -y nginx

# Démarrer Nginx
systemctl start nginx
systemctl enable nginx

# Vérifier le statut
systemctl status nginx
```

---

## 🔐 ÉTAPE 9 : Configurer SSL (Let's Encrypt)

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Générer les certificats SSL
certbot certonly --standalone \
  -d seydou-dianka.realtechprint.com \
  -d seydou-dianka.realtechprint.com/api \
  --email diankaseydou52@gmail.com \
  --agree-tos \
  --non-interactive

# Vérifier les certs
ls -la /etc/letsencrypt/live/seydou-dianka.realtechprint.com/
```

---

## 🌐 ÉTAPE 10 : Configurer Nginx pour le Frontend

```bash
# Créer le fichier de config Nginx
nano /etc/nginx/sites-available/seydou-dianka

# Copier cette configuration:
```

```nginx
# Frontend - seydou-dianka.realtechprint.com
server {
    listen 80;
    listen [::]:80;
    server_name seydou-dianka.realtechprint.com;
    
    # Rediriger HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name seydou-dianka.realtechprint.com;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/seydou-dianka.realtechprint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seydou-dianka.realtechprint.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Root du frontend
    root /opt/mon-portefolio/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/seydou-dianka-access.log;
    error_log /var/log/nginx/seydou-dianka-error.log;

    # SPA Routing - Rediriger les routes non trouvées vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API vers le backend
    location /api {
        proxy_pass https://seydou-dianka.realtechprint.com/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Fichiers statiques (uploads)
    location /uploads {
        proxy_pass https://seydou-dianka.realtechprint.com/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Sauvegarder: Ctrl+X → Y → Enter

# Activer le site
ln -sf /etc/nginx/sites-available/seydou-dianka /etc/nginx/sites-enabled/seydou-dianka

# Supprimer le site par défaut
rm /etc/nginx/sites-enabled/default

# Tester la configuration Nginx
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

---

## 🔧 ÉTAPE 11 : Configurer Nginx pour le Backend API

```bash
# Créer le fichier de config pour l'API
nano /etc/nginx/sites-available/api-seydou-dianka

# Copier cette configuration:
```

```nginx
# Backend API - api.seydou-dianka.realtechprint.com
server {
    listen 80;
    listen [::]:80;
    server_name api.seydou-dianka.realtechprint.com;
    
    # Rediriger HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.seydou-dianka.realtechprint.com;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/seydou-dianka.realtechprint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seydou-dianka.realtechprint.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;

    # Proxy vers Node.js backend (port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads statiques
    location /uploads {
        alias /opt/mon-portefolio/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

```bash
# Sauvegarder: Ctrl+X → Y → Enter

# Activer le site
ln -sf /etc/nginx/sites-available/api-seydou-dianka /etc/nginx/sites-enabled/api-seydou-dianka

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

---

## 🚀 ÉTAPE 12 : Configurer PM2 pour le Backend

```bash
# Installer PM2 globalement
npm install -g pm2

# Créer un fichier ecosystem.config.js
nano /opt/mon-portefolio/ecosystem.config.js

# Copier:
```

```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/server.ts',
      interpreter: 'npx tsx',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

```bash
# Sauvegarder: Ctrl+X → Y → Enter

# Installer tsx (si pas encore fait)
npm install -g tsx

# Démarrer le backend avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour redémarrer au boot
pm2 startup systemd -u root --hp /root
pm2 save

# Vérifier que le backend est en cours d'exécution
pm2 list
pm2 logs backend
```

---

## ✅ ÉTAPE 13 : Vérifier le déploiement

```bash
# Vérifier que Nginx écoute bien
netstat -tlnp | grep nginx

# Vérifier que Node.js écoute sur le port 3000
netstat -tlnp | grep 3000

# Vérifier les logs Nginx
tail -50 /var/log/nginx/seydou-dianka-access.log
tail -50 /var/log/nginx/seydou-dianka-error.log

# Vérifier les logs backend
pm2 logs backend

# Tester les endpoints
curl https://seydou-dianka.realtechprint.com/
curl https://api.seydou-dianka.realtechprint.com/api/health
```

---

## 🔄 ÉTAPE 14 : Configurer l'auto-renouvellement SSL

```bash
# Tester le renouvellement
certbot renew --dry-run

# Le renouvellement automatique devrait être configuré par défaut
# Vérifier:
systemctl status certbot.timer
```

---

## 📋 COMMANDES RAPIDES - Copier/Coller

Si tu veux tout faire d'un coup, voici le script complet:

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement VPS - Seydou DIANKA Portfolio"
echo "=============================================="

# 1. Mise à jour système
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y
apt install -y curl wget git build-essential nginx postgresql certbot python3-certbot-nginx

# 2. Installer Node.js
echo "📦 Installation Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
npm install -g pm2 tsx

# 3. Cloner le repo
echo "📂 Clonage du repository..."
cd /opt
rm -rf mon-portefolio
git clone https://github.com/trrvssctt/seydou-dianka.git mon-portefolio
cd mon-portefolio

# 4. Créer .env
echo "⚙️  Création du fichier .env..."
cat > .env << 'EOF'
VITE_API_URL="https://api.seydou-dianka.realtechprint.com/api"
PORT=3000
NODE_ENV="production"
DB_HOST="postgresql-gestionapp.alwaysdata.net"
DB_PORT=5432
DB_NAME="gestionapp_db_mon_portefolio"
DB_USER="gestionapp_mon_portefolio"
DB_PASSWORD="e~W?SZjq4CH>*ju"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"
BACKEND_URL="https://api.seydou-dianka.realtechprint.com"
FRONTEND_URL="https://seydou-dianka.realtechprint.com"
EOF

# 5. Installer dépendances et build
echo "📦 Installation des dépendances..."
npm install --include=dev

echo "🏗️  Build du projet..."
npm run build

# 6. Configurer SSL
echo "🔐 Configuration SSL..."
certbot certonly --standalone \
  -d seydou-dianka.realtechprint.com \
  -d api.seydou-dianka.realtechprint.com \
  --email admin@seydou-dianka.realtechprint.com \
  --agree-tos \
  --non-interactive 2>/dev/null || true

# 7. Configurer Nginx Frontend
echo "⚙️  Configuration Nginx Frontend..."
cat > /etc/nginx/sites-available/seydou-dianka << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name seydou-dianka.realtechprint.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name seydou-dianka.realtechprint.com;

    ssl_certificate /etc/letsencrypt/live/seydou-dianka.realtechprint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seydou-dianka.realtechprint.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    root /opt/mon-portefolio/dist;
    index index.html;

    access_log /var/log/nginx/seydou-dianka-access.log;
    error_log /var/log/nginx/seydou-dianka-error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://api.seydou-dianka.realtechprint.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass https://api.seydou-dianka.realtechprint.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 8. Configurer Nginx Backend
echo "⚙️  Configuration Nginx Backend..."
cat > /etc/nginx/sites-available/api-seydou-dianka << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name api.seydou-dianka.realtechprint.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.seydou-dianka.realtechprint.com;

    ssl_certificate /etc/letsencrypt/live/seydou-dianka.realtechprint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seydou-dianka.realtechprint.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /opt/mon-portefolio/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
EOF

# 9. Activer les sites Nginx
ln -sf /etc/nginx/sites-available/seydou-dianka /etc/nginx/sites-enabled/seydou-dianka
ln -sf /etc/nginx/sites-available/api-seydou-dianka /etc/nginx/sites-enabled/api-seydou-dianka
rm -f /etc/nginx/sites-enabled/default

# 10. Tester et redémarrer Nginx
nginx -t && systemctl restart nginx

# 11. Créer ecosystem.config.js pour PM2
echo "⚙️  Configuration PM2..."
cat > /opt/mon-portefolio/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/server.ts',
      interpreter: 'npx tsx',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# 12. Démarrer le backend avec PM2
cd /opt/mon-portefolio
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
pm2 save

# 13. Vérification finale
echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🌐 URLs:"
echo "  Frontend: https://seydou-dianka.realtechprint.com"
echo "  Backend: https://api.seydou-dianka.realtechprint.com"
echo "  Health: https://api.seydou-dianka.realtechprint.com/api/health"
echo ""
echo "📋 Commandes utiles:"
echo "  pm2 list                    # Voir les processus"
echo "  pm2 logs backend            # Voir les logs"
echo "  pm2 restart backend         # Redémarrer"
echo "  pm2 stop backend            # Arrêter"
echo "  tail -f /var/log/nginx/seydou-dianka-access.log  # Logs Nginx"
```

---

## 🔧 Commandes Utiles Quotidiennes

```bash
# Voir l'état du backend
pm2 list

# Voir les logs temps réel
pm2 logs backend

# Redémarrer le backend
pm2 restart backend

# Arrêter le backend
pm2 stop backend

# Redémarrer le backend
pm2 start ecosystem.config.js

# Recharger Nginx
systemctl reload nginx

# Redémarrer Nginx
systemctl restart nginx

# Vérifier les certificats SSL
certbot certificates

# Voir les logs Nginx
tail -50 /var/log/nginx/seydou-dianka-access.log
tail -50 /var/log/nginx/seydou-dianka-error.log

# Tester la connexion API
curl https://api.seydou-dianka.realtechprint.com/api/health

# SSH dans le VPS
ssh root@144.91.96.142

# Aller au dossier du projet
cd /opt/mon-portefolio

# Mettre à jour le code
git pull origin main

# Redéployer après mise à jour
npm run build
pm2 restart backend
```

---

## 📊 Architecture finale

```
144.91.96.142 (VPS)
├── Nginx (Port 80/443)
│   ├── seydou-dianka.realtechprint.com → /opt/mon-portefolio/dist (React)
│   └── api.seydou-dianka.realtechprint.com → localhost:3000 (Node.js)
│
├── Node.js (Port 3000)
│   └── Backend Express (géré par PM2)
│
└── PostgreSQL (AlwaysData)
    └── postgresql-gestionapp.alwaysdata.net
```

---

## ✅ Checklist Finale

- [ ] VPS préparé et mis à jour
- [ ] Node.js installé
- [ ] Dépôt cloné et configuré
- [ ] `.env` créé avec les bonnes valeurs
- [ ] Frontend buildé (`dist/` créé)
- [ ] SSL certificats générés (Let's Encrypt)
- [ ] Nginx configuré (Frontend + Backend)
- [ ] Backend lancé avec PM2
- [ ] Vérification: `https://seydou-dianka.realtechprint.com` ✅
- [ ] Vérification: `https://api.seydou-dianka.realtechprint.com/api/health` ✅
- [ ] Auto-renewal SSL configuré
- [ ] DNS pointant vers 144.91.96.142

---

**Status**: 🚀 Prêt pour la production!
