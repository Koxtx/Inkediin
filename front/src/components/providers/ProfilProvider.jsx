import React, { useState, useEffect } from "react";
import { ProfilContext } from "../../context/ProfilContext";
export default function ProfilProvider({ children }) {
  // États du profil
  const [userType, setUserType] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [preferences, setPreferences] = useState({
    favoriteStyles: ["Old School", "Géométrique", "Minimaliste", "Japonais"],
    preferredLocations: ["Avant-bras", "Épaule", "Dos"],
    criteria: {
      "Hygiène du studio": 5,
      "Réputation de l'artiste": 4,
      Prix: 3,
      Proximité: 2,
    },
  });
  const [wishlist, setWishlist] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [stats, setStats] = useState(null);

  // Simuler le chargement des données depuis une API
  useEffect(() => {
    // Ici vous feriez un appel API pour charger les données de profil
    // Exemple avec des données fictives
    const loadProfileData = () => {
      // Simuler un délai réseau
      setTimeout(() => {
        if (userType === "client") {
          setWishlist([
            { id: 1, artistName: "TattooArtist1", style: "Old School" },
            { id: 2, artistName: "TattooArtist2", style: "Géométrique" },
            { id: 3, artistName: "TattooArtist3", style: "Japonais" },
            { id: 4, artistName: "TattooArtist4", style: "Minimaliste" },
            { id: 5, artistName: "TattooArtist1", style: "Old School" },
            { id: 6, artistName: "TattooArtist2", style: "Géométrique" },
          ]);

          setFollowedArtists([
            { id: 1, name: "TattooArtist1", specialty: "Old School" },
            { id: 2, name: "TattooArtist2", specialty: "Géométrique" },
            { id: 3, name: "TattooArtist3", specialty: "Japonais" },
            { id: 4, name: "TattooArtist4", specialty: "Minimaliste" },
          ]);

          setUserProfile({
            username: "ClientUser123",
            bio: "Passionné(e) d'art corporel. À la recherche d'inspiration pour mon premier tatouage.",
            avatar: "C",
          });
        } else if (userType === "tatoueur") {
          setUserProfile({
            username: "TattooArtist",
            bio: "Tatoueur professionnel depuis 5 ans, spécialisé dans le réalisme et l'old school. Je travaille au studio Ink Vibes à Paris.",
            location: "Paris, France",
            avatar: "TA",
            specialty: "Tatoueur Réaliste & Old School",
            styles: ["Réaliste", "Old School", "Blackwork", "Géométrique"],
          });

          setStats({
            realizations: 128,
            flashes: 45,
            followers: 1200,
            views: {
              total: 1248,
              growth: "+15%",
              clickRate: "32%",
              avgTime: "2m 45s",
              newVisits: 854,
              returns: 394,
            },
            bookings: {
              total: 73,
              growth: "+23%",
              accepted: 52,
              pending: 14,
              rejected: 7,
              conversionRate: "71%",
            },
          });
        }

        setIsAuthenticated(true);
      }, 300);
    };

    if (userType) {
      loadProfileData();
    }
  }, [userType]);

  // Fonctions pour manipuler l'état
  const addToWishlist = (item) => {
    setWishlist((prev) => [...prev, item]);
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const followArtist = (artist) => {
    setFollowedArtists((prev) => [...prev, artist]);
  };

  const unfollowArtist = (artistId) => {
    setFollowedArtists((prev) =>
      prev.filter((artist) => artist.id !== artistId)
    );
  };

  const updatePreferences = (newPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      ...newPreferences,
    }));
  };

  // Valeur du contexte à fournir
  const contextValue = {
    userType,
    userProfile,
    isAuthenticated,
    preferences,
    wishlist,
    followedArtists,
    stats,
    setUserType,
    setUserProfile,
    addToWishlist,
    removeFromWishlist,
    followArtist,
    unfollowArtist,
    updatePreferences,
  };

  return (
    <ProfilContext.Provider value={contextValue}>
      {children}
    </ProfilContext.Provider>
  );
}
