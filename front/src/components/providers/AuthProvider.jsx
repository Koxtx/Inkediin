import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { signin, signup, getCurrentUser, signOut, normalizeUserData } from "../../api/auth.api";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Vérification de l'utilisateur connecté au chargement
  useEffect(() => {
    const checkCurrentUser = async () => {
      // Pages publiques où on n'a pas besoin de vérifier l'authentification
      const publicPaths = ['/signin', '/signup', '/forgotpassword', '/reset-password'];
      const isPublicPath = publicPaths.some(path => 
        location.pathname.startsWith(path)
      );

      console.log('🔍 AuthProvider - Vérification utilisateur:', {
        pathname: location.pathname,
        isPublicPath
      });

      // Si on est sur une page publique, pas besoin de vérifier l'auth
      if (isPublicPath) {
        console.log('🚫 AuthProvider - Page publique, pas de vérification auth');
        setLoading(false);
        return;
      }

      try {
        console.log('📤 AuthProvider - Récupération utilisateur actuel...');
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log("✅ AuthProvider - Utilisateur récupéré et normalisé:", currentUser);
          console.log("📷 AuthProvider - Photo de profil:", currentUser.photoProfil);
          setUser(currentUser);
        } else {
          console.log("❌ AuthProvider - Aucun utilisateur connecté");
        }
      } catch (error) {
        console.error("❌ AuthProvider - Erreur lors de la vérification de l'utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, [location.pathname]);

  // ✅ FONCTION AMÉLIORÉE: Déterminer si c'est la première connexion avec debug
  const checkIsFirstLogin = useCallback((user) => {
    console.group("🔍 AuthProvider - Vérification première connexion");
    console.log("User data:", user);
    
    // Vérifier plusieurs critères possibles
    const hasNoUserType = !user.userType;
    const hasNoName = !user.nom || user.nom.trim() === '';
    const hasNoLocation = !user.localisation || user.localisation.trim() === '';
    const isProfileIncomplete = user.isProfileCompleted === false;
    const needsCompletion = user.needsProfileCompletion === true;
    
    const isFirstLogin = hasNoUserType || hasNoName || hasNoLocation || isProfileIncomplete || needsCompletion;
    
    console.log("📊 Critères première connexion:", {
      hasNoUserType,
      hasNoName, 
      hasNoLocation,
      isProfileIncomplete,
      needsCompletion,
      isFirstLogin
    });
    
    console.groupEnd();
    return isFirstLogin;
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log("📤 AuthProvider - Tentative de connexion:", credentials.email);
      
      const response = await signin(credentials);
      
      if (response.success && response.user) {
        console.log("✅ AuthProvider - Connexion réussie, utilisateur normalisé:", response.user);
        console.log("📷 AuthProvider - Photo utilisateur connecté:", response.user.photoProfil);
        
        setUser(response.user);
        toast.success("Connexion réussie !");
        
        // Déterminer si c'est la première connexion
        const isFirstLogin = checkIsFirstLogin(response.user);
        
        console.log("🔄 AuthProvider - Redirection:", isFirstLogin ? "vers setup" : "vers accueil");
        
        return { 
          success: true, 
          user: response.user,
          isFirstLogin 
        };
      } else {
        // Erreur de connexion
        const errorMessage = response.message || "Erreur lors de la connexion";
        console.log("❌ AuthProvider - Erreur connexion:", errorMessage);
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error("💥 AuthProvider - Erreur lors de la connexion:", error);
      toast.error("Erreur lors de la connexion");
      return { success: false, message: "Erreur lors de la connexion" };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data) => {
    try {
      setLoading(true);
      console.log("📤 AuthProvider - Tentative d'inscription:", data.email);
      
      const response = await signup(data);
      
      if (response.success) {
        console.log("✅ AuthProvider - Inscription réussie");
        toast.success(response.message || "Inscription réussie ! Vous pouvez maintenant vous connecter.");
        return { success: true, message: response.message };
      } else {
        console.log("❌ AuthProvider - Erreur inscription:", response.message);
        toast.error(response.message || "Erreur lors de l'inscription");
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("❌ AuthProvider - Erreur lors de l'inscription:", error);
      toast.error("Erreur lors de l'inscription");
      return { success: false, message: "Erreur lors de l'inscription" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("📤 AuthProvider - Déconnexion...");
      await signOut();
      setUser(null);
      console.log("✅ AuthProvider - Déconnexion réussie");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("❌ AuthProvider - Erreur lors de la déconnexion:", error);
      // On déconnecte quand même côté client
      setUser(null);
    }
  };

  // ✅ FONCTION AMÉLIORÉE: updateUser avec normalisation, validation et debug
  const updateUser = useCallback((updatedUser) => {
    console.group("🔄 AuthProvider - Mise à jour utilisateur");
    console.log("Données reçues:", updatedUser);
    
    if (!updatedUser) {
      console.warn("⚠️ Tentative de mise à jour avec un utilisateur null/undefined");
      console.groupEnd();
      return;
    }

    if (!updatedUser._id && !updatedUser.id) {
      console.warn("⚠️ Tentative de mise à jour avec un utilisateur sans ID:", updatedUser);
      console.groupEnd();
      return;
    }

    try {
      const normalizedUser = normalizeUserData(updatedUser);
      console.log("🔄 Utilisateur normalisé:", normalizedUser);
      console.log("📷 Photo de profil finale:", normalizedUser.photoProfil);
      
      setUser(normalizedUser);
      
      // ✅ AJOUT: Vérification de la cohérence des données
      if (normalizedUser.photoProfil && typeof normalizedUser.photoProfil === 'string') {
        console.log("📷 Photo de profil mise à jour:", normalizedUser.photoProfil.substring(0, 50) + "...");
      } else {
        console.log("📷 Pas de photo de profil définie");
      }
      
      console.log("✅ State utilisateur mis à jour");
      console.groupEnd();
      
    } catch (error) {
      console.error("❌ Erreur lors de la normalisation de l'utilisateur:", error);
      // En cas d'erreur, on stocke quand même les données brutes
      setUser(updatedUser);
      console.groupEnd();
    }
  }, []);

  // ✅ FONCTION AMÉLIORÉE: Rafraîchir les données utilisateur depuis le serveur
  const refreshUser = useCallback(async () => {
    try {
      console.group("🔄 AuthProvider - Rafraîchissement des données utilisateur");
      
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log("✅ Données utilisateur rafraîchies:", currentUser);
        console.log("📷 Photo rafraîchie:", currentUser.photoProfil);
        setUser(currentUser);
        console.groupEnd();
        return currentUser;
      } else {
        console.log("❌ Aucun utilisateur connecté lors du rafraîchissement");
        setUser(null);
        console.groupEnd();
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement:", error);
      console.groupEnd();
      return null;
    }
  }, []);

  // ✅ FONCTION AMÉLIORÉE: Mettre à jour spécifiquement la photo de profil
  const updateUserPhoto = useCallback((photoUrl) => {
    console.group("📷 AuthProvider - Mise à jour photo de profil");
    console.log("Nouvelle URL photo:", photoUrl);
    
    setUser(prevUser => {
      if (!prevUser) {
        console.warn("⚠️ Tentative de mise à jour photo sans utilisateur connecté");
        console.groupEnd();
        return prevUser;
      }
      
      const updatedUser = {
        ...prevUser,
        photoProfil: photoUrl
      };
      
      console.log("✅ Photo de profil mise à jour dans le contexte");
      console.log("📷 Ancienne photo:", prevUser.photoProfil);
      console.log("📷 Nouvelle photo:", photoUrl);
      console.groupEnd();
      
      return updatedUser;
    });
  }, []);

  // ✅ NOUVEAU: Fonction pour débugger l'état utilisateur
  const debugUser = useCallback(() => {
    console.group("🐛 AuthProvider - Debug État Utilisateur");
    console.log("User state:", user);
    console.log("Loading:", loading);
    if (user) {
      console.log("User ID:", user._id || user.id);
      console.log("Nom:", user.nom);
      console.log("Email:", user.email);
      console.log("Photo profil:", user.photoProfil);
      console.log("Type utilisateur:", user.userType);
      console.log("Localisation:", user.localisation);
    }
    console.groupEnd();
  }, [user, loading]);

  // ✅ DEBUG: Log automatique des changements d'état utilisateur
  useEffect(() => {
    console.log("👤 AuthProvider - État utilisateur changé:", {
      hasUser: !!user,
      userId: user?._id || user?.id,
      userName: user?.nom,
      userPhoto: user?.photoProfil ? 'Présente' : 'Absente',
      loading
    });

    // Debug détaillé si l'utilisateur existe
    if (user && user.photoProfil) {
      console.log("📷 Photo détails:", {
        type: typeof user.photoProfil,
        length: user.photoProfil.length,
        preview: user.photoProfil.substring(0, 100) + "..."
      });
    }
  }, [user, loading]);

  // ✅ NOUVEAU: Fonction pour forcer le rechargement des données utilisateur
  const forceUserRefresh = useCallback(async () => {
    console.log("🔄 AuthProvider - Rechargement forcé utilisateur...");
    setLoading(true);
    try {
      const freshUser = await getCurrentUser();
      if (freshUser) {
        console.log("✅ Utilisateur rechargé:", freshUser);
        setUser(freshUser);
        return freshUser;
      } else {
        console.log("❌ Aucun utilisateur trouvé lors du rechargement");
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur rechargement utilisateur:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ AMÉLIORATION: Fonction pour valider l'intégrité des données utilisateur
  const validateUserData = useCallback((userData) => {
    if (!userData) return { valid: false, errors: ['Pas de données utilisateur'] };
    
    const errors = [];
    
    if (!userData._id && !userData.id) {
      errors.push('ID utilisateur manquant');
    }
    
    if (!userData.nom || userData.nom.trim() === '') {
      errors.push('Nom utilisateur manquant');
    }
    
    if (!userData.email || userData.email.trim() === '') {
      errors.push('Email utilisateur manquant');
    }
    
    const isValid = errors.length === 0;
    
    console.log('🔍 Validation données utilisateur:', {
      valid: isValid,
      errors,
      hasPhoto: !!userData.photoProfil
    });
    
    return { valid: isValid, errors };
  }, []);

  // ✅ NOUVEAU: Fonction pour obtenir les infos utilisateur formatées
  const getUserInfo = useCallback(() => {
    if (!user) return null;
    
    return {
      id: user._id || user.id,
      nom: user.nom,
      email: user.email,
      photoProfil: user.photoProfil,
      userType: user.userType,
      localisation: user.localisation,
      bio: user.bio,
      styles: user.styles,
      phone: user.phone,
      website: user.website,
      instagram: user.instagram,
      isComplete: !!(user.nom && user.userType && user.localisation)
    };
  }, [user]);

  // ✅ NOUVEAU: Fonction pour vérifier si le profil est complet
  const isProfileComplete = useCallback(() => {
    if (!user) return false;
    
    const required = ['nom', 'userType', 'localisation'];
    return required.every(field => user[field] && user[field].trim() !== '');
  }, [user]);

  // ✅ NOUVEAU: Fonction pour obtenir l'avatar avec fallback
  const getUserAvatar = useCallback(() => {
    if (!user) return null;
    
    // Retourner la photo ou null pour utiliser l'initiale
    return user.photoProfil || null;
  }, [user]);

  const value = {
    // États
    user,
    loading,
    
    // Fonctions principales
    login,
    logout,
    registerUser,
    
    // Fonctions de mise à jour
    setUser: updateUser,
    updateUser, // Alias pour la compatibilité
    updateUserPhoto, // ✅ NOUVEAU: Fonction spécifique pour la photo
    refreshUser, // ✅ NOUVEAU: Fonction pour rafraîchir depuis le serveur
    forceUserRefresh, // ✅ NOUVEAU: Rechargement forcé
    
    // Fonctions utilitaires
    checkIsFirstLogin, // ✅ NOUVEAU: Exposer pour utilisation externe
    validateUserData, // ✅ NOUVEAU: Validation des données
    debugUser, // ✅ NOUVEAU: Debug pour développement
    getUserInfo, // ✅ NOUVEAU: Infos utilisateur formatées
    isProfileComplete, // ✅ NOUVEAU: Vérification profil complet
    getUserAvatar, // ✅ NOUVEAU: Avatar avec fallback
    
    // Informations dérivées
    isAuthenticated: !!user,
    userId: user?._id || user?.id,
    userName: user?.nom,
    userPhoto: user?.photoProfil,
    userType: user?.userType,
    userEmail: user?.email,
    userLocation: user?.localisation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}