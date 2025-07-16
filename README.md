# 🚀 Ester - Application d'Authentification Moderne

![alt text](image.png)

## 📋 Description

Ester est une application web d'authentification moderne construite avec Express.js, TypeScript et SQLite. Elle offre un système d'authentification complet avec rendu côté serveur (SSR), une interface responsive et un dashboard personnalisé avec horloge en temps réel.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Inscription** avec validation complète (prénom, nom, email, mot de passe)
- **Connexion** sécurisée avec sessions
- **Déconnexion** avec nettoyage de session
- **Protection des routes** avec middleware d'authentification
- **Validation côté client et serveur**

### 🎨 Interface Utilisateur
- **Design responsive** (mobile-first)
- **Dashboard personnalisé** avec horloge temps réel
- **Messages flash** pour notifications
- **Navigation adaptive** selon l'état de connexion
- **Animations et transitions** fluides
- **Thème moderne** avec Font Awesome et Google Fonts

### 🛡️ Sécurité
- **Hachage des mots de passe** avec bcrypt (12 salt rounds)
- **Protection CSRF** intégrée
- **Headers de sécurité** avec Helmet
- **Validation et sanitisation** des entrées
- **Sessions sécurisées** avec express-session

### 📊 Monitoring
- **Health checks** avec métriques système
- **Logging structuré** avec Winston
- **Monitoring des performances**
- **Endpoints de métriques** pour supervision

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** 18.0.0 ou supérieur
- **npm** 8.0.0 ou supérieur

### Installation
```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# L'application sera disponible sur http://localhost:3000
```

### Production
```bash
# Construire l'application
npm run build

# Démarrer en production
npm run prod
```

## 📝 Scripts Disponibles

```bash
npm run dev           # Démarrage en mode développement
npm run build         # Construction TypeScript
npm run start         # Démarrage en production
npm run test          # Tests automatisés
npm run test:manual   # Guide de tests manuels
```

## 🧪 Tests

### Tests Automatisés
```bash
npm run test
```

L'application inclut des tests automatisés pour :
- ✅ Pages principales accessibles
- ✅ Ressources statiques (CSS, JS)
- ✅ Sécurité de base
- ✅ Performance
- ✅ Flux d'authentification complet

### Test Manuel Recommandé
```bash
npm run test:manual
```

1. **Inscription** : http://localhost:3000/register
   - Créer un compte (Test User / test@example.com / TestPassword123!)
2. **Dashboard** : Vérifier l'horloge temps réel et le message de bienvenue
3. **Déconnexion** : Tester la déconnexion
4. **Reconnexion** : http://localhost:3000/login

## 📊 Monitoring

L'application inclut des endpoints de monitoring :
- `GET /health` - Vérification de santé complète
- `GET /status` - Status simple
- `GET /metrics` - Métriques détaillées
- `GET /info` - Informations de l'application

## 🏗️ Architecture

### Stack Technologique
- **Backend**: Express.js avec TypeScript
- **Base de données**: SQLite
- **Templates**: EJS avec Server-Side Rendering
- **Authentification**: express-session + bcrypt
- **Sécurité**: helmet + express-rate-limit
- **Styling**: CSS natif responsive

### Structure MVC
```
src/
├── controllers/     # Logique métier
├── models/         # Modèles de données
├── routes/         # Définition des routes
├── middleware/     # Middlewares personnalisés
├── services/       # Services métier
├── views/          # Templates EJS
├── public/         # Assets statiques
└── types/          # Types TypeScript
```

## 🔒 Sécurité

### Mesures Implémentées
- ✅ Hachage des mots de passe avec bcrypt
- ✅ Protection CSRF
- ✅ Headers de sécurité (helmet)
- ✅ Validation des entrées
- ✅ Sessions sécurisées
- ✅ Protection contre l'injection SQL

## 🎯 Fonctionnalités Clés

### Horloge Temps Réel
Le dashboard affiche une horloge qui se met à jour automatiquement chaque seconde, montrant :
- Heure complète (heures:minutes:secondes)
- Date complète en français
- Mise à jour en temps réel sans rechargement

### Interface Responsive
- Design mobile-first
- Navigation adaptive
- Composants responsive
- Optimisé pour tous les écrans

### Système d'Authentification Complet
- Validation robuste des formulaires
- Messages d'erreur clairs
- Redirection intelligente
- Protection des routes sensibles

## 📈 Performance

- Temps de réponse < 1 seconde
- Assets optimisés et mis en cache
- Compression gzip activée
- Base de données SQLite performante

---

**Application développée en TypeScript avec une architecture MVC moderne et des pratiques de sécurité robustes.**
