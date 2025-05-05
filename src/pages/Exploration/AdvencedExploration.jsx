import React, { useState } from "react";
import { Search, MapPin, Star } from "lucide-react";

export default function TattooMapExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("map");
  const [location, setLocation] = useState("Paris, France");
  const [radius, setRadius] = useState("10 km");
  const [maxPrice, setMaxPrice] = useState(250);
  const [availability, setAvailability] = useState("Cette semaine");
  const [minRating, setMinRating] = useState(3);

  const radiusOptions = ["5 km", "10 km", "20 km", "50 km"];
  const availabilityOptions = ["Cette semaine", "Ce mois-ci", "Personnalisé"];

  const [selectedStyles, setSelectedStyles] = useState(["Flash", "Old School"]);
  const styleOptions = [
    "Tous",
    "Flash",
    "Réaliste",
    "Old School",
    "Géométrique",
    "Tribal",
    "Japonais",
    "Minimaliste",
  ];

  const toggleStyle = (style) => {
    if (style === "Tous") {
      setSelectedStyles([]);
      return;
    }

    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const resetFilters = () => {
    setSelectedStyles([]);
    setMaxPrice(250);
    setRadius("10 km");
    setAvailability("Cette semaine");
    setMinRating(3);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
      {/* Search Box */}
      <div className="mb-6">
        <div className="relative">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="px-3 py-2">
              <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-3 px-2 outline-none bg-transparent dark:text-white"
              placeholder="Rechercher des tatoueurs, styles..."
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 overflow-hidden">
        <button
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === "list"
              ? "bg-red-500 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("list")}
        >
          Liste
        </button>
        <button
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === "map"
              ? "bg-red-500 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("map")}
        >
          Carte
        </button>
        <button
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === "filters"
              ? "bg-red-500 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("filters")}
        >
          Filtres
        </button>
      </div>

      {/* Map View */}
      {activeTab === "map" && (
        <div className="mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 sm:h-80 md:h-96 relative flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-md">
            Carte des tatoueurs à proximité
            {/* Map Pins */}
            <div className="absolute top-1/3 left-1/4 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              4
            </div>
            <div className="absolute top-1/2 left-1/2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              2
            </div>
            <div className="absolute bottom-1/3 left-2/3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              1
            </div>
            <div className="absolute bottom-1/4 right-1/4 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              3
            </div>
          </div>
        </div>
      )}

      {/* Filters - Always visible regardless of tab */}
      <div className="space-y-6">
        {/* Location Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">
            Localisation
          </h3>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 bg-white dark:bg-gray-700 text-gray-800 dark:text-white mb-3"
            placeholder="Paris, France"
          />

          <h3 className="font-medium text-gray-800 dark:text-white mb-2">
            Rayon de recherche
          </h3>
          <div className="flex flex-wrap gap-2">
            {radiusOptions.map((option) => (
              <button
                key={option}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  radius === option
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setRadius(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Style Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800 dark:text-white">
              Style de tatouage
            </h3>
            <button
              className="text-red-500 text-sm hover:underline"
              onClick={resetFilters}
            >
              Réinitialiser
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {styleOptions.map((style) => (
              <button
                key={style}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedStyles.includes(style) ||
                  (style === "Tous" && selectedStyles.length === 0)
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => toggleStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">
            Gamme de prix
          </h3>
          <input
            type="range"
            min="50"
            max="500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>50€</span>
            <span>Max: {maxPrice}€</span>
            <span>500€+</span>
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">
            Disponibilité
          </h3>
          <div className="flex flex-wrap gap-2">
            {availabilityOptions.map((option) => (
              <button
                key={option}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  availability === option
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setAvailability(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">
            Évaluation minimum
          </h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  minRating === rating
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setMinRating(rating)}
              >
                {Array(rating).fill("⭐").join("")}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium shadow-md transition-colors">
          Rechercher (10 résultats)
        </button>

        {/* Spacer */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}
