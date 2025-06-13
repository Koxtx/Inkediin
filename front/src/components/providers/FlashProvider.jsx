import React, { useState } from "react";
import { FlashContext } from "../../context/FlashContext";

export default function FlashProvider({ children }) {
  // État pour les flashs suivis
  const [followedFlashes, setFollowedFlashes] = useState([
    {
      id: 1,
      title: "Rose Old School",
      artist: "TattooArtist1",
      artistId: "artist_1",
      price: 90,
      currency: "€",
      description: "Rose traditionnelle style old school avec des couleurs vives",
      image: null,
      tags: ["Old School", "Rose", "Couleur"],
      availability: "limited",
      limitNumber: 3,
      remainingSpots: 2,
      size: "m",
      placement: "arm",
      dateCreation: new Date("2024-06-10"),
      likes: 24,
      isLiked: false,
      isSaved: false,
      views: 145,
      comments: 3
    },
    {
      id: 2,
      title: "Dragon Japonais",
      artist: "InkMaster",
      artistId: "artist_2",
      price: 150,
      currency: "€",
      description: "Dragon traditionnel japonais en noir et gris",
      image: null,
      tags: ["Japonais", "Dragon", "Noir et gris"],
      availability: "exclusive",
      limitNumber: 1,
      remainingSpots: 1,
      size: "l",
      placement: "back",
      dateCreation: new Date("2024-06-12"),
      likes: 67,
      isLiked: true,
      isSaved: false,
      views: 234,
      comments: 8
    }
  ]);

  // État pour les flashs recommandés
  const [recommendedFlashes, setRecommendedFlashes] = useState([
    {
      id: 3,
      title: "Géométrique",
      artist: "ArtistInk",
      artistId: "artist_3",
      price: 120,
      currency: "€",
      description: "Motif géométrique minimaliste",
      image: null,
      tags: ["Géométrique", "Minimaliste", "Lignes"],
      availability: "unlimited",
      limitNumber: null,
      remainingSpots: null,
      size: "s",
      placement: "forearm",
      dateCreation: new Date("2024-06-08"),
      likes: 45,
      isLiked: false,
      isSaved: false,
      views: 189,
      comments: 12
    },
    {
      id: 4,
      title: "Tribal",
      artist: "InkCreator",
      artistId: "artist_4",
      price: 80,
      currency: "€",
      description: "Design tribal moderne",
      image: null,
      tags: ["Tribal", "Noir"],
      availability: "limited",
      limitNumber: 5,
      remainingSpots: 3,
      size: "m",
      placement: "shoulder",
      dateCreation: new Date("2024-06-11"),
      likes: 32,
      isLiked: false,
      isSaved: true,
      views: 167,
      comments: 5
    },
    {
      id: 5,
      title: "Minimaliste",
      artist: "TattooQueen",
      artistId: "artist_5",
      price: 70,
      currency: "€",
      description: "Design fin et élégant",
      image: null,
      tags: ["Minimaliste", "Fine Line"],
      availability: "unlimited",
      limitNumber: null,
      remainingSpots: null,
      size: "xs",
      placement: "ankle",
      dateCreation: new Date("2024-06-09"),
      likes: 78,
      isLiked: false,
      isSaved: false,
      views: 201,
      comments: 15
    },
    {
      id: 6,
      title: "Blackwork",
      artist: "InkDreamer",
      artistId: "artist_6",
      price: 110,
      currency: "€",
      description: "Design blackwork complexe",
      image: null,
      tags: ["Blackwork", "Géométrique"],
      availability: "limited",
      limitNumber: 2,
      remainingSpots: 1,
      size: "l",
      placement: "leg",
      dateCreation: new Date("2024-06-13"),
      likes: 89,
      isLiked: false,
      isSaved: false,
      views: 289,
      comments: 21
    }
  ]);

  // État pour les flashs sauvegardés (wishlist)
  const [savedFlashes, setSavedFlashes] = useState([
    {
      id: 1,
      title: "Rose Traditionnelle",
      artist: "TattooArtist1",
      artistId: "artist_1",
      category: "Old School",
      price: 90,
      currency: "€",
      comments: 3,
      views: 145,
      dateSaved: new Date("2024-06-10")
    },
    {
      id: 4,
      title: "Tribal",
      artist: "InkCreator",
      artistId: "artist_4",
      category: "Tribal",
      price: 80,
      currency: "€",
      comments: 5,
      views: 167,
      dateSaved: new Date("2024-06-11")
    }
  ]);

  // Fonction pour ajouter un nouveau flash
  const addFlash = (flashData) => {
    const newFlash = {
      id: Date.now(),
      ...flashData,
      dateCreation: new Date(),
      likes: 0,
      isLiked: false,
      isSaved: false,
      views: 0,
      comments: 0,
      remainingSpots: flashData.availability === "limited" ? flashData.limitNumber : null
    };

    setFollowedFlashes(prev => [newFlash, ...prev]);
    return newFlash;
  };

  // Fonction pour liker/unliker un flash
  const toggleLikeFlash = (flashId) => {
    const updateFlashInArray = (flashArray, setFlashArray) => {
      const flashIndex = flashArray.findIndex(flash => flash.id === flashId);
      if (flashIndex !== -1) {
        const updatedFlashes = [...flashArray];
        const flash = updatedFlashes[flashIndex];
        updatedFlashes[flashIndex] = {
          ...flash,
          isLiked: !flash.isLiked,
          likes: flash.isLiked ? flash.likes - 1 : flash.likes + 1
        };
        setFlashArray(updatedFlashes);
        return true;
      }
      return false;
    };

    // Essayer de mettre à jour dans les flashs suivis
    if (updateFlashInArray(followedFlashes, setFollowedFlashes)) return;
    
    // Sinon, essayer dans les flashs recommandés
    updateFlashInArray(recommendedFlashes, setRecommendedFlashes);
  };

  // Fonction pour sauvegarder/désauvegarder un flash
  const toggleSaveFlash = (flash) => {
    const isAlreadySaved = savedFlashes.some(savedFlash => savedFlash.id === flash.id);

    if (isAlreadySaved) {
      // Retirer de la wishlist
      setSavedFlashes(prev => prev.filter(savedFlash => savedFlash.id !== flash.id));
    } else {
      // Ajouter à la wishlist
      const flashToSave = {
        id: flash.id,
        title: flash.title,
        artist: flash.artist,
        artistId: flash.artistId,
        category: flash.tags?.[0] || "Divers",
        price: flash.price,
        currency: flash.currency,
        comments: flash.comments,
        views: flash.views,
        dateSaved: new Date()
      };
      setSavedFlashes(prev => [flashToSave, ...prev]);
    }

    // Mettre à jour le statut isSaved dans les listes de flashs
    const updateSaveStatus = (flashArray, setFlashArray) => {
      const flashIndex = flashArray.findIndex(f => f.id === flash.id);
      if (flashIndex !== -1) {
        const updatedFlashes = [...flashArray];
        updatedFlashes[flashIndex] = {
          ...updatedFlashes[flashIndex],
          isSaved: !isAlreadySaved
        };
        setFlashArray(updatedFlashes);
      }
    };

    updateSaveStatus(followedFlashes, setFollowedFlashes);
    updateSaveStatus(recommendedFlashes, setRecommendedFlashes);
  };

  // Fonction pour vérifier si un flash est sauvegardé
  const isFlashSaved = (flashId) => {
    return savedFlashes.some(flash => flash.id === flashId);
  };

  // Fonction pour supprimer un flash (si l'utilisateur en est l'auteur)
  const deleteFlash = (flashId) => {
    setFollowedFlashes(prev => prev.filter(flash => flash.id !== flashId));
    setRecommendedFlashes(prev => prev.filter(flash => flash.id !== flashId));
    setSavedFlashes(prev => prev.filter(flash => flash.id !== flashId));
  };

  // Fonction pour réserver un flash (diminuer le nombre de spots disponibles)
  const reserveFlash = (flashId) => {
    const updateFlashReservation = (flashArray, setFlashArray) => {
      const flashIndex = flashArray.findIndex(flash => flash.id === flashId);
      if (flashIndex !== -1) {
        const updatedFlashes = [...flashArray];
        const flash = updatedFlashes[flashIndex];
        
        if (flash.availability === "limited" && flash.remainingSpots > 0) {
          updatedFlashes[flashIndex] = {
            ...flash,
            remainingSpots: flash.remainingSpots - 1
          };
          setFlashArray(updatedFlashes);
          return true;
        } else if (flash.availability === "exclusive" && flash.remainingSpots === 1) {
          updatedFlashes[flashIndex] = {
            ...flash,
            remainingSpots: 0
          };
          setFlashArray(updatedFlashes);
          return true;
        }
      }
      return false;
    };

    // Essayer de réserver dans les flashs suivis
    if (updateFlashReservation(followedFlashes, setFollowedFlashes)) return true;
    
    // Sinon, essayer dans les flashs recommandés
    return updateFlashReservation(recommendedFlashes, setRecommendedFlashes);
  };

  // Fonction pour obtenir les flashs par catégorie/tag
  const getFlashesByTag = (tag) => {
    const allFlashes = [...followedFlashes, ...recommendedFlashes];
    return allFlashes.filter(flash => 
      flash.tags.some(flashTag => flashTag.toLowerCase().includes(tag.toLowerCase()))
    );
  };

  // Fonction pour obtenir les flashs par artiste
  const getFlashesByArtist = (artistId) => {
    const allFlashes = [...followedFlashes, ...recommendedFlashes];
    return allFlashes.filter(flash => flash.artistId === artistId);
  };

  // Valeur partagée via le contexte
  const value = {
    // États
    followedFlashes,
    recommendedFlashes,
    savedFlashes,
    
    // Fonctions CRUD
    addFlash,
    deleteFlash,
    
    // Fonctions d'interaction
    toggleLikeFlash,
    toggleSaveFlash,
    isFlashSaved,
    reserveFlash,
    
    // Fonctions de recherche/filtrage
    getFlashesByTag,
    getFlashesByArtist,
    
    // Setters pour mise à jour externe si nécessaire
    setFollowedFlashes,
    setRecommendedFlashes,
    setSavedFlashes
  };

  return (
    <FlashContext.Provider value={value}>
      {children}
    </FlashContext.Provider>
  );
}