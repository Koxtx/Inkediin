import React from "react";
import { MapPin, Star, Users, Heart } from "lucide-react";
import { useFollow } from "../../../hooks/useFollow";
import { Link } from "react-router-dom";

// Composant pour une recommandation d'artiste individuelle
function ArtistRecommendedCard({ artist, onViewArtist }) {
  const { isFollowing, loading, toggleFollow } = useFollow(artist.id, false);

  const handleFollowClick = async (e) => {
    e.stopPropagation(); // Empêcher la propagation vers le parent
    await toggleFollow();
  };

  const getInitials = (name) => {
    return name.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {/* Header avec photo et infos de base */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold mr-3">
              {artist.profileImage ? (
                <img 
                  src={artist.profileImage} 
                  alt={artist.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(artist.name)
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 
                  onClick={() => onViewArtist(artist)}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-red-500 cursor-pointer transition-colors"
                >
                  {artist.name}
                </h3>
                {artist.verified && (
                  <span className="text-blue-500" title="Tatoueur vérifié">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{artist.specialty}</p>
            </div>
          </div>
          
          <button
            onClick={handleFollowClick}
            disabled={loading}
            className={`p-1.5 transition-colors ${
              loading 
                ? "opacity-50 cursor-not-allowed"
                : isFollowing
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-400 hover:text-red-500"
            }`}
            title={isFollowing ? "Ne plus suivre" : "Suivre"}
          >
            <Heart 
              size={18} 
              fill={isFollowing ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Localisation et distance */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <MapPin size={14} className="mr-1" />
          <span>{artist.location} • {artist.distance}</span>
        </div>

        {/* Rating et followers */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <Star size={14} className="text-yellow-500 mr-1" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {artist.rating}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Users size={14} className="mr-1" />
              <span>{artist.followersCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Travail récent */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Travail récent:</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{artist.recentWork}</p>
        </div>

        {/* Raison de la recommandation */}
        <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300">
            💡 {artist.matchReason}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewArtist(artist)}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Voir le profil
          </button>
          <button
            onClick={handleFollowClick}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              loading
                ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                : isFollowing
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  : "border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30"
            }`}
          >
            {loading ? "..." : isFollowing ? "Suivi" : "Suivre"}
          </button>
        </div>
      </div>
    </div>
  );
}

