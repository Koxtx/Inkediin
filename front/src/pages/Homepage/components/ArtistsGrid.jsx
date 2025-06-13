import React from "react";
import ArtistCard from "./ArtistCard";

const ArtistsGrid = ({
  filteredArtists,
  artists,
  isNearbyMode,
  onContact,
  onViewProfile,
  onResetFilters,
  loading,
}) => {
  if (loading) {
    return null; // Le loading est géré dans le composant parent
  }

  return (
    <div className="lg:w-3/4">
      {/* Résultats */}
      <div className="text-sm text-gray-500 mb-4">
        {filteredArtists.length}{" "}
        {filteredArtists.length === 1 ? "résultat" : "résultats"} trouvés
        {artists.length > 0 && (
          <span>
            {" "}
            sur {artists.length} artiste{artists.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Grille d'artistes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => (
          <ArtistCard
            key={artist._id}
            artist={artist}
            isNearbyMode={isNearbyMode}
            onContact={onContact}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>

      {/* Message si aucun artiste trouvé */}
      {filteredArtists.length === 0 && artists.length > 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-lg font-medium mb-2">
            Aucun artiste ne correspond à vos critères
          </div>
          <p className="text-sm mb-4">
            Essayez d'ajuster vos filtres pour voir plus de résultats
          </p>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={onResetFilters}
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      )}

      {/* Message si aucun artiste dans la base */}
      {artists.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-lg font-medium mb-2">
            Aucun artiste disponible pour le moment
          </div>
          <p className="text-sm mb-4">
            Revenez plus tard pour découvrir de nouveaux talents
          </p>
        </div>
      )}
    </div>
  );
};

export default ArtistsGrid;