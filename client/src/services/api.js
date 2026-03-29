import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Configuration de base de l'API
const API = axios.create({ 
    baseURL: `${apiUrl}/api`,
    timeout: 10000, // 10 secondes timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log pour le débogage (à retirer en production)
        console.log(`🚀 [API] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
        
        return config;
    },
    (error) => {
        console.error('❌ [API] Erreur de requête:', error);
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et les erreurs
API.interceptors.response.use(
    (response) => {
        console.log(`✅ [API] Réponse reçue de ${response.config.url}:`, response.data);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('❌ [API] Timeout - Le serveur ne répond pas');
        } else if (error.response) {
            // Le serveur a répondu avec un code d'erreur
            console.error(`❌ [API] Erreur ${error.response.status}:`, error.response.data);
            
            // Gestion des erreurs d'authentification
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                // Rediriger vers login si nécessaire
                // window.location.href = '/login';
            }
        } else if (error.request) {
            // La requête a été faite mais pas de réponse
            console.error('❌ [API] Pas de réponse du serveur');
        } else {
            // Erreur lors de la configuration de la requête
            console.error('❌ [API] Erreur:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// ============ AUTHENTIFICATION ============

/**
 * Connexion utilisateur
 * @param {Object} formData - { email, password }
 */
export const login = (formData) => API.post('/auth/login', formData);

/**
 * Inscription utilisateur
 * @param {Object} formData - { nom, prenom, email, password, role, telephone? }
 */
export const register = (formData) => API.post('/auth/register', formData);

/**
 * Vérification du code
 * @param {Object} data - { email, code }
 */
export const verifyCode = (data) => API.post('/auth/verify-code', data);

/**
 * Demander un nouveau code de vérification
 * @param {Object} data - { email }
 */
export const resendCode = (data) => API.post('/auth/resend-code', data);

/**
 * Déconnexion
 */
export const logout = () => API.post('/auth/logout');

// ============ MÉDECINS ============

/**
 * Récupérer tous les médecins
 */
export const getMedecins = () => API.get('/medecins');

/**
 * Récupérer un médecin par son ID
 * @param {number|string} id 
 */
export const getMedecinById = (id) => API.get(`/medecins/${id}`);

/**
 * Récupérer les médecins par spécialité
 * @param {string} specialite 
 */
export const getMedecinsBySpecialite = (specialite) => 
    API.get(`/medecins/specialite/${specialite}`);

/**
 * Rechercher des médecins
 * @param {Object} params - { nom?, specialite?, ville? }
 */
export const searchMedecins = (params) => 
    API.get('/medecins/search', { params });

// ============ RENDEZ-VOUS ============

/**
 * Créer un rendez-vous
 * @param {Object} appointmentData 
 */
export const createRendezVous = (appointmentData) => 
    API.post('/rendezvous', appointmentData);

/**
 * Récupérer les rendez-vous d'un patient
 * @param {number|string} patientId 
 */
export const getPatientRendezVous = (patientId) => 
    API.get(`/rendezvous/patient/${patientId}`);

/**
 * Récupérer les rendez-vous d'un médecin
 * @param {number|string} medecinId 
 */
export const getMedecinRendezVous = (medecinId) => 
    API.get(`/rendezvous/medecin/${medecinId}`);

/**
 * Annuler un rendez-vous
 * @param {number|string} rendezVousId 
 */
export const cancelRendezVous = (rendezVousId) => 
    API.put(`/rendezvous/${rendezVousId}/cancel`);

/**
 * Mettre à jour le statut d'un rendez-vous
 * @param {number|string} rendezVousId 
 * @param {string} statut 
 */
export const updateRendezVousStatus = (rendezVousId, statut) => 
    API.put(`/rendezvous/${rendezVousId}`, { statut });

// ============ PAIEMENTS ============

/**
 * Créer un Payment Intent Stripe
 * @param {Object} data - { amount, currency }
 */
export const createPaymentIntent = (data) => 
    API.post('/payments/create-intent', data);

/**
 * Confirmer un paiement (optionnel - Stripe gère généralement côté frontend)
 * @param {Object} data - { paymentIntentId }
 */
export const confirmPayment = (data) => 
    API.post('/payments/confirm', data);

// ============ PATIENTS ============

/**
 * Récupérer le profil d'un patient
 * @param {number|string} patientId 
 */
export const getPatientProfile = (patientId) => 
    API.get(`/patients/${patientId}`);

/**
 * Mettre à jour le profil d'un patient
 * @param {number|string} patientId 
 * @param {Object} profileData 
 */
export const updatePatientProfile = (patientId, profileData) => 
    API.put(`/patients/${patientId}`, profileData);

// ============ FAVORIS ============

/**
 * Ajouter un médecin aux favoris
 * @param {number|string} patientId 
 * @param {number|string} medecinId 
 */
export const addFavori = (patientId, medecinId) => 
    API.post('/favoris', { patientId, medecinId });

/**
 * Retirer un médecin des favoris
 * @param {number|string} favoriId 
 */
export const removeFavori = (favoriId) => 
    API.delete(`/favoris/${favoriId}`);

/**
 * Récupérer les favoris d'un patient
 * @param {number|string} patientId 
 */
export const getPatientFavoris = (patientId) => 
    API.get(`/favoris/patient/${patientId}`);

// ============ SPÉCIALITÉS ============

/**
 * Récupérer toutes les spécialités
 */
export const getSpecialites = () => API.get('/specialites');

// ============ UTILITAIRES ============

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Récupérer le rôle de l'utilisateur connecté
 */
export const getUserRole = () => {
    return localStorage.getItem('userRole');
};

/**
 * Récupérer l'ID de l'utilisateur connecté
 */
export const getUserId = () => {
    return localStorage.getItem('userId');
};

// Exportation par défaut et nommée
export default API;
export { API as api };