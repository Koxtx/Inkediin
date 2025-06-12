import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { signin, signup, getCurrentUser, signOut } from "../../api/auth.api";
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

      // Si on est sur une page publique, pas besoin de vérifier l'auth
      if (isPublicPath) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, [location.pathname]);

  // Fonction pour déterminer si c'est la première connexion
  const checkIsFirstLogin = useCallback((user) => {
    console.log("🔍 Vérification première connexion pour:", user);
    
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
    
    return isFirstLogin;
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await signin(credentials);
      
      if (response.success && response.user) {
        console.log("✅ Connexion réussie, utilisateur:", response.user);
        
        // Succès de la connexion
        setUser(response.user);
        toast.success("Connexion réussie !");
        
        // Déterminer si c'est la première connexion
        const isFirstLogin = checkIsFirstLogin(response.user);
        
        console.log("🔄 Redirection:", isFirstLogin ? "vers setup" : "vers accueil");
        
        return { 
          success: true, 
          user: response.user,
          isFirstLogin 
        };
      } else {
        // Erreur de connexion
        const errorMessage = response.message || "Erreur lors de la connexion";
        console.log("❌ Erreur connexion:", errorMessage);
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error("💥 Erreur lors de la connexion:", error);
      toast.error("Erreur lors de la connexion");
      return { success: false, message: "Erreur lors de la connexion" };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data) => {
    try {
      setLoading(true);
      const response = await signup(data);
      
      if (response.success) {
        toast.success(response.message || "Inscription réussie ! Vous pouvez maintenant vous connecter.");
        return { success: true, message: response.message };
      } else {
        toast.error(response.message || "Erreur lors de l'inscription");
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error("Erreur lors de l'inscription");
      return { success: false, message: "Erreur lors de l'inscription" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // On déconnecte quand même côté client
      setUser(null);
    }
  };

  
  const updateUser = useCallback((updatedUser) => {
    console.log("🔄 Mise à jour utilisateur:", updatedUser);
    // Vérifier que l'utilisateur mis à jour a bien un _id
    if (updatedUser && updatedUser._id) {
      setUser(updatedUser);
    } else {
      console.warn("⚠️ Tentative de mise à jour avec un utilisateur invalide:", updatedUser);
    }
  }, []);

  const value = {
    user,
    setUser: updateUser,
    login,
    logout,
    registerUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}