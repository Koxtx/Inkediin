import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function UserConnected({ children }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (loading) return;

    // Si pas d'utilisateur connecté, rediriger vers signin
    if (!user) {
      navigate("/signin", { replace: true });
      return;
    }

    // Fonction pour vérifier si le profil est incomplet
    const isProfileIncomplete = () => {
      return (
        !user.userType ||
        !user.nom ||
        user.nom.trim() === '' ||
        !user.localisation ||
        user.localisation.trim() === '' ||
        user.isProfileCompleted === false ||
        user.needsProfileCompletion === true
      );
    };

    // Si le profil est incomplet, rediriger vers setup
    if (isProfileIncomplete()) {
      
      navigate("/setupprofil", { replace: true });
      return;
    }
  }, [user, loading, navigate]);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur ou profil incomplet, ne rien afficher (la redirection va se faire)
  if (!user) {
    return null;
  }

  // Vérifier si le profil est incomplet
  const isProfileIncomplete = () => {
    return (
      !user.userType ||
      !user.nom ||
      user.nom.trim() === '' ||
      !user.localisation ||
      user.localisation.trim() === '' ||
      user.isProfileCompleted === false ||
      user.needsProfileCompletion === true
    );
  };

  if (isProfileIncomplete()) {
    return null; 
  }

  return children;
}