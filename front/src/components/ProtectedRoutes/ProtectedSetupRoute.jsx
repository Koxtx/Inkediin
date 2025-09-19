import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedSetupRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
   
    if (loading) return;

   
    if (!user) {
      navigate("/signin");
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

    // Si le profil est incomplet et qu'on n'est pas sur la page setup
    if (isProfileIncomplete() && location.pathname !== "/setupprofil") {
      
      navigate("/setupprofil", { replace: true });
      return;
    }

    // Si le profil est complet et qu'on est sur la page setup
    if (!isProfileIncomplete() && location.pathname === "/setupprofil") {
     
      navigate("/", { replace: true });
      return;
    }
  }, [user, loading, navigate, location.pathname]);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Si pas d'utilisateur, ne rien afficher (la redirection va se faire)
  if (!user) {
    return null;
  }

  return children;
}