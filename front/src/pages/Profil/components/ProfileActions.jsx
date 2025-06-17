import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Share2 } from "lucide-react";

export default function ProfileActions({
  isOwnProfile,
  isFollowing,
  displayUser,
  onFollowClick,
  onMessageClick,
  onShareClick,
}) {
  const navigate = useNavigate();

  const handleMessageClick = () => {
    if (!displayUser) return;
    
    // Créer un identifiant unique pour la conversation
    // Utiliser l'ID de l'utilisateur ou ses initiales comme fallback
    const conversationId = displayUser._id || displayUser.nom?.replace(/\s+/g, '').substring(0, 2).toUpperCase() || 'USER';
    
    // Rediriger vers la page de conversation
    navigate(`/conversation/${conversationId}`, {
      state: {
        contactInfo: {
          id: displayUser._id,
          initials: getInitials(displayUser.nom),
          name: displayUser.nom || "Utilisateur",
          status: "Hors ligne", // Vous pourriez implémenter un système de statut en temps réel
          userType: displayUser.userType,
          avatar: displayUser.photoProfil
        }
      }
    });
    
    // Appeler la fonction onMessageClick si elle existe (pour des actions supplémentaires)
    if (onMessageClick) {
      onMessageClick();
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isOwnProfile) {
    return (
      <div className="flex space-x-3">
        <Link
          to="/modifierprofil"
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          Modifier le profil
        </Link>
        <Link
          to="/param"
          className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Paramètres
        </Link>
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={onFollowClick}
        className={`px-6 py-2 rounded-full font-medium transition-colors ${
          isFollowing
            ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
      >
        {isFollowing ? "Suivi" : "Suivre"}
      </button>

      <button 
        onClick={handleMessageClick}
        className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors flex items-center"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Message
      </button>

      <button
        onClick={onShareClick}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}