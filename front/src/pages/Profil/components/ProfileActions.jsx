import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Share2, UserCheck, UserPlus } from "lucide-react";
import { useMessagerie } from "../../../hooks/useMessagerie";
import { useFollow } from "../../../hooks/useFollow";
import toast from "react-hot-toast";

export default function ProfileActions({
  isOwnProfile,
  displayUser,
  onMessageClick,
  onShareClick,
}) {
  const { startConversationWithUser } = useMessagerie();
  
  // Utiliser le hook de suivi avec l'ID de l'utilisateur affiché
  const { 
    isFollowing, 
    loading: followLoading, 
    toggleFollow 
  } = useFollow(displayUser?._id || displayUser?.id);

  const handleMessageClick = () => {
    if (!displayUser) return;
    
    // Utiliser le hook pour démarrer la conversation
    startConversationWithUser(displayUser);
    
    // Appeler la fonction onMessageClick si elle existe (pour des actions supplémentaires)
    if (onMessageClick) {
      onMessageClick();
    }
  };

  const handleFollowClick = async () => {
    if (!displayUser) return;
    
    const result = await toggleFollow();
    
    
  };

  const handleShareClick = () => {
    if (onShareClick) {
      onShareClick();
    } else {
      // Partage par défaut via l'API Web Share ou copie d'URL
      if (navigator.share) {
        navigator.share({
          title: `Profil de ${displayUser?.nom}`,
          text: `Découvrez le profil de ${displayUser?.nom} sur notre plateforme`,
          url: window.location.href,
        }).catch(console.error);
      } else {
        // Fallback : copier l'URL
        navigator.clipboard.writeText(window.location.href).then(() => {
          toast.success('Lien copié dans le presse-papiers !');
        }).catch(() => {
          toast.error('Impossible de copier le lien');
        });
      }
    }
  };

  if (isOwnProfile) {
    return (
      <div className="flex space-x-3">
        <Link
          to="/modifierprofil"
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium"
        >
          Modifier le profil
        </Link>
        <Link
          to="/param"
          className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          Paramètres
        </Link>
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      {/* Bouton Suivre/Suivi */}
      <button
        onClick={handleFollowClick}
        disabled={followLoading}
        className={`px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center ${
          followLoading 
            ? "opacity-50 cursor-not-allowed"
            : ""
        } ${
          isFollowing
            ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
            : "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
        }`}
      >
        {followLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>...</span>
          </div>
        ) : (
          <div className="flex items-center">
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                <span>Suivi</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Suivre</span>
              </>
            )}
          </div>
        )}
      </button>

      {/* Bouton Message */}
      <button 
        onClick={handleMessageClick}
        className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors flex items-center font-medium"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Message
      </button>

      {/* Bouton Partager */}
      <button
        onClick={handleShareClick}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        title="Partager ce profil"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}