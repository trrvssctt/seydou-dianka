# �배 Déploiement Portfolio sur Render.com

Guide complet pour déployer votre portfolio (frontend + backend) sur Render.com avec l'URL `seydou-dianka.render.com`.

## 🏗️ Architecture de déploiement

```
seydou-dianka.render.com (Frontend - Vite)
    └── /api → api-seydou-dianka.render.com (Backend - Express)
    └── /uploads → Backend (fichiers statiques)
```

---

## 📋 Prérequis

- Compte Render.com gratuit ou payant
- Code pushé sur GitHub (public ou private)
- Variables d'environnement configurées
- Base de données PostgreSQL (AlwaysData ou Render)

---

## 🚀 Étape 1 : Préparer le dépôt GitHub

### 1.1 Vérifier la structure du projet

```bash
# À la racine du projet, vous devez avoir :
Mon_Portefolio/
├── src/                 # Frontend React/Vite
├── backend/             # Backend Express
├── public/              # Assets statiques
├── package.json         # Scripts npm
├── vite.config.ts       # Config frontend
├── tsconfig.json
├── .gitignore
└── .env.example         # Ne pas commiter .env

```

### 1.2 Créer `.env.example` (sans secrets)

```bash
# Frontend
VITE_API_URL="https://api-seydou-dianka.render.com/api"

# Backend
PORT=3000
NODE_ENV="production"
DB_HOST="postgresql-gestionapp.alwaysdata.net"
DB_PORT=5432
DB_NAME="gestionapp_db_mon_portefolio"
DB_USER="gestionapp_mon_portefolio"
DB_PASSWORD="***" # À configurer dans Render
DB_PASSWORD_PROD="***" # À configurer dans Render
JWT_SECRET="***"  # À configurer dans Render
BACKEND_URL="https://api-seydou-dianka.render.com"
FRONTEND_URL="https://seydou-dianka.render.com"
```

### 1.3 Mettre à jour `.gitignore`

```bash
.env
.env.local
.env.*.local
node_modules/
dist/
build/
.DS_Store
uploads/
```

### 1.4 Push vers GitHub

```bash
git add .
git commit -m "Préparer pour le déploiement Render"
git push origin main
```

---

## 🎨 Étape 2 : Déployer le Frontend

### 2.1 Créer un service Web Frontend sur Render

1. **Aller sur [render.com/dashboard](https://dashboard.render.com)**
2. **Cliquer sur "+ New" → "Web Service"**
3. **Connecter le repository GitHub**

### 2.2 Configuration du Frontend

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `seydou-dianka` |
| **Environment** | `Node` |
| **Region** | `Frankfurt (EU Central)` ou plus proche |
| **Branch** | `main` |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm run preview -- --host 0.0.0.0 --port 3000` |
| **Plan** | `Free` (ou payant selon besoins) |

### 2.3 Ajouter les variables d'environnement

Dans **Settings → Environment**:

```
VITE_API_URL = https://api-seydou-dianka.render.com/api
NODE_ENV = production
```

### 2.4 Configurer le domaine personnalisé

1. **Dans Settings → Custom Domain**
2. **Ajouter domaine**: `seydou-dianka.render.com`
3. **Suivre les instructions DNS de Render** (si domaine personnel)

⚠️ **Pour domaine Render gratuit** (seydou-dianka.render.com):
- C'est automatique si vous le nommez `seydou-dianka`
- URL finale: `https://seydou-dianka.render.com`

---

## 🛠️ Étape 3 : Déployer le Backend

### 3.1 Créer un service Web Backend sur Render

1. **Cliquer sur "+ New" → "Web Service"**
2. **Même repository GitHub**

### 3.2 Configuration du Backend

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `api-seydou-dianka` |
| **Environment** | `Node` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `backend` (si dans sous-dossier) ou `.` |
| **Build Command** | `npm install` |
| **Start Command** | `npm run start:backend` ou `node dist/server.js` |
| **Plan** | `Free` |

### 3.3 Vérifier les scripts npm

Dans **package.json**, assurez-vous que vous avez:

```json
{
  "scripts": {
    "start:backend": "node backend/server.js",
    "build": "npm run build:frontend && npm run build:backend",
    "build:backend": "tsc backend/ --outDir dist",
    "dev:backend": "tsx watch backend/server.ts",
    "dev:frontend": "vite",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

### 3.4 Ajouter les variables d'environnement Backend

Dans **Settings → Environment**:

```
PORT = 3000
NODE_ENV = production
DB_HOST = postgresql-gestionapp.alwaysdata.net
DB_PORT = 5432
DB_NAME = gestionapp_db_mon_portefolio
DB_USER = gestionapp_mon_portefolio
DB_PASSWORD = [votre_password_alwaysdata]
JWT_SECRET = [générer une clé secrète sécurisée]
JWT_EXPIRES_IN = 7d
BACKEND_URL = https://api-seydou-dianka.render.com
FRONTEND_URL = https://seydou-dianka.render.com
```

### 3.5 Configurer le domaine Backend

1. **Settings → Custom Domain**
2. **Ajouter**: `api-seydou-dianka.render.com`

---

## 🔐 Étape 4 : Configurer les redirections et routage

### 4.1 Fichier de configuration pour Render (render.yaml)

Créer un fichier `render.yaml` à la racine du projet:

```yaml
services:
  - type: web
    name: seydou-dianka
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    envVars:
      - key: VITE_API_URL
        value: https://api-seydou-dianka.render.com/api
      - key: NODE_ENV
        value: production
    staticSite: true
    routes:
      - path: /*
        destination: /index.html
        permanent: false

  - type: web
    name: api-seydou-dianka
    env: node
    plan: free
    buildCommand: npm install && npm run build:backend
    startCommand: node dist/server.js
    envVars:
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        value: postgresql-gestionapp.alwaysdata.net
      - key: DB_PORT
        value: "5432"
      - key: DB_NAME
        value: gestionapp_db_mon_portefolio
      - key: DB_USER
        value: gestionapp_mon_portefolio
      - key: DB_PASSWORD
        sync: false
      - key: BACKEND_URL
        value: https://api-seydou-dianka.render.com
      - key: FRONTEND_URL
        value: https://seydou-dianka.render.com
```

### 4.2 Configurer le routage 404 pour le Frontend

Créer un fichier `public/_redirects` (pour Render):

```
# Rediriger tous les routes non trouvées vers index.html (SPA routing)
/* /index.html 200
```

**OU** ajouter dans `backend/server.ts` une route catch-all pour le frontend:

```typescript
// Avant les autres routes API
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all pour SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

### 4.3 Configuration CORS finale du backend

Mettre à jour `backend/server.ts`:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://seydou-dianka.render.com']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
```

---

## 📦 Étape 5 : Gérer les fichiers statiques (uploads)

### 5.1 Problem : Les uploads disparaissent après redéploiement

❌ **Solution temporaire** (Free Render) : Les fichiers n'sont pas persistants
✅ **Solutions permanentes** :

#### Option 1 : Utiliser Supabase Storage (Recommandé)

```typescript
// backend/routes/profile.ts
import { supabase } from '../services/supabaseClient';

router.post('/avatar', authMiddleware, adminOnly, async (req, res) => {
  const { filename, data } = req.body;
  const base64Data = data.replace(/^data:[^;]+;base64,/, '');
  
  const { data: uploadData, error } = await supabase.storage
    .from('avatars')
    .upload(`${Date.now()}-${filename}`, Buffer.from(base64Data, 'base64'));
    
  if (error) return res.status(500).json({ error: error.message });
  
  const publicUrl = supabase.storage
    .from('avatars')
    .getPublicUrl(uploadData.path).data.publicUrl;
    
  // Sauvegarder publicUrl en DB
  await query(
    'UPDATE public.profile SET avatar_url = $1 WHERE id = (SELECT id LIMIT 1)',
    [publicUrl]
  );
  
  res.json({ url: publicUrl });
});
```

#### Option 2 : Utiliser un service cloud (Cloudinary, AWS S3)

```typescript
// Installation: npm install cloudinary
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/avatar', authMiddleware, adminOnly, async (req, res) => {
  const { data } = req.body;
  
  const result = await cloudinary.v2.uploader.upload(data, {
    folder: 'portfolio/avatars'
  });
  
  await query(
    'UPDATE public.profile SET avatar_url = $1 WHERE id = (SELECT id LIMIT 1)',
    [result.secure_url]
  );
  
  res.json({ url: result.secure_url });
});
```

#### Option 3 : Render Disk (Pay-as-you-go)

Dans `render.yaml`, ajouter:
```yaml
disk:
  name: uploads
  mountPath: /var/data
  sizeGB: 10
```

---

## 🧪 Étape 6 : Tester le déploiement

### 6.1 Vérifier le Frontend

```bash
# Ouvrir dans le navigateur
https://seydou-dianka.render.com

# Vérifier les routes (devraient tout aller à /index.html)
https://seydou-dianka.render.com/
https://seydou-dianka.render.com/admin/profile
https://seydou-dianka.render.com/unknown-page  # Devrait afficher la page 404 du frontend, pas Render
```

### 6.2 Vérifier le Backend

```bash
# API Health Check
curl https://api-seydou-dianka.render.com/api/health

# Récupérer le profil
curl https://api-seydou-dianka.render.com/api/profile

# Vérifier les uploads (si uploads externalisés)
curl https://api-seydou-dianka.render.com/uploads/avatars/avatar-*.jpeg
```

### 6.3 Vérifier la Console du Navigateur

Ouvrir **DevTools → Console** et vérifier:
- ❌ Pas d'erreurs CORS
- ❌ Pas d'erreurs 404 pour les ressources
- ✅ Les images se chargent depuis le bon domaine

---

## 🔄 Étape 7 : Déploiement continu

### 7.1 Auto-déploiement à chaque push

1. **Settings → Deploys**
2. **Enable Auto Deploy**: `Yes`
3. À chaque `git push origin main`, le code sera redéployé automatiquement

### 7.2 Monitorer les déploiements

1. **Dashboard → Logs**
2. Voir les erreurs de build/runtime
3. Redéployer manuellement si besoin

---

## 🛑 Troubleshooting

### Problem 1 : "Not Found" 404 sur toutes les routes

**Cause** : Le routage SPA n'est pas configuré
**Solution** :
```bash
# Ajouter dans backend/server.ts
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

### Problem 2 : CORS errors sur les images

**Cause** : Backend headers mal configurés
**Solution** :
```typescript
// backend/server.ts
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
```

### Problem 3 : "Cannot GET /api/..." 

**Cause** : Backend non accessible ou proxy mal configuré
**Solution** :
- Vérifier `VITE_API_URL` dans le frontend
- Vérifier les routes dans `backend/server.ts`
- Vérifier les logs Render du backend

### Problem 4 : Base de données inaccessible

**Cause** : Variables d'environnement DB manquantes ou incorrectes
**Solution** :
```bash
# Tester la connexion locale d'abord
npm run dev:backend

# Vérifier dans Render Settings → Environment
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

---

## ✅ Checklist de déploiement

- [ ] `.env.example` créé et non-sensible
- [ ] `package.json` avec tous les scripts nécessaires
- [ ] Frontend build à partir de `/dist`
- [ ] Backend start correctement sur PORT env var
- [ ] Variables d'environnement configurées dans Render
- [ ] Domaine personnalisé configuré (`seydou-dianka.render.com`)
- [ ] CORS configuré pour production URLs
- [ ] Routage SPA configuré (redirects 404 → index.html)
- [ ] Fichiers uploads externalisés (Supabase/Cloudinary)
- [ ] Base de données PostgreSQL accessible
- [ ] Tests manuels sur domaine de production

---

## 📱 URLs finales

| Service | URL |
|---------|-----|
| **Frontend** | https://seydou-dianka.render.com |
| **Backend API** | https://api-seydou-dianka.render.com/api |
| **Health Check** | https://api-seydou-dianka.render.com/api/health |
| **Admin Dashboard** | https://seydou-dianka.render.com/admin/login |

---

## 🔗 Ressources utiles

- [Render.com Documentation](https://render.com/docs)
- [SPA Routing on Static Sites](https://render.com/docs/static-site-redirects)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

---

**Dernière mise à jour**: Avril 2026  
**Status**: ✅ Prêt pour déploiement production
