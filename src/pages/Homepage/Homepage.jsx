import React, { useState, useEffect } from "react";
import { Search, MapPin, Filter, Compass, Loader } from "lucide-react";

export default function Homepage() {
  // États pour les différents filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedLocation, setSelectedLocation] = useState("Toutes");
  const [selectedExperience, setSelectedExperience] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [filteredArtists, setFilteredArtists] = useState([]);

  // États pour la géolocalisation
  const [userLocation, setUserLocation] = useState(null);
  const [locationRadius, setLocationRadius] = useState(20); // rayon en km
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Données des filtres
  const categories = [
    "Tous",
    "Flash",
    "Réaliste",
    "Old School",
    "Géométrique",
    "Japonais",
    "Tribal",
    "Minimaliste",
  ];
  const locations = [
    "Toutes",
    "Paris",
    "Lyon",
    "Marseille",
    "Bordeaux",
    "Lille",
    "Toulouse",
    "Strasbourg",
  ];
  const experienceLevels = [
    "Tous",
    "Junior (0-3 ans)",
    "Intermédiaire (3-7 ans)",
    "Expert (7+ ans)",
  ];

  // Données des artistes (enrichies avec plus d'informations et coordonnées GPS)
  const artists = [
    {
      name: "Sophie Martin",
      category: "Flash",
      location: "Paris",
      experience: "Expert (7+ ans)",
      price: 120,
      rating: 4.8,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 48.8566,
      longitude: 2.3522,
      distance: 0,
    },
    {
      name: "Lucas Dubois",
      category: "Réaliste",
      location: "Lyon",
      experience: "Expert (7+ ans)",
      price: 180,
      rating: 4.9,
      availability: "Complet",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 45.7578,
      longitude: 4.832,
      distance: 0,
    },
    {
      name: "Emma Klein",
      category: "Old School",
      location: "Paris",
      experience: "Intermédiaire (3-7 ans)",
      price: 100,
      rating: 4.6,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 48.8496,
      longitude: 2.3886,
      distance: 0,
    },
    {
      name: "Thomas Leroy",
      category: "Géométrique",
      location: "Marseille",
      experience: "Junior (0-3 ans)",
      price: 80,
      rating: 4.3,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 43.2965,
      longitude: 5.3698,
      distance: 0,
    },
    {
      name: "Léa Bernard",
      category: "Flash",
      location: "Bordeaux",
      experience: "Intermédiaire (3-7 ans)",
      price: 110,
      rating: 4.7,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 44.8378,
      longitude: -0.5792,
      distance: 0,
    },
    {
      name: "Antoine Garnier",
      category: "Réaliste",
      location: "Lille",
      experience: "Expert (7+ ans)",
      price: 200,
      rating: 5.0,
      availability: "Complet",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 50.6292,
      longitude: 3.0573,
      distance: 0,
    },
    {
      name: "Clara Morel",
      category: "Old School",
      location: "Toulouse",
      experience: "Junior (0-3 ans)",
      price: 90,
      rating: 4.2,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 43.6047,
      longitude: 1.4442,
      distance: 0,
    },
    {
      name: "Julien Petit",
      category: "Géométrique",
      location: "Strasbourg",
      experience: "Intermédiaire (3-7 ans)",
      price: 130,
      rating: 4.5,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 48.5734,
      longitude: 7.7521,
      distance: 0,
    },
    {
      name: "Marie Fontaine",
      category: "Japonais",
      location: "Paris",
      experience: "Expert (7+ ans)",
      price: 220,
      rating: 4.9,
      availability: "Complet",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 48.8738,
      longitude: 2.3501,
      distance: 0,
    },
    {
      name: "David Rousseau",
      category: "Tribal",
      location: "Lyon",
      experience: "Intermédiaire (3-7 ans)",
      price: 140,
      rating: 4.6,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 45.7673,
      longitude: 4.8343,
      distance: 0,
    },
    {
      name: "Camille Blanc",
      category: "Minimaliste",
      location: "Marseille",
      experience: "Junior (0-3 ans)",
      price: 70,
      rating: 4.4,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 43.3038,
      longitude: 5.3725,
      distance: 0,
    },
    {
      name: "Hugo Mercier",
      category: "Japonais",
      location: "Bordeaux",
      experience: "Expert (7+ ans)",
      price: 190,
      rating: 4.8,
      availability: "Disponible",
      avatar: "/api/placeholder/150/150",
      portfolio: "/api/placeholder/400/300",
      latitude: 44.8404,
      longitude: -0.5805,
      distance: 0,
    },
  ];

  // Fonction pour calculer la distance entre deux points GPS (formule de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance en km
    return distance;
  };

  // Fonction pour obtenir la position de l'utilisateur
  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setIsNearbyMode(true);
          setIsLocating(false);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          alert(
            "Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de localisation."
          );
          setIsLocating(false);
          setIsNearbyMode(false);
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocating(false);
      setIsNearbyMode(false);
    }
  };

  // Désactiver le mode "autour de moi"
  const disableNearbyMode = () => {
    setIsNearbyMode(false);
    setUserLocation(null);
  };

  // Mettre à jour les distances lorsque la position de l'utilisateur change
  useEffect(() => {
    if (isNearbyMode && userLocation) {
      const artistsWithDistance = artists.map((artist) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          artist.latitude,
          artist.longitude
        );
        return { ...artist, distance };
      });

      // Mettre à jour les distances
      setFilteredArtists(artistsWithDistance);
    }
  }, [userLocation, isNearbyMode]);

  // Appliquer les filtres chaque fois qu'un filtre change
  useEffect(() => {
    let results = [...artists];

    // Si mode "autour de moi" est activé, calculer les distances
    if (isNearbyMode && userLocation) {
      results = results.map((artist) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          artist.latitude,
          artist.longitude
        );
        return { ...artist, distance };
      });

      // Filtrer par rayon de distance
      results = results.filter((artist) => artist.distance <= locationRadius);
    }

    // Filtre par recherche (nom)
    if (searchTerm) {
      results = results.filter((artist) =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== "Tous") {
      results = results.filter(
        (artist) => artist.category === selectedCategory
      );
    }

    // Filtre par localisation (si pas en mode "autour de moi")
    if (selectedLocation !== "Toutes" && !isNearbyMode) {
      results = results.filter(
        (artist) => artist.location === selectedLocation
      );
    }

    // Filtre par expérience
    if (selectedExperience !== "Tous") {
      results = results.filter(
        (artist) => artist.experience === selectedExperience
      );
    }

    // Filtre par prix
    results = results.filter(
      (artist) => artist.price >= minPrice && artist.price <= maxPrice
    );

    // Si en mode "autour de moi", trier par distance
    if (isNearbyMode) {
      results.sort((a, b) => a.distance - b.distance);
    }

    setFilteredArtists(results);
  }, [
    searchTerm,
    selectedCategory,
    selectedLocation,
    selectedExperience,
    minPrice,
    maxPrice,
    isNearbyMode,
    userLocation,
    locationRadius,
  ]);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tous");
    setSelectedLocation("Toutes");
    setSelectedExperience("Tous");
    setMinPrice(0);
    setMaxPrice(500);
    setIsNearbyMode(false);
    setUserLocation(null);
  };

  // Formater le prix avec le symbole €
  const formatPrice = (price) => {
    return `${price} €`;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">
        Découvrez les artistes
      </h2>

      {/* Barre de recherche et bouton "Autour de moi" */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Rechercher un tatoueur..."
            className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
        <div className="flex gap-3">
          <button
            className={`flex items-center justify-center px-4 py-2 rounded-lg gap-2 transition-colors ${
              isNearbyMode
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={isNearbyMode ? disableNearbyMode : getUserLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Localisation...</span>
              </>
            ) : (
              <>
                <Compass size={18} />
                <span>{isNearbyMode ? "Désactiver" : "Autour de moi"}</span>
              </>
            )}
          </button>
          <button
            className="lg:hidden flex items-center justify-center p-3  rounded-lg "
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 ">
        {/* Filtres - tablette/mobile (collapsible) */}
        <div
          className={`${
            showFilters ? "block" : "hidden"
          } lg:block lg:w-1/4 `}
        >
          <div className=" p-4  rounded-lg shadow mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Filtres</h3>
              <button className="text-red-500 text-sm" onClick={resetFilters}>
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
                className="w-full  border border-gray-300 px-3 py-2 rounded-md"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par expérience */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Expérience</label>
              <select
                className="w-full  border border-gray-300 px-3 py-2 rounded-md"
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

        <div className="lg:w-3/4">
          {/* Résultats */}
          <div className="text-sm text-gray-500 mb-4">
            {filteredArtists.length}{" "}
            {filteredArtists.length === 1 ? "résultat" : "résultats"} trouvés
          </div>

          {/* Grille d'artistes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtists.map((artist, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden flex flex-col shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-red-400 p-3 flex items-center gap-3">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-bold  truncate">{artist.name}</div>
                    <div className="text-xs  flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {artist.location}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      artist.availability === "Disponible"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {artist.availability}
                  </div>
                </div>

                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={artist.portfolio}
                    alt={`Portfolio de ${artist.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex justify-between items-center">
                      <div className="text-white text-sm font-medium">
                        {artist.category}
                      </div>
                      <div className="text-white text-sm font-bold">
                        {formatPrice(artist.price)}
                      </div>
                      {isNearbyMode && (
                        <div className="text-white text-xs bg-black/50 px-2 py-1 rounded-full mt-1">
                          {artist.distance.toFixed(1)} km
                        </div>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < Math.floor(artist.rating)
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className=" text-xs ml-1">{artist.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button className="w-full py-2 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-md text-sm font-medium">
                    Prendre contact
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Message si aucun artiste trouvé */}
          {filteredArtists.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium mb-2">
                Aucun artiste ne correspond à vos critères
              </div>
              <p className="text-sm mb-4">
                Essayez d'ajuster vos filtres pour voir plus de résultats
              </p>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                onClick={resetFilters}
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
