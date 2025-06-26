import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, MessageCircle } from "lucide-react";
import { getFollowedUsers } from "../../../api/auth.api";
import { useFollow } from "../../../hooks/useFollow";
import toast from "react-hot-toast";

// Composant pour un artiste individuel dans la liste
function FollowedArtistCard({ artist, onUnfollow, onMessage }) {
  const { isFollowing, loading, unfollow } = useFollow(artist._id, true);

  const handleUnfollow = async () => {
    const result = await unfollow();
    if (result?.success) {
      onUnfollow(artist._id);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center flex-grow">
        {/* Photo de profil */}
        <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold mr-4">
          {artist.photoProfil ? (
            <img 
              src={artist.photoProfil} 
              alt={artist.nom}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(artist.nom)
          )}
        </div>

        {/* Informations de l'artiste */}
        <div className="flex-grow">
          <div className="flex items-center mb-1">
            <Link
              to={`/profil/${artist._id}`}
              className="font-medium text-gray-900 dark:text-gray-100 hover:text-red-500 transition-colors mr-2"
            >
              {artist.nom}
            </Link>
            {artist.verified && (
              <span className="text-blue-500 text-sm" title="Tatoueur vérifié">✓</span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="mr-3">Spécialité: {artist.styles || 'Non spécifié'}</span>
            {artist.rating && (
              <div className="flex items-center">
                <Star size={12} className="text-yellow-500 mr-1" />
                <span>{artist.rating}</span>
              </div>
            )}
          </div>

          {artist.localisation && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={12} className="mr-1" />
              <span>{artist.localisation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onMessage(artist)}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 rounded-full transition-colors"
          title="Envoyer un message"
        >
          <MessageCircle size={16} />
        </button>

        <button 
          onClick={handleUnfollow}
          disabled={loading}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            loading 
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : isFollowing
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          {loading ? "..." : isFollowing ? "Suivi" : "Suivre"}
        </button>
      </div>
    </div>
  );
}

export default function FollowedArtists({ onArtistClick, onMessageClick }) {
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la liste des artistes suivis
  useEffect(() => {
    const loadFollowedArtists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getFollowedUsers();
        
        if (result.success) {
          setFollowedArtists(result.data);
        } else {
          setError(result.message || 'Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des artistes suivis:', err);
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    loadFollowedArtists();
  }, []);

  // Gérer l'arrêt de suivi d'un artiste
  const handleUnfollowArtist = (artistId) => {
    setFollowedArtists(prev => 
      prev.filter(artist => artist._id !== artistId)
    );
    toast.success('Vous ne suivez plus cet artiste');
  };

  // Gérer le clic sur un artiste
  const handleArtistClick = (artist) => {
    if (onArtistClick) {
      onArtistClick(artist);
    }
  };

  // Gérer l'envoi de message
  const handleMessageClick = (artist) => {
    if (onMessageClick) {
      onMessageClick(artist);
    } else {
      // Redirection par défaut vers la messagerie
      toast.info(`Redirection vers la messagerie avec ${artist.nom}`);
    }
  };

  if (loading) {
    return (
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-4">Tatoueurs suivis</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-4">Tatoueurs suivis</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center text-red-500">
            <p className="mb-4">❌ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Tatoueurs suivis ({followedArtists.length})
        </h2>
        {followedArtists.length > 0 && (
          <Link 
            to="/artists" 
            className="text-red-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            Découvrir plus d'artistes
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {followedArtists.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucun artiste suivi
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Découvrez et suivez des tatoueurs pour voir leurs dernières créations
              </p>
              <Link
                to="/artists"
                className="inline-block px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Découvrir des artistes
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {followedArtists.map((artist) => (
              <FollowedArtistCard
                key={artist._id}
                artist={artist}
                onUnfollow={handleUnfollowArtist}
                onMessage={handleMessageClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section suggestions si liste vide */}
      {followedArtists.length === 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Conseils pour commencer
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Explorez les tatoueurs par style ou localisation</li>
            <li>• Consultez leurs portfolios et avis clients</li>
            <li>• Suivez vos artistes préférés pour ne rien manquer</li>
            <li>• Recevez des notifications de leurs nouvelles créations</li>
          </ul>
        </div>
      )}
    </div>
  );
}