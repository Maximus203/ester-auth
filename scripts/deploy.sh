#!/bin/bash

# Script de déploiement pour l'application Ester
# Usage: ./deploy.sh [development|production]

set -e  # Arrêter en cas d'erreur

# Configuration
ENVIRONMENT=${1:-development}
APP_NAME="ester"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"
LOG_FILE="/var/log/$APP_NAME/deploy.log"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[SUCCESS] $1" >> "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

# Vérifications préalables
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
    fi
    
    # Vérifier git
    if ! command -v git &> /dev/null; then
        error "git n'est pas installé"
    fi
    
    # Vérifier la version de Node.js
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        error "Node.js version $REQUIRED_VERSION ou supérieure requise (actuelle: $NODE_VERSION)"
    fi
    
    success "Prérequis vérifiés"
}

# Créer les répertoires nécessaires
setup_directories() {
    log "Création des répertoires..."
    
    mkdir -p "$DEPLOY_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "/var/log/$APP_NAME"
    mkdir -p "/opt/$APP_NAME/logs"
    mkdir -p "/opt/$APP_NAME/database"
    
    success "Répertoires créés"
}

# Sauvegarder l'ancienne version
backup_current() {
    if [ -d "$DEPLOY_DIR/current" ]; then
        log "Sauvegarde de la version actuelle..."
        
        BACKUP_NAME="backup-$(date '+%Y%m%d-%H%M%S')"
        cp -r "$DEPLOY_DIR/current" "$BACKUP_DIR/$BACKUP_NAME"
        
        # Garder seulement les 5 dernières sauvegardes
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        
        success "Sauvegarde créée: $BACKUP_NAME"
    fi
}

# Déployer le code
deploy_code() {
    log "Déploiement du code..."
    
    # Créer un répertoire temporaire pour le déploiement
    TEMP_DIR="/tmp/$APP_NAME-deploy-$$"
    mkdir -p "$TEMP_DIR"
    
    # Copier les fichiers (en assumant que le script est dans le projet)
    cp -r . "$TEMP_DIR/"
    cd "$TEMP_DIR"
    
    # Nettoyer les fichiers de développement
    rm -rf node_modules
    rm -rf .git
    rm -rf tests
    rm -f .env
    
    # Copier la configuration d'environnement appropriée
    if [ "$ENVIRONMENT" = "production" ]; then
        cp .env.production .env
    else
        cp .env.development .env 2>/dev/null || true
    fi
    
    # Installer les dépendances
    log "Installation des dépendances..."
    npm ci --only=production
    
    # Construire l'application TypeScript
    log "Construction de l'application..."
    npm run build
    
    # Déplacer vers le répertoire de déploiement
    rm -rf "$DEPLOY_DIR/new"
    mv "$TEMP_DIR" "$DEPLOY_DIR/new"
    
    success "Code déployé"
}

# Vérifier la santé de l'application
health_check() {
    log "Vérification de la santé de l'application..."
    
    # Démarrer l'application en arrière-plan
    cd "$DEPLOY_DIR/new"
    npm start > "/var/log/$APP_NAME/app.log" 2>&1 &
    APP_PID=$!
    
    # Attendre que l'application démarre
    sleep 10
    
    # Vérifier si l'application répond
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Application en bonne santé"
        echo $APP_PID > "/var/run/$APP_NAME.pid"
        return 0
    else
        error "L'application ne répond pas au health check"
        kill $APP_PID 2>/dev/null || true
        return 1
    fi
}

# Activer la nouvelle version
activate_deployment() {
    log "Activation de la nouvelle version..."
    
    # Arrêter l'ancienne version
    if [ -f "/var/run/$APP_NAME.pid" ]; then
        OLD_PID=$(cat "/var/run/$APP_NAME.pid")
        if kill -0 $OLD_PID 2>/dev/null; then
            kill $OLD_PID
            sleep 5
        fi
    fi
    
    # Activer la nouvelle version
    rm -rf "$DEPLOY_DIR/previous"
    if [ -d "$DEPLOY_DIR/current" ]; then
        mv "$DEPLOY_DIR/current" "$DEPLOY_DIR/previous"
    fi
    mv "$DEPLOY_DIR/new" "$DEPLOY_DIR/current"
    
    # Redémarrer l'application
    cd "$DEPLOY_DIR/current"
    npm start > "/var/log/$APP_NAME/app.log" 2>&1 &
    echo $! > "/var/run/$APP_NAME.pid"
    
    success "Nouvelle version activée"
}

# Rollback en cas de problème
rollback() {
    warning "Rollback en cours..."
    
    if [ -d "$DEPLOY_DIR/previous" ]; then
        # Arrêter la version actuelle
        if [ -f "/var/run/$APP_NAME.pid" ]; then
            kill $(cat "/var/run/$APP_NAME.pid") 2>/dev/null || true
        fi
        
        # Restaurer la version précédente
        rm -rf "$DEPLOY_DIR/current"
        mv "$DEPLOY_DIR/previous" "$DEPLOY_DIR/current"
        
        # Redémarrer
        cd "$DEPLOY_DIR/current"
        npm start > "/var/log/$APP_NAME/app.log" 2>&1 &
        echo $! > "/var/run/$APP_NAME.pid"
        
        success "Rollback effectué"
    else
        error "Aucune version précédente disponible pour rollback"
    fi
}

# Migration de base de données
migrate_database() {
    log "Migration de la base de données..."
    
    cd "$DEPLOY_DIR/new"
    if [ -f "scripts/migrate.js" ]; then
        node scripts/migrate.js
        success "Base de données migrée"
    else
        warning "Aucun script de migration trouvé"
    fi
}

# Fonction principale
main() {
    log "Début du déploiement en mode $ENVIRONMENT"
    
    check_prerequisites
    setup_directories
    backup_current
    deploy_code
    migrate_database
    
    if health_check; then
        activate_deployment
        success "Déploiement réussi !"
        
        # Afficher les informations finales
        echo ""
        echo "Application déployée avec succès !"
        echo "Environment: $ENVIRONMENT"
        echo "URL: http://localhost:3000"
        echo "Logs: tail -f /var/log/$APP_NAME/app.log"
        echo "Health check: curl http://localhost:3000/health"
        
    else
        rollback
        error "Déploiement échoué, rollback effectué"
    fi
}

# Gestion des signaux pour nettoyage
trap 'error "Déploiement interrompu"' INT TERM

# Exécution
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
