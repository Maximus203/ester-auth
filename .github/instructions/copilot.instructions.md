---
applyTo: '**/*.ts'
---

# Instructions Copilot - Projet Ester

## Contexte du projet
Application web d'authentification avec Express (TypeScript) + SQLite et rendu côté serveur (SSR).
Interface responsive avec système d'authentification (prénom, nom, email, mot de passe) et dashboard personnalisé.

## Architecture technique

### Stack technologique
- **Backend**: Express.js avec TypeScript
- **Base de données**: SQLite avec migrations
- **Frontend**: Server-Side Rendering (SSR) avec templates EJS/Handlebars
- **Authentification**: Sessions avec express-session
- **Validation**: express-validator
- **Sécurité**: bcrypt pour les mots de passe, helmet pour la sécurité HTTP

### Structure du projet
```
src/
├── controllers/     # Contrôleurs pour les routes
├── models/         # Modèles de données (User, etc.)
├── routes/         # Définition des routes
├── middleware/     # Middlewares personnalisés
├── services/       # Services métier
├── database/       # Configuration et migrations SQLite
├── views/          # Templates SSR (EJS/Handlebars)
├── public/         # Assets statiques (CSS, JS, images)
└── types/          # Types TypeScript personnalisés
```

## Règles de codage

### TypeScript
- Utiliser TypeScript strict mode
- Définir des interfaces claires pour tous les objets métier
- Typer explicitement les paramètres de fonctions et valeurs de retour
- Utiliser des types union plutôt que any
- Créer des types personnalisés dans `/src/types/`

### Express.js
- Structure modulaire avec contrôleurs séparés
- Middleware de validation sur toutes les routes sensibles
- Gestion d'erreurs centralisée avec middleware error handler
- Utiliser async/await plutôt que les callbacks
- Sessions sécurisées avec secret fort

### Base de données
- Migrations SQLite versionnées
- Requêtes préparées pour éviter les injections SQL
- Modèles avec validation des données
- Index sur les champs fréquemment recherchés (email)

### Sécurité
- Hash des mots de passe avec bcrypt (salt rounds: 12)
- Validation et sanitisation des entrées utilisateur
- Protection CSRF
- Headers de sécurité avec helmet
- Limitation du taux de requêtes pour l'authentification

### Interface utilisateur
- Design responsive (mobile-first)
- Système de design cohérent (couleurs, typographie, espacements)
- Formulaires accessibles avec labels appropriés
- Messages d'erreur et de succès clairs
- Interface moderne et épurée

## Fonctionnalités requises

### Authentification
- Inscription (prénom, nom, email, mot de passe)
- Connexion avec email/mot de passe
- Déconnexion sécurisée
- Validation des formulaires côté client et serveur
- Messages d'erreur explicites

### Dashboard
- Page d'accueil personnalisée après connexion
- Affichage du prénom de l'utilisateur
- Horloge en temps réel (mise à jour automatique)
- Navigation intuitive

### Pages requises
- `/` - Page d'accueil publique
- `/login` - Formulaire de connexion
- `/register` - Formulaire d'inscription
- `/dashboard` - Dashboard utilisateur (protégé)
- `/logout` - Déconnexion

## Conventions de nommage
- Variables et fonctions: camelCase
- Classes et interfaces: PascalCase
- Fichiers: kebab-case
- Base de données: snake_case
- Constants: UPPER_SNAKE_CASE

## Gestion des erreurs
- Try/catch systématique dans les contrôleurs async
- Logs structurés avec niveaux appropriés
- Messages d'erreur utilisateur friendly
- Codes HTTP appropriés (400, 401, 403, 404, 500)

## Performance et bonnes pratiques
- Compression gzip activée
- Cache des assets statiques
- Minification CSS/JS en production
- Optimisation des requêtes base de données
- Sessions avec TTL approprié

## Tests (si implémentés)
- Tests unitaires pour les services
- Tests d'intégration pour les routes
- Mocking de la base de données
- Coverage minimal de 80%

## Variables d'environnement
```
NODE_ENV=development|production
PORT=3000
SESSION_SECRET=your-secret-key
DB_PATH=./database/app.db
```

Suivre ces instructions pour maintenir la cohérence et la qualité du code dans tout le projet.