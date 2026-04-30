# Todo — Portfolio Seydou DIANKA

## 🔴 Critique — à faire avant tout déploiement

- [ ] **Initialiser la base de données AlwaysData**
  - Vérifier si les tables existent déjà : se connecter à AlwaysData et lancer `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
  - Si les tables n'existent pas : adapter `db.sql` avant de l'exécuter (voir point suivant)
  - Tester la connexion : `node --loader ts-node/esm backend/scripts/test-conn.ts`

- [ ] **Adapter `db.sql` pour PostgreSQL vanilla (AlwaysData n'est pas Supabase)**
  - Supprimer ou commenter les lignes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` et tous les blocs `CREATE POLICY`
  - Supprimer le bloc `INSERT INTO storage.buckets ...` et les policies de storage
  - Supprimer les fonctions qui utilisent `auth.uid()` (Supabase-only)
  - → Ces éléments font crasher le script sur un PostgreSQL standard

- [ ] **Insérer la ligne de profil (seed)**
  - La table `profile` doit avoir **exactement une ligne** pour que le site public affiche du contenu
  - Exécuter dans psql ou via pgAdmin :
    ```sql
    INSERT INTO public.profile (full_name, title_en, title_fr, email, phone, location)
    VALUES ('Seydou DIANKA', 'AI Automation Engineer', 'Ingénieur Automation IA',
            'diankaseydou52@gmail.com', '+221 78 131 13 71', 'Dakar, Senegal · Remote (GMT)');
    ```

- [ ] **Changer le JWT_SECRET dans `.env`**
  - Remplacer `your_super_secret_jwt_key_change_in_production` par une vraie clé aléatoire forte (32+ caractères)
  - Exemple : `openssl rand -base64 32`

---

## 🟠 Configuration — requis pour la mise en production

- [ ] **Configurer les variables d'environnement de production**
  - `NODE_ENV=production`
  - `BACKEND_URL=https://votre-domaine-backend.com` (URL publique du backend, utilisée pour les URLs d'avatars)
  - `FRONTEND_URL=https://votre-domaine-frontend.com` (pour la politique CORS)
  - `JWT_SECRET=<clé forte>`
  - `VITE_API_URL=https://votre-domaine-backend.com/api` (dans le build frontend)

- [ ] **Choisir et configurer l'hébergement backend**
  - Options : Railway, Render, VPS (DigitalOcean, Hetzner), AlwaysData Node.js
  - Le backend Express écoute sur `PORT` (défaut 5000)
  - Le dossier `uploads/` doit être persistant (volume ou S3 si hébergement serverless)

- [ ] **Choisir et configurer l'hébergement frontend**
  - Options : Vercel, Netlify, Cloudflare Pages
  - Build command : `npm run build`
  - Output dir : `dist/`
  - Ajouter la variable d'env `VITE_API_URL` dans le dashboard de la plateforme

- [ ] **Préparer le backend pour la production (compiler TypeScript)**
  - Ajouter un script de build backend dans `package.json` :
    ```json
    "build:backend": "tsc --project tsconfig.node.json --outDir dist-server"
    ```
  - En prod, lancer `node dist-server/server.js` plutôt que `ts-node` (plus rapide, pas de JIT)

---

## 🟡 Premier lancement — à faire une seule fois

- [ ] **Créer le premier compte admin**
  1. Aller sur `/admin/login`
  2. Cliquer « Créer un compte » et s'inscrire avec ton email
  3. Une fois connecté, cliquer « Claim admin » (disponible si aucun admin n'existe encore)
  4. Se déconnecter puis se reconnecter → le token JWT contiendra `isAdmin: true`

- [ ] **Remplir le profil via l'admin** (`/admin/profile`)
  - Nom, titre EN/FR, bio EN/FR, email, téléphone, localisation
  - URLs : GitHub, LinkedIn, Twitter/X, Calendly
  - Photo de profil (upload)

- [ ] **Ajouter les case studies** (`/admin/case-studies`)
  - Les fallbacks statiques s'affichent tant que la BDD est vide
  - Ajouter au moins les 3 case studies existants pour remplacer les fallbacks

- [ ] **Ajouter les workflows** (`/admin/workflows`)
  - Idem — les fallbacks statiques s'affichent tant que la BDD est vide

---

## 🟢 Nettoyage — recommandé mais non bloquant

- [ ] **Supprimer les dépendances inutilisées de `package.json`**
  - `@supabase/supabase-js` — plus utilisé (tous les appels passent par le backend Express)
  - `mysql2` — jamais utilisé (le projet utilise PostgreSQL)
  - `pgsql` — doublon de `pg`
  - `multer` — remplacé par le upload base64 dans `profile.ts`
  - `rxjs` — non utilisé dans le code source

- [ ] **Supprimer les fichiers Supabase résiduels**
  - `src/integrations/supabase/client.ts`
  - `src/integrations/supabase/types.ts`
  - Plus aucun composant ne les importe

- [ ] **Ajouter `@types/jsonwebtoken` aux dépendances dev**
  - Évite les warnings TypeScript sur le module `jsonwebtoken`

- [ ] **Optimiser le bundle frontend (warning 788KB)**
  - Activer le code splitting dans `vite.config.ts` avec `build.rollupOptions.output.manualChunks`
  - Ou utiliser `React.lazy()` + `Suspense` pour les pages admin (chargées uniquement si connecté)
