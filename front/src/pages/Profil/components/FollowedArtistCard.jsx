import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, MessageCircle, Users, RefreshCw } from "lucide-react";
import { getFollowedUsers } from "../../../api/auth.api";
import { useFollow, useFollowList } from "../../../hooks/useFollow";
import { useMessagerie } from "../../../hooks/useMessagerie";
import toast from "react-hot-toast";

// Composant pour un artiste individuel dans la liste
function FollowedArtistCard({ artist, onUnfollow, onMessage, onViewProfile }) {
  const { isFollowing, loading, unfollow } = useFollow(artist._id || artist.id, true);

  const handleUnfollow = async () => {
    const result = await unfollow();
    if (result?.success) {
      onUnfollow(artist._id || artist.id);
      toast.success(`Vous ne suivez plus ${artist.nom}`);
    }
  };

  const handleMessage = () => {
    onMessage(artist);
  };

  const handleViewProfile = () => {
    onViewProfile(artist);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-grow">
            {/* Photo de profil */}
            <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold mr-4">
              {artist.photoProfil || artist.avatar ? (
                <img 
                  src={artist.photoProfil || artist.avatar}
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
                <button
                  onClick={handleViewProfile}
                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-red-500 transition-colors mr-2 text-left"
                >
                  {artist.nom}
                </button>
                {artist.verified && (
                  <span className="text-blue-500 text-sm" title="Tatoueur vérifié">✓</span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="mr-3">
                  {artist.styles ? `Spécialité: ${artist.styles.split(',')[0].trim()}` : 'Tatoueur professionnel'}
                </span>
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

              {/* Statistiques supplémentaires */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                {artist.followers !== undefined && (
                  <div className="flex items-center mr-3">
                    <Users size={10} className="mr-1" />
                    <span>{artist.followers} followers</span>
                  </div>
                )}
                {artist.createdAt && (
                  <span>
                    Suivi depuis {new Date(artist.followedAt || artist.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleMessage}
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

        {/* Bio courte si disponible */}
        {artist.bio && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {artist.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les filtres et le tri
function FollowedArtistsFilters({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  filterStyle, 
  onFilterStyleChange,
  availableStyles 
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Recherche */}
        <div className="flex-1 min-w-48">
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Filtre par style */}
        <div className="min-w-36">
          <select
            value={filterStyle}
            onChange={(e) => onFilterStyleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
          >
            <option value="">Tous les styles</option>
            {availableStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        {/* Tri */}
        <div className="min-w-36">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
          >
            <option value="recent">Récemment suivis</option>
            <option value="name">Nom A-Z</option>
            <option value="rating">Mieux notés</option>
            <option value="followers">Plus populaires</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function FollowedArtists({ onArtistClick, onMessageClick }) {
  const {
    followedUsers: followedArtists,
    loading,
    error,
    refreshList,
    removeFromList,
    count
  } = useFollowList();

  const { startConversationWithUser } = useMessagerie();
  
  // États pour les filtres et le tri
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterStyle, setFilterStyle] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Gérer l'arrêt de suivi d'un artiste
  const handleUnfollowArtist = (artistId) => {
    removeFromList(artistId);
  };

  // Gérer le clic sur un artiste
  const handleArtistClick = (artist) => {
    if (onArtistClick) {
      onArtistClick(artist);
    } else {
      // Navigation par défaut vers le profil
      window.open(`/profil/${artist._id || artist.id}`, '_blank');
    }
  };

  // Gérer l'envoi de message
  const handleMessageClick = (artist) => {
    if (onMessageClick) {
      onMessageClick(artist);
    } else {
      // Utiliser le hook de messagerie
      startConversationWithUser(artist);
    }
  };

  // Rafraîchir la liste
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshList();
    setRefreshing(false);
    toast.success('Liste mise à jour');
  };

  // Obtenir les styles disponibles pour le filtre
  const availableStyles = React.useMemo(() => {
    const styles = new Set();
    followedArtists.forEach(artist => {
      if (artist.styles) {
        artist.styles.split(',').forEach(style => {
          styles.add(style.trim());
        });
      }
    });
    return Array.from(styles).sort();
  }, [followedArtists]);

  // Filtrer et trier les artistes
  const filteredAndSortedArtists = React.useMemo(() => {
    let filtered = followedArtists;

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(artist => 
        artist.nom?.toLowerCase().includes(term) ||
        artist.styles?.toLowerCase().includes(term) ||
        artist.localisation?.toLowerCase().includes(term)
      );
    }

    // Filtre par style
    if (filterStyle) {
      filtered = filtered.filter(artist => 
        artist.styles?.toLowerCase().includes(filterStyle.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.nom || '').localeCompare(b.nom || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'followers':
          return (b.followers || 0) - (a.followers || 0);
        case 'recent':
        default:
          return new Date(b.followedAt || b.createdAt || 0) - new Date(a.followedAt || a.createdAt || 0);
      }
    });

    return filtered;
  }, [followedArtists, searchTerm, filterStyle, sortBy]);

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
              onClick={handleRefresh}
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
        <div>
          <h2 className="text-xl font-bold">
            Tatoueurs suivis ({count})
          </h2>
          {filteredAndSortedArtists.length !== count && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredAndSortedArtists.length} résultat{filteredAndSortedArtists.length > 1 ? 's' : ''} affiché{filteredAndSortedArtists.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Actualiser"
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          {followedArtists.length > 0 && (
            <Link 
              to="/artists" 
              className="flex items-center px-3 py-2 text-red-500 hover:text-red-600 transition-colors text-sm font-medium border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30"
            >
              Découvrir plus
            </Link>
          )}
        </div>
      </div>

      {/* Filtres */}
      {followedArtists.length > 0 && (
        <FollowedArtistsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterStyle={filterStyle}
          onFilterStyleChange={setFilterStyle}
          availableStyles={availableStyles}
        />
      )}

      {/* Liste des artistes */}
      {followedArtists.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
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
      ) : filteredAndSortedArtists.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucun résultat
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Aucun artiste ne correspond à vos critères de recherche
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStyle('');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedArtists.map((artist) => (
            <FollowedArtistCard
              key={artist._id || artist.id}
              artist={artist}
              onUnfollow={handleUnfollowArtist}
              onMessage={handleMessageClick}
              onViewProfile={handleArtistClick}
            />
          ))}
        </div>
      )}

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

      {/* Statistiques en bas */}
      {followedArtists.length > 0 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} className="mr-2" />
            <span>
              Vous suivez {count} artiste{count > 1 ? 's' : ''} • 
              {availableStyles.length} style{availableStyles.length > 1 ? 's' : ''} différent{availableStyles.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}