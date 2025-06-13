import React from "react";
import { MapPin, Star, Users, Heart } from "lucide-react";

export default function ArtistRecommendations({ 
  isOwnProfile, 
  displayUser,
  onFollowArtist,
  onViewArtist 
}) {
  // Ne s'affiche que pour les clients sur leur propre profil
  if (!isOwnProfile || displayUser?.userType !== 'client') {
    return null;
  }

  // Données factices pour les recommandations
  const recommendedArtists = [
    {
      id: 1,
      name: "Sarah_Ink",
      specialty: "Réalisme",
      location: "Paris, France",
      rating: 4.8,
      followersCount: 1250,
      distance: "2.5 km",
      profileImage: null,
      recentWork: "Portrait féminin",
      matchReason: "Spécialisé dans vos styles préférés",
      verified: true
    },
    {
      id: 2,
      name: "Marco_Tattoo",
      specialty: "Old School",
      location: "Paris, France", 
      rating: 4.9,
      followersCount: 890,
      distance: "3.1 km",
      profileImage: null,
      recentWork: "Pin-up classique",
      matchReason: "Excellentes critiques dans votre zone",
      verified: true
    },
    {
      id: 3,
      name: "Zen_Geometry",
      specialty: "Géométrique",
      location: "Boulogne, France",
      rating: 4.7,
      followersCount: 2100,
      distance: "5.8 km",
      profileImage: null,
      recentWork: "Mandala complexe",
      matchReason: "Style géométrique populaire",
      verified: false
    },
    {
      id: 4,
      name: "Tokyo_Dreams",
      specialty: "Japonais",
      location: "Paris, France",
      rating: 4.6,
      followersCount: 1560,
      distance: "4.2 km",
      profileImage: null,
      recentWork: "Dragon traditionnel",
      matchReason: "Spécialiste du style japonais",
      verified: true
    }
  ];

  const getInitials = (name) => {
    return name.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Recommandés pour vous</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Basé sur vos préférences et votre localisation
          </p>
        </div>
        <button className="text-red-500 hover:text-red-600 transition-colors text-sm font-medium">
          Voir plus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendedArtists.map((artist) => (
          <div 
            key={artist.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              {/* Header avec photo et infos de base */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold mr-3">
                    {getInitials(artist.name)}
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
                  onClick={() => onFollowArtist(artist.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart size={18} />
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
                  onClick={() => onFollowArtist(artist.id)}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors text-sm font-medium"
                >
                  Suivre
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}