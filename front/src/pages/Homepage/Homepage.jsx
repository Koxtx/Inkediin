import React, { useState, useEffect, useMemo } from "react";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import ArtistsGrid from "./components/ArtistsGrid";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import { getTattooers, calculateDistance } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

// Constantes des filtres inline
const categories = [
  "Tous",
  "Flash",
  "Réaliste",
  "Old School",
  "Géométrique",
  "Japonais",
  "Tribal",
  "Minimaliste",
  "Blackwork",
  "Watercolor",
  "Neo-traditionnel",
  "Biomécanique",
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
  "Nantes",
  "Montpellier",
  "Nice",
];

const experienceLevels = [
  "Tous",
  "Junior (0-3 ans)",
  "Intermédiaire (3-7 ans)",
  "Expert (7+ ans)",
];

export default function Homepage() {
  const [showFilters, setShowFilters] = useState(false);
   const navigate = useNavigate();

  // Hook useArtistsData inline
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArtists = async () => {
    setLoading(true);
    setError(null);

    const result = await getTattooers();

    if (result.success) {
      setArtists(result.data);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const refetch = fetchArtists;

  // Hook useGeolocation inline
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isNearbyMode, setIsNearbyMode] = useState(false);

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

  const disableNearbyMode = () => {
    setIsNearbyMode(false);
    setUserLocation(null);
  };

  const toggleLocationMode = () => {
    if (isNearbyMode) {
      disableNearbyMode();
    } else {
      getUserLocation();
    }
  };

  // Hook useArtistsFilter inline
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedLocation, setSelectedLocation] = useState("Toutes");
  const [selectedExperience, setSelectedExperience] = useState("Tous");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [locationRadius, setLocationRadius] = useState(20);

  const filteredArtists = useMemo(() => {
    if (artists.length === 0) return [];

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

    // Filtre par catégorie (style)
    if (selectedCategory !== "Tous") {
      results = results.filter((artist) => {
        if (!artist.styles) return false;
        const artistStyles = artist.styles
          .split(",")
          .map((s) => s.trim().toLowerCase());
        return artistStyles.some(
          (style) =>
            style.includes(selectedCategory.toLowerCase()) ||
            selectedCategory.toLowerCase().includes(style)
        );
      });
    }

    // Filtre par localisation (si pas en mode "autour de moi")
    if (selectedLocation !== "Toutes" && !isNearbyMode) {
      results = results.filter((artist) =>
        artist.location.toLowerCase().includes(selectedLocation.toLowerCase())
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

    return results;
  }, [
    artists,
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

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tous");
    setSelectedLocation("Toutes");
    setSelectedExperience("Tous");
    setMinPrice(0);
    setMaxPrice(500);
  };

  // Gestionnaires d'événements
  const handleContact = (artist) => {
    console.log("Contacter", artist.name);
    // Logique de contact
  };

 const handleViewProfile = (artistId) => {
    console.log("🎯 Navigation vers profil avec ID:", artistId);
    navigate(`/profil/${artistId}`); // Utilisation de navigate au lieu de window.location.href
  };

  const handleResetFilters = () => {
    resetFilters();
    // Autres actions de reset si nécessaire
  };

  // Affichage conditionnel
  if (loading) {
    return <LoadingSpinner message="Chargement des artistes..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }



  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">
        Découvrez les artistes
      </h2>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isNearbyMode={isNearbyMode}
        isLocating={isLocating}
        onLocationToggle={toggleLocationMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <FilterPanel
          showFilters={showFilters}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedExperience={selectedExperience}
          setSelectedExperience={setSelectedExperience}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          isNearbyMode={isNearbyMode}
          locationRadius={locationRadius}
          setLocationRadius={setLocationRadius}
          onResetFilters={handleResetFilters}
          categories={categories}
          locations={locations}
          experienceLevels={experienceLevels}
        />

        <ArtistsGrid
          filteredArtists={filteredArtists}
          artists={artists}
          isNearbyMode={isNearbyMode}
          onContact={handleContact}
          onViewProfile={handleViewProfile}
          onResetFilters={handleResetFilters}
          loading={loading}
        />
      </div>
    </div>
  );
}