import React from "react";

const FilterPanel = ({
  showFilters,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedExperience,
  setSelectedExperience,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isNearbyMode,
  locationRadius,
  setLocationRadius,
  onResetFilters,
  categories,
  locations,
  experienceLevels,
}) => {
  const formatPrice = (price) => `${price} €`;

  return (
    <div className={`${showFilters ? "block" : "hidden"} lg:block lg:w-1/4`}>
      <div className="p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Filtres</h3>
          <button className="text-red-500 text-sm" onClick={onResetFilters}>
            Réinitialiser
          </button>
        </div>

        {/* Filtre par style */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Style</label>
          <select
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par localisation */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Localisation</label>
          <select
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            disabled={isNearbyMode}
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {isNearbyMode && (
            <p className="text-xs text-gray-500 mt-1">
              Désactivé en mode "Autour de moi"
            </p>
          )}
        </div>

        {/* Filtre par expérience */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Expérience</label>
          <select
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
          >
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par prix */}
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Prix: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Filtre par rayon (disponible uniquement en mode "Autour de moi") */}
        {isNearbyMode && (
          <div className="mb-4">
            <label className="block font-medium mb-2">
              Rayon de recherche: {locationRadius} km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={locationRadius}
              onChange={(e) => setLocationRadius(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;