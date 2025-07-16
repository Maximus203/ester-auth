# TODO - Projet Ester

Liste des tâches pour développer l'application d'authentification Express + SQLite avec SSR.

## 📋 Statut du Projet

- 🟢 **Complété**
- 🟡 **En cours**
- 🔴 **À faire**
- ⏸️ **En attente**

---

## 🏗️ Phase 1 : Configurat**Dernière mise à jour** : 16 juillet 2025  
**Statut global** : 🟢 Phase 3 terminée - Prêt pour Phase 4n initiale du projet

### 📦 Setup du projet
- � Initialiser le projet Node.js (`npm init`)
- � Configurer TypeScript (`tsconfig.json`)
- � Installer les dépendances principales
- � Configurer les scripts npm
- � Créer la structure de dossiers
- � Configurer les variables d'environnement (`.env`)
- � Configurer ESLint et Prettier
- � Initialiser Git et `.gitignore`

### 📁 Structure des dossiers
- � Créer `src/` avec sous-dossiers
- � Créer `src/controllers/`
- � Créer `src/models/`
- � Créer `src/routes/`
- � Créer `src/middleware/`
- � Créer `src/services/`
- � Créer `src/database/`
- � Créer `src/views/`
- � Créer `src/public/`
- � Créer `src/types/`
- � Créer `database/` pour les fichiers SQLite

---

## 🗄️ Phase 2 : Base de données et modèles

### 🔧 Configuration SQLite
- � Installer sqlite3 et types
- � Créer `src/database/connection.ts`
- � Configurer la connexion à la base de données
- � Créer le système de migrations
- � Créer `src/database/migrations/`

### 👤 Modèle User
- � Créer la migration pour la table `users`
  - `id` (PRIMARY KEY)
  - `firstName` (VARCHAR NOT NULL)
  - `lastName` (VARCHAR NOT NULL) 
  - `email` (VARCHAR UNIQUE NOT NULL)
  - `password` (VARCHAR NOT NULL)
  - `createdAt` (DATETIME)
  - `updatedAt` (DATETIME)
- � Créer `src/models/user-model.ts`
- � Définir les types dans `src/types/user.types.ts`
- � Créer les méthodes CRUD pour User

### 🌱 Données de test
- � Créer `src/database/seeds/`
- � Ajouter quelques utilisateurs de test
- � Script pour réinitialiser la DB

---

## 🔐 Phase 3 : Authentification et sécurité

### 🔒 Service d'authentification
- � Installer bcrypt et types
- � Créer `src/services/auth-service.ts`
- � Implémenter le hash des mots de passe
- � Implémenter la vérification des mots de passe
- � Créer les types dans `src/types/auth.types.ts`

### 🛡️ Middlewares de sécurité
- � Installer express-session, helmet
- � Créer `src/middleware/auth-middleware.ts`
- � Middleware pour vérifier l'authentification
- � Middleware pour rediriger si déjà connecté
- � Créer `src/middleware/validation-middleware.ts`
- � Créer `src/middleware/error-middleware.ts`

### ✅ Validation des données
- � Installer express-validator
- � Validation de l'email (format + unicité)
- � Validation du mot de passe (8 char, maj, min, chiffre)
- � Validation prénom/nom (2-50 char, lettres)
- � Sanitisation des entrées

---

## 🎯 Phase 4 : Contrôleurs et routes

### 🏠 Contrôleur Home
- 🔴 Créer `src/controllers/home-controller.ts`
- 🔴 Méthode pour la page d'accueil publique
- 🔴 Redirection si utilisateur connecté

### 🔑 Contrôleur Auth
- 🔴 Créer `src/controllers/auth-controller.ts`
- 🔴 `showLogin()` - Afficher formulaire connexion
- 🔴 `login()` - Traiter la connexion
- 🔴 `showRegister()` - Afficher formulaire inscription
- 🔴 `register()` - Traiter l'inscription
- 🔴 `logout()` - Déconnecter l'utilisateur

### 🏆 Contrôleur Dashboard
- 🔴 Créer `src/controllers/dashboard-controller.ts`
- 🔴 `showDashboard()` - Afficher le dashboard
- 🔴 Récupérer les données utilisateur
- 🔴 Protection par middleware auth

### 🛣️ Routes
- 🔴 Créer `src/routes/index.ts` (routes principales)
- 🔴 Créer `src/routes/auth-routes.ts`
- 🔴 Créer `src/routes/dashboard-routes.ts`
- 🔴 Configurer toutes les routes :
  - `GET /` - Page d'accueil
  - `GET /login` - Formulaire connexion
  - `POST /login` - Traiter connexion
  - `GET /register` - Formulaire inscription
  - `POST /register` - Traiter inscription
  - `GET /dashboard` - Dashboard (protégé)
  - `POST /logout` - Déconnexion

---

## 🎨 Phase 5 : Templates et interface utilisateur

### 🏗️ Structure des templates
- 🔴 Choisir le moteur de template (EJS ou Handlebars)
- 🔴 Créer `src/views/layouts/main.ejs`
- 🔴 Créer `src/views/partials/header.ejs`
- 🔴 Créer `src/views/partials/footer.ejs`
- 🔴 Créer `src/views/partials/flash-messages.ejs`

### 📄 Pages de l'application
- 🔴 `src/views/pages/home.ejs` - Page d'accueil
- 🔴 `src/views/pages/login.ejs` - Connexion
- 🔴 `src/views/pages/register.ejs` - Inscription
- 🔴 `src/views/pages/dashboard.ejs` - Dashboard
- 🔴 `src/views/pages/error.ejs` - Page d'erreur

### 🎨 Styles CSS
- 🔴 Créer `src/public/css/main.css`
- 🔴 Design system (couleurs, typographie, espacements)
- 🔴 Styles pour les formulaires
- 🔴 Styles pour le dashboard
- 🔴 Design responsive (mobile-first)
- 🔴 Animations et transitions
- 🔴 Styles pour les messages flash

### ⚡ JavaScript côté client
- 🔴 Créer `src/public/js/main.js`
- 🔴 Horloge temps réel pour le dashboard
- 🔴 Validation côté client des formulaires
- 🔴 Interactions UI (focus, hover, etc.)
- 🔴 Messages d'erreur dynamiques

---

## 🚀 Phase 6 : Application principale et configuration

### 📱 App Express
- 🔴 Créer `src/app.ts`
- 🔴 Configuration Express
- 🔴 Configuration des sessions
- 🔴 Configuration du moteur de template
- 🔴 Middleware de sécurité (helmet)
- 🔴 Middleware pour les fichiers statiques
- 🔴 Configuration des routes
- 🔴 Middleware de gestion d'erreurs
- 🔴 Configuration CORS si nécessaire

### 🔧 Configuration finale
- 🔴 Finaliser `package.json` avec tous les scripts
- 🔴 Configuration TypeScript optimale
- 🔴 Variables d'environnement complètes
- 🔴 Configuration de production

---

## ✅ Phase 7 : Tests et validation

### 🧪 Tests unitaires
- 🔴 Installer Jest et types
- 🔴 Tests pour les services (auth, user)
- 🔴 Tests pour les modèles
- 🔴 Tests pour les middlewares
- 🔴 Configuration du coverage

### 🔗 Tests d'intégration
- 🔴 Tests des routes d'authentification
- 🔴 Tests du dashboard
- 🔴 Tests de la base de données
- 🔴 Tests des sessions

### ✨ Validation fonctionnelle
- 🔴 Tester l'inscription complète
- 🔴 Tester la connexion/déconnexion
- 🔴 Tester le dashboard et l'horloge
- 🔴 Tester la responsivité
- 🔴 Tester la sécurité (tentatives d'accès)

---

## 🚀 Phase 8 : Optimisation et finition

### ⚡ Performance
- 🔴 Compression gzip
- 🔴 Cache des assets statiques
- 🔴 Optimisation des requêtes DB
- 🔴 Minification CSS/JS pour la production

### 🔒 Sécurité avancée
- 🔴 Rate limiting sur les routes de connexion
- 🔴 Protection CSRF
- 🔴 Headers de sécurité
- 🔴 Validation et sanitisation renforcées

### 📝 Documentation
- 🔴 Compléter le README.md
- 🔴 Documenter l'API
- 🔴 Guide de déploiement
- 🔴 Guide de contribution

### 🐳 Déploiement (optionnel)
- ⏸️ Dockerfile
- ⏸️ Configuration de production
- ⏸️ CI/CD avec GitHub Actions
- ⏸️ Déploiement sur plateforme cloud

---

## 🎯 Tâches prioritaires pour commencer

1. **🔴 Initialiser le projet** - Setup de base avec package.json et TypeScript
2. **🔴 Configurer la base de données** - SQLite et migration User
3. **🔴 Créer le service d'authentification** - bcrypt et validation
4. **🔴 Développer les contrôleurs** - Auth et Dashboard
5. **🔴 Créer les templates** - Pages principales avec design
6. **🔴 Configurer l'app Express** - Routes et middlewares

---

## 📊 Métriques de succès

- ✅ Application fonctionnelle avec authentification complète
- ✅ Interface responsive et moderne
- ✅ Dashboard avec horloge temps réel
- ✅ Sécurité implémentée (bcrypt, sessions, validation)
- ✅ Code TypeScript propre et typé
- ✅ Tests de base fonctionnels

---

**Dernière mise à jour** : 16 juillet 2025  
**Statut global** : � Phase 1 terminée - Prêt pour Phase 2
