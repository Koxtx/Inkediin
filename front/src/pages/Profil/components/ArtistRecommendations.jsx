import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Users, Heart, RefreshCw, Settings } from "lucide-react";
import { 
  getArtistRecommendations, 
  markRecommendationInteraction,
  getUserPreferences,
  updateUserPreferences 
} from "../../../api/auth.api";
import { useFollow } from "../../../hooks/useFollow";
import toast from "react-hot-toast";

// Composant pour une recommandation d'artiste individuelle
function ArtistRecommendationCard({ artist, onViewArtist, onInteraction }) {
  const { isFollowing, loading, toggleFollow } = useFollow(artist._id || artist.id, false);

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    
    const result = await toggleFollow();
    
    if (result?.success) {
      // Marquer l'interaction pour améliorer les recommandations
      onInteraction(artist._id || artist.id, 'follow');
    }
  };

  const handleViewClick = () => {
    onViewArtist(artist);
    // Marquer comme vu
    onInteraction(artist._id || artist.id, 'view');
  };

  const getInitials = (name) => {
    return name?.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {/* Header avec photo et infos de base */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold mr-3">
              {artist.profileImage || artist.avatar || artist.photoProfil ? (
                <img 
                  src={artist.profileImage || artist.avatar || artist.photoProfil}
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
                  onClick={handleViewClick}
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
          <span>{artist.location} {artist.distance && `• ${artist.distance}`}</span>
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
              <span>{(artist.followersCount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Travail récent */}
        {artist.recentWork && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Travail récent:</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{artist.recentWork}</p>
          </div>
        )}

        {/* Raison de la recommandation */}
        {artist.matchReason && (
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              💡 {artist.matchReason}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleViewClick}
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

// Modal pour configurer les préférences de recommandations
function PreferencesModal({ onClose, onUpdate }) {
  const [preferences, setPreferences] = useState({
    preferredStyles: [],
    maxDistance: 20,
    minRating: 4.0,
    priceRange: { min: 50, max: 500 },
    experienceLevel: 'any',
    verifiedOnly: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const styleOptions = [
    'Réalisme', 'Old School', 'Géométrique', 'Japonais', 'Tribal',
    'Minimaliste', 'Aquarelle', 'Black & Grey', 'Biomécanique', 'Portrait'
  ];

  const experienceOptions = [
    { value: 'any', label: 'Tous niveaux' },
    { value: 'junior', label: 'Junior (0-3 ans)' },
    { value: 'intermediate', label: 'Intermédiaire (3-7 ans)' },
    { value: 'expert', label: 'Expert (7+ ans)' }
  ];

  // Charger les préférences existantes
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const result = await getUserPreferences();
        
        if (result.success && result.data) {
          setPreferences(prevState => ({
            ...prevState,
            ...result.data
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleStyleToggle = (style) => {
    setPreferences(prev => ({
      ...prev,
      preferredStyles: prev.preferredStyles.includes(style)
        ? prev.preferredStyles.filter(s => s !== style)
        : [...prev.preferredStyles, style]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateUserPreferences(preferences);
      
      if (result.success) {
        toast.success('Préférences mises à jour');
        onUpdate(preferences);
        onClose();
      } else {
        toast.error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>Chargement des préférences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-6">Personnaliser mes recommandations</h3>
        
        <div className="space-y-6">
          {/* Styles préférés */}
          <div>
            <label className="block text-sm font-medium mb-3">Styles préférés</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {styleOptions.map(style => (
                <button
                  key={style}
                  onClick={() => handleStyleToggle(style)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    preferences.preferredStyles.includes(style)
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-red-500'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Distance maximale */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Distance maximale: {preferences.maxDistance} km
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={preferences.maxDistance}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                maxDistance: parseInt(e.target.value)
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Note minimale */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Note minimale: {preferences.minRating}/5
            </label>
            <input
              type="range"
              min="3.0"
              max="5.0"
              step="0.1"
              value={preferences.minRating}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                minRating: parseFloat(e.target.value)
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3.0</span>
              <span>5.0</span>
            </div>
          </div>

          {/* Fourchette de prix */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Budget: {preferences.priceRange.min}€ - {preferences.priceRange.max}€
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Min</label>
                <input
                  type="number"
                  value={preferences.priceRange.min}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Max</label>
                <input
                  type="number"
                  value={preferences.priceRange.max}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 1000 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Niveau d'expérience */}
          <div>
            <label className="block text-sm font-medium mb-2">Niveau d'expérience</label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                experienceLevel: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              {experienceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tatoueurs vérifiés uniquement */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={preferences.verifiedOnly}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                verifiedOnly: e.target.checked
              }))}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="verifiedOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Uniquement les tatoueurs vérifiés
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArtistRecommendations({ 
  isOwnProfile, 
  displayUser,
  onFollowArtist,
  onViewArtist 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Ne s'affiche que pour les clients sur leur propre profil
  if (!isOwnProfile || displayUser?.userType !== 'client') {
    return null;
  }

  // Charger les recommandations
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser les préférences utilisateur comme filtres
      const filters = {
        location: displayUser?.localisation,
        limit: 8,
        ...customFilters
      };

      const result = await getArtistRecommendations(filters);
      
      if (result.success) {
        setRecommendations(result.data);
      } else {
        setError(result.message || 'Erreur lors du chargement des recommandations');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des recommandations:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Rafraîchir les recommandations
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
  };

  // Gérer les interactions avec les recommandations
  const handleInteraction = async (artistId, interactionType) => {
    try {
      await markRecommendationInteraction(artistId, interactionType);
      
      // Optionnel: Rafraîchir les recommandations après certaines interactions
      if (interactionType === 'follow') {
        // Peut-être rafraîchir pour montrer de nouvelles recommandations
        // await loadRecommendations();
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'interaction:', error);
    }
  };

  // Gérer la vue d'un artiste
  const handleViewArtist = (artist) => {
    // Marquer comme vu
    handleInteraction(artist._id || artist.id, 'view');
    
    if (onViewArtist) {
      onViewArtist(artist);
    } else {
      // Redirection par défaut
      window.open(`/profil/${artist._id || artist.id}`, '_blank');
    }
  };

  // Mise à jour des préférences
  const handlePreferencesUpdate = (newPreferences) => {
    setUserPreferences(newPreferences);
    // Recharger les recommandations avec les nouvelles préférences
    loadRecommendations(newPreferences);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Recommandés pour vous</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chargement des recommandations...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center text-red-500">
            <p className="mb-4">❌ {error}</p>
            <button 
              onClick={() => loadRecommendations()}
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
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Recommandés pour vous</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Basé sur vos préférences et votre localisation
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPreferences(true)}
            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500"
            title="Personnaliser"
          >
            <Settings size={16} className="mr-1" />
            Préférences
          </button>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center px-3 py-2 text-red-500 hover:text-red-600 transition-colors text-sm border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Actualiser"
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucune recommandation disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configurez vos préférences pour recevoir des recommandations personnalisées
            </p>
            <button
              onClick={() => setShowPreferences(true)}
              className="inline-flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <Settings size={16} className="mr-2" />
              Configurer mes préférences
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((artist) => (
            <ArtistRecommendationCard
              key={artist._id || artist.id}
              artist={artist}
              onViewArtist={handleViewArtist}
              onInteraction={handleInteraction}
            />
          ))}
        </div>
      )}

      {/* Section conseils pour les clients */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">💡</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Conseils pour choisir votre tatoueur
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Consultez le portfolio et les avis clients</li>
              <li>• Vérifiez les certifications d'hygiène</li>
              <li>• Rencontrez l'artiste pour discuter de votre projet</li>
              <li>• Comparez les tarifs et délais de rendez-vous</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Liens vers plus d'artistes */}
      {recommendations.length > 0 && (
        <div className="mt-6 text-center">
          <Link 
            to="/artists" 
            className="inline-flex items-center px-6 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors font-medium"
          >
            Voir tous les artistes
          </Link>
        </div>
      )}

      {/* Modal des préférences */}
      {showPreferences && (
        <PreferencesModal
          onClose={() => setShowPreferences(false)}
          onUpdate={handlePreferencesUpdate}
        />
      )}
    </div>
  );
}