/**
 * Script principal de l'application Ester
 * Gestion de l'interface utilisateur, validations et interactions
 */

// ===========================
// Variables globales
// ===========================

let clockInterval;
let passwordStrengthMeter;

// ===========================
// Initialisation
// ===========================

document.addEventListener('DOMContentLoaded', function () {
 console.log('🚀 Ester App - Interface chargée');

 // Initialiser les composants
 initNavigation();
 initFlashMessages();
 initForms();
 initPasswordValidation();
 initClock();
 initAnimations();

 // Marquer la page comme chargée
 document.body.classList.add('loaded');
});

// ===========================
// Navigation
// ===========================

function initNavigation() {
 const mobileMenu = document.getElementById('mobile-menu');
 const navMenu = document.getElementById('nav-menu');

 if (mobileMenu && navMenu) {
  mobileMenu.addEventListener('click', function () {
   mobileMenu.classList.toggle('active');
   navMenu.classList.toggle('active');
  });

  // Fermer le menu mobile lors du clic sur un lien
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
   link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    navMenu.classList.remove('active');
   });
  });

  // Fermer le menu mobile lors du clic en dehors
  document.addEventListener('click', function (event) {
   if (!mobileMenu.contains(event.target) && !navMenu.contains(event.target)) {
    mobileMenu.classList.remove('active');
    navMenu.classList.remove('active');
   }
  });
 }
}

// ===========================
// Messages Flash
// ===========================

function initFlashMessages() {
 const flashMessages = document.querySelectorAll('.flash-message');

 flashMessages.forEach(message => {
  // Auto-fermeture après 5 secondes
  setTimeout(() => {
   hideFlashMessage(message);
  }, 5000);

  // Gestion du bouton de fermeture
  const closeBtn = message.querySelector('.flash-close');
  if (closeBtn) {
   closeBtn.addEventListener('click', () => {
    hideFlashMessage(message);
   });
  }
 });
}

function hideFlashMessage(message) {
 message.style.animation = 'slideOutRight 0.3s ease-out';
 setTimeout(() => {
  if (message.parentNode) {
   message.parentNode.removeChild(message);
  }
 }, 300);
}

function showFlashMessage(type, text) {
 const container = document.body;
 const message = document.createElement('div');
 message.className = `flash-message flash-${type}`;
 message.innerHTML = `
        <div class="flash-content">
            <i class="fas fa-${getFlashIcon(type)} flash-icon"></i>
            <span class="flash-text">${text}</span>
            <button class="flash-close" onclick="hideFlashMessage(this.parentElement.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

 container.appendChild(message);

 // Auto-fermeture
 setTimeout(() => {
  hideFlashMessage(message);
 }, 5000);
}

function getFlashIcon(type) {
 const icons = {
  success: 'check-circle',
  error: 'exclamation-circle',
  warning: 'exclamation-triangle',
  info: 'info-circle'
 };
 return icons[type] || 'info-circle';
}

// ===========================
// Formulaires
// ===========================

function initForms() {
 const forms = document.querySelectorAll('form');

 forms.forEach(form => {
  // Validation en temps réel
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
   input.addEventListener('blur', () => validateField(input));
   input.addEventListener('input', () => clearFieldError(input));
  });

  // Validation à la soumission
  form.addEventListener('submit', function (event) {
   if (!validateForm(form)) {
    event.preventDefault();
    showFlashMessage('error', 'Veuillez corriger les erreurs dans le formulaire');
   }
  });
 });

 // Gestion des cases à cocher
 const checkboxes = document.querySelectorAll('input[type="checkbox"]');
 checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function () {
   if (this.required && !this.checked) {
    showFieldError(this, 'Ce champ est requis');
   } else {
    clearFieldError(this);
   }
  });
 });
}

function validateForm(form) {
 let isValid = true;
 const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

 inputs.forEach(input => {
  if (!validateField(input)) {
   isValid = false;
  }
 });

 // Validation spécifique pour les mots de passe
 const password = form.querySelector('input[name="password"]');
 const confirmPassword = form.querySelector('input[name="confirmPassword"]');

 if (password && confirmPassword) {
  if (password.value !== confirmPassword.value) {
   showFieldError(confirmPassword, 'Les mots de passe ne correspondent pas');
   isValid = false;
  }
 }

 return isValid;
}

function validateField(field) {
 const value = field.value.trim();
 const type = field.type;
 const name = field.name;

 // Effacer les erreurs précédentes
 clearFieldError(field);

 // Vérifier si le champ est requis
 if (field.required && !value) {
  showFieldError(field, 'Ce champ est requis');
  return false;
 }

 // Validations spécifiques par type
 switch (type) {
  case 'email':
   if (value && !isValidEmail(value)) {
    showFieldError(field, 'Format d\'email invalide');
    return false;
   }
   break;

  case 'password':
   if (value && name === 'password' && value.length < 8) {
    showFieldError(field, 'Le mot de passe doit contenir au moins 8 caractères');
    return false;
   }
   break;

  case 'text':
   if (name === 'firstName' || name === 'lastName') {
    if (value && value.length < 2) {
     showFieldError(field, 'Minimum 2 caractères requis');
     return false;
    }
   }
   break;
 }

 return true;
}

function showFieldError(field, message) {
 const errorElement = field.parentNode.querySelector('.form-error');
 if (errorElement) {
  errorElement.textContent = message;
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
 }
 field.classList.add('error');
}

function clearFieldError(field) {
 const errorElement = field.parentNode.querySelector('.form-error');
 if (errorElement) {
  errorElement.textContent = '';
 }
 field.classList.remove('error');
}

function isValidEmail(email) {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return emailRegex.test(email);
}

// ===========================
// Gestion des mots de passe
// ===========================

function initPasswordValidation() {
 const passwordInputs = document.querySelectorAll('input[name="password"]');

 passwordInputs.forEach(input => {
  // Ajouter l'indicateur de force si c'est un nouveau mot de passe
  if (input.autocomplete === 'new-password') {
   addPasswordStrengthMeter(input);
  }

  input.addEventListener('input', function () {
   if (this.autocomplete === 'new-password') {
    updatePasswordStrength(this);
   }
  });
 });
}

function addPasswordStrengthMeter(input) {
 const strengthDiv = input.parentNode.parentNode.querySelector('.password-strength');
 if (strengthDiv) {
  strengthDiv.innerHTML = `
            <div class="strength-bars">
                <div class="strength-bar"></div>
                <div class="strength-bar"></div>
                <div class="strength-bar"></div>
                <div class="strength-bar"></div>
            </div>
            <div class="strength-text">Force du mot de passe</div>
        `;
 }
}

function updatePasswordStrength(input) {
 const password = input.value;
 const strengthDiv = input.parentNode.parentNode.querySelector('.password-strength');

 if (!strengthDiv) return;

 const bars = strengthDiv.querySelectorAll('.strength-bar');
 const text = strengthDiv.querySelector('.strength-text');

 // Calculer la force
 const strength = calculatePasswordStrength(password);

 // Réinitialiser les barres
 bars.forEach(bar => bar.classList.remove('active'));

 // Activer les barres selon la force
 for (let i = 0; i < strength.score; i++) {
  if (bars[i]) {
   bars[i].classList.add('active');
   bars[i].style.background = strength.color;
  }
 }

 // Mettre à jour le texte
 if (text) {
  text.textContent = strength.text;
  text.style.color = strength.color;
 }
}

function calculatePasswordStrength(password) {
 let score = 0;
 let color = '#ef4444'; // Rouge par défaut
 let text = 'Très faible';

 if (password.length >= 8) score++;
 if (password.length >= 12) score++;
 if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
 if (/\d/.test(password)) score++;
 if (/[^a-zA-Z0-9]/.test(password)) score++;

 // Ajuster selon le score
 switch (score) {
  case 0:
  case 1:
   color = '#ef4444';
   text = 'Très faible';
   break;
  case 2:
   color = '#f59e0b';
   text = 'Faible';
   break;
  case 3:
   color = '#eab308';
   text = 'Moyen';
   break;
  case 4:
   color = '#22c55e';
   text = 'Fort';
   break;
  case 5:
   color = '#10b981';
   text = 'Très fort';
   break;
 }

 return { score: Math.min(score, 4), color, text };
}

function togglePassword(inputId) {
 const input = document.getElementById(inputId);
 const icon = document.getElementById(`${inputId}-eye`);

 if (input && icon) {
  if (input.type === 'password') {
   input.type = 'text';
   icon.classList.remove('fa-eye');
   icon.classList.add('fa-eye-slash');
  } else {
   input.type = 'password';
   icon.classList.remove('fa-eye-slash');
   icon.classList.add('fa-eye');
  }
 }
}

// ===========================
// Horloge en temps réel
// ===========================

function initClock() {
 const timeElement = document.getElementById('current-time');
 const dateElement = document.getElementById('current-date');

 if (timeElement || dateElement) {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
 }
}

function updateClock() {
 const now = new Date();

 // Mettre à jour l'heure
 const hoursElement = document.getElementById('hours');
 const minutesElement = document.getElementById('minutes');
 const secondsElement = document.getElementById('seconds');

 if (hoursElement && minutesElement && secondsElement) {
  hoursElement.textContent = String(now.getHours()).padStart(2, '0');
  minutesElement.textContent = String(now.getMinutes()).padStart(2, '0');
  secondsElement.textContent = String(now.getSeconds()).padStart(2, '0');
 }

 // Mettre à jour la date
 const dayElement = document.getElementById('day');
 const monthElement = document.getElementById('month');
 const yearElement = document.getElementById('year');

 if (dayElement && monthElement && yearElement) {
  const options = {
   weekday: 'long',
   year: 'numeric',
   month: 'long',
   day: 'numeric'
  };
  const dateString = now.toLocaleDateString('fr-FR', options);

  // Parser la date pour l'afficher de manière structurée
  const parts = dateString.split(' ');
  dayElement.textContent = `${parts[0]} ${parts[1]}`;
  monthElement.textContent = parts[2];
  yearElement.textContent = parts[3];
 }

 // Mettre à jour l'heure complète si l'élément existe
 const fullDateElement = document.getElementById('current-date');
 if (fullDateElement && !dayElement) {
  const options = {
   weekday: 'long',
   year: 'numeric',
   month: 'long',
   day: 'numeric'
  };
  fullDateElement.textContent = now.toLocaleDateString('fr-FR', options);
 }
}

// ===========================
// Animations et effets
// ===========================

function initAnimations() {
 // Animation d'apparition progressive
 const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
 };

 const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
   if (entry.isIntersecting) {
    entry.target.style.opacity = '1';
    entry.target.style.transform = 'translateY(0)';
   }
  });
 }, observerOptions);

 // Observer les éléments animables
 const animatedElements = document.querySelectorAll('.stat-item, .feature-card, .dashboard-card, .action-button');
 animatedElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
 });

 // Animation des compteurs
 animateCounters();
}

function animateCounters() {
 const counters = document.querySelectorAll('.stat-number');

 counters.forEach(counter => {
  const target = parseInt(counter.textContent) || 0;
  const increment = target / 50;
  let current = 0;

  const timer = setInterval(() => {
   current += increment;
   if (current >= target) {
    counter.textContent = target;
    clearInterval(timer);
   } else {
    counter.textContent = Math.ceil(current);
   }
  }, 50);
 });
}

// ===========================
// Fonctions utilitaires
// ===========================

function debounce(func, wait) {
 let timeout;
 return function executedFunction(...args) {
  const later = () => {
   clearTimeout(timeout);
   func(...args);
  };
  clearTimeout(timeout);
  timeout = setTimeout(later, wait);
 };
}

function throttle(func, limit) {
 let inThrottle;
 return function () {
  const args = arguments;
  const context = this;
  if (!inThrottle) {
   func.apply(context, args);
   inThrottle = true;
   setTimeout(() => inThrottle = false, limit);
  }
 };
}

function formatDate(date, options = {}) {
 const defaultOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  ...options
 };
 return new Date(date).toLocaleDateString('fr-FR', defaultOptions);
}

function formatTime(date, options = {}) {
 const defaultOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  ...options
 };
 return new Date(date).toLocaleTimeString('fr-FR', defaultOptions);
}

// ===========================
// API et requêtes
// ===========================

async function fetchData(url, options = {}) {
 try {
  const response = await fetch(url, {
   headers: {
    'Content-Type': 'application/json',
    ...options.headers
   },
   ...options
  });

  if (!response.ok) {
   throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
 } catch (error) {
  console.error('Erreur lors de la requête:', error);
  showFlashMessage('error', 'Erreur de communication avec le serveur');
  throw error;
 }
}

// ===========================
// Fonctions spécifiques aux pages
// ===========================

// Dashboard
function refreshDashboard() {
 const refreshIcon = document.querySelector('.fa-sync-alt');
 if (refreshIcon) {
  refreshIcon.classList.add('animate-spin');

  // Simuler un rechargement
  setTimeout(() => {
   refreshIcon.classList.remove('animate-spin');
   showFlashMessage('success', 'Dashboard mis à jour');

   // Mettre à jour les statistiques
   updatePageViews();
  }, 1000);
 }
}

function updatePageViews() {
 const pageViewsElement = document.getElementById('page-views');
 if (pageViewsElement) {
  let views = localStorage.getItem('pageViews') || 0;
  views = parseInt(views) + 1;
  localStorage.setItem('pageViews', views);
  pageViewsElement.textContent = views;
 }
}

function calculateMembershipDuration() {
 const memberElement = document.getElementById('member-since');
 if (memberElement) {
  // Simuler une date d'inscription
  const joinDate = new Date('2024-01-01');
  const now = new Date();
  const diffTime = Math.abs(now - joinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  memberElement.textContent = `${diffDays} jours`;
 }
}

// ===========================
// Gestion des erreurs globales
// ===========================

window.addEventListener('error', function (event) {
 console.error('Erreur JavaScript:', event.error);
 // Ne pas afficher d'alerte en production
 if (window.location.hostname === 'localhost') {
  showFlashMessage('error', 'Une erreur JavaScript s\'est produite. Consultez la console pour plus de détails.');
 }
});

// ===========================
// Nettoyage à la fermeture
// ===========================

window.addEventListener('beforeunload', function () {
 if (clockInterval) {
  clearInterval(clockInterval);
 }
});

// ===========================
// Exposition globale des fonctions nécessaires
// ===========================

window.togglePassword = togglePassword;
window.showFlashMessage = showFlashMessage;
window.hideFlashMessage = hideFlashMessage;
window.refreshDashboard = refreshDashboard;
window.updatePageViews = updatePageViews;
window.calculateMembershipDuration = calculateMembershipDuration;
