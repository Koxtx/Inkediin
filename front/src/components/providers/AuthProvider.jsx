import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  signin,
  signup,
  getCurrentUser,
  signOut,
  normalizeUserData,
} from "../../api/auth.api";
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
      const publicPaths = [
        "/signin",
        "/signup",
        "/forgotpassword",
        "/reset-password",
      ];
      const isPublicPath = publicPaths.some((path) =>
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
        } else {
          console.log("❌ AuthProvider - Aucun utilisateur connecté");
        }
      } catch (error) {
        console.error(
          "❌ AuthProvider - Erreur lors de la vérification de l'utilisateur:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, [location.pathname]);

  const checkIsFirstLogin = useCallback((user) => {
    console.group("🔍 AuthProvider - Vérification première connexion");

    // Vérifier plusieurs critères possibles
    const hasNoUserType = !user.userType;
    const hasNoName = !user.nom || user.nom.trim() === "";
    const hasNoLocation = !user.localisation || user.localisation.trim() === "";
    const isProfileIncomplete = user.isProfileCompleted === false;
    const needsCompletion = user.needsProfileCompletion === true;

    const isFirstLogin =
      hasNoUserType ||
      hasNoName ||
      hasNoLocation ||
      isProfileIncomplete ||
      needsCompletion;

    console.groupEnd();
    return isFirstLogin;
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);

      const response = await signin(credentials);

      if (response.success && response.user) {
        setUser(response.user);
        toast.success("Connexion réussie !");

        // Déterminer si c'est la première connexion
        const isFirstLogin = checkIsFirstLogin(response.user);

        return {
          success: true,
          user: response.user,
          isFirstLogin,
        };
      } else {
        // Erreur de connexion
        const errorMessage = response.message || "Erreur lors de la connexion";

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

      const response = await signup(data);

      if (response.success) {
        toast.success(
          response.message ||
            "Inscription réussie ! Vous pouvez maintenant vous connecter."
        );
        return { success: true, message: response.message };
      } else {
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
      await signOut();
      setUser(null);

      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("❌ AuthProvider - Erreur lors de la déconnexion:", error);
      // On déconnecte quand même côté client
      setUser(null);
    }
  };

  const updateUser = useCallback((updatedUser) => {
    console.group("🔄 AuthProvider - Mise à jour utilisateur");

    if (!updatedUser) {
      console.warn(
        "⚠️ Tentative de mise à jour avec un utilisateur null/undefined"
      );
      console.groupEnd();
      return;
    }

    if (!updatedUser._id && !updatedUser.id) {
      console.warn(
        "⚠️ Tentative de mise à jour avec un utilisateur sans ID:",
        updatedUser
      );
      console.groupEnd();
      return;
    }

    try {
      const normalizedUser = normalizeUserData(updatedUser);

      setUser(normalizedUser);

      console.groupEnd();
    } catch (error) {
      console.error(
        "❌ Erreur lors de la normalisation de l'utilisateur:",
        error
      );
      // En cas d'erreur, on stocke quand même les données brutes
      setUser(updatedUser);
      console.groupEnd();
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      console.group(
        "🔄 AuthProvider - Rafraîchissement des données utilisateur"
      );

      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        console.groupEnd();
        return currentUser;
      } else {
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

  const updateUserPhoto = useCallback((photoUrl) => {
    console.group("📷 AuthProvider - Mise à jour photo de profil");

    setUser((prevUser) => {
      if (!prevUser) {
        console.warn(
          "⚠️ Tentative de mise à jour photo sans utilisateur connecté"
        );
        console.groupEnd();
        return prevUser;
      }

      const updatedUser = {
        ...prevUser,
        photoProfil: photoUrl,
      };

      console.groupEnd();

      return updatedUser;
    });
  }, []);

  const forceUserRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const freshUser = await getCurrentUser();
      if (freshUser) {
        setUser(freshUser);
        return freshUser;
      } else {
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

  const validateUserData = useCallback((userData) => {
    if (!userData)
      return { valid: false, errors: ["Pas de données utilisateur"] };

    const errors = [];

    if (!userData._id && !userData.id) {
      errors.push("ID utilisateur manquant");
    }

    if (!userData.nom || userData.nom.trim() === "") {
      errors.push("Nom utilisateur manquant");
    }

    if (!userData.email || userData.email.trim() === "") {
      errors.push("Email utilisateur manquant");
    }

    const isValid = errors.length === 0;

    return { valid: isValid, errors };
  }, []);

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
      isComplete: !!(user.nom && user.userType && user.localisation),
    };
  }, [user]);

  const isProfileComplete = useCallback(() => {
    if (!user) return false;

    const required = ["nom", "userType", "localisation"];
    return required.every((field) => user[field] && user[field].trim() !== "");
  }, [user]);

  const getUserAvatar = useCallback(() => {
    if (!user) return null;

    // Retourner la photo ou null pour utiliser l'initiale
    return user.photoProfil || null;
  }, [user]);

  const value = {
    user,
    loading,

    login,
    logout,
    registerUser,

    setUser: updateUser,
    updateUser,
    updateUserPhoto,
    refreshUser,
    forceUserRefresh,

    checkIsFirstLogin,
    validateUserData,
    debugUser,
    getUserInfo,
    isProfileComplete,
    getUserAvatar,

    // Informations dérivées
    isAuthenticated: !!user,
    userId: user?._id || user?.id,
    userName: user?.nom,
    userPhoto: user?.photoProfil,
    userType: user?.userType,
    userEmail: user?.email,
    userLocation: user?.localisation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
