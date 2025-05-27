import React, { useState } from "react";

import { FlashContext } from "../../context/FlashContext";

export default function FlashProvider({ children }) {
  // État pour les publications et flashs
  const [followedPosts, setFollowedPosts] = useState([
    {
      id: 1,
      username: "TattooArtist1",
      time: "Il y a 2 heures",
      likes: 124,
      caption:
        "Nouvelle création réalisée hier ! Style réaliste avec des touches de couleur. Qu'en pensez-vous ? #tattoo #realism #inkediin",
      comments: 18,
    },
    {
      id: 2,
      username: "InkMaster",
      time: "Il y a 5 heures",
      likes: 89,
      caption:
        "Nouveau design terminé pour un client. Style japonais traditionnel. #irezumi #japonais",
      comments: 7,
    },
  ]);

  const [recommendedPosts, setRecommendedPosts] = useState([
    {
      id: 3,
      username: "TattooQueen",
      time: "Il y a 1 jour",
      likes: 432,
      caption:
        "Pièce terminée après 3 séances. Un mandala avec des éléments floraux. #mandala #flowertattoo",
      comments: 42,
    },
    {
      id: 4,
      username: "InkDreamer",
      time: "Il y a 8 heures",
      likes: 215,
      caption:
        "Un petit aperçu de mon travail cette semaine. Style minimaliste. #minimalist #finelinetattoo",
      comments: 23,
    },
  ]);

  const [followedFlashes, setFollowedFlashes] = useState([
    { id: 1, title: "Rose Old School", artist: "TattooArtist1", price: "90€" },
    { id: 2, title: "Dragon Japonais", artist: "InkMaster", price: "150€" },
  ]);

  const [recommendedFlashes, setRecommendedFlashes] = useState([
    { id: 3, title: "Géométrique", artist: "ArtistInk", price: "120€" },
    { id: 4, title: "Tribal", artist: "InkCreator", price: "80€" },
    { id: 5, title: "Minimaliste", artist: "TattooQueen", price: "70€" },
    { id: 6, title: "Blackwork", artist: "InkDreamer", price: "110€" },
  ]);

  // État pour les flashs sauvegardés (wishlist)
  const [savedFlashes, setSavedFlashes] = useState([
    {
      id: 1,
      title: "Rose Traditionnelle",
      artist: "TattooArtist1",
      category: "Old School",
      comments: 3,
      views: 145,
    },
    {
      id: 2,
      title: "Dragon Japonais",
      artist: "TattooArtist3",
      category: "Réaliste",
      comments: 12,
      views: 289,
    },
    {
      id: 3,
      title: "Mandala",
      artist: "TattooArtist2",
      category: "Géométrique",
      comments: 7,
      views: 201,
    },
    {
      id: 4,
      title: "Fleur de Lotus",
      artist: "TattooArtist4",
      category: "Flash",
      comments: 5,
      views: 167,
    },
  ]);

  // Fonctions pour gérer les posts
  const toggleLikePost = (postId) => {
    // Vérifier dans les posts suivis
    const followedPostIndex = followedPosts.findIndex(
      (post) => post.id === postId
    );
    if (followedPostIndex !== -1) {
      const updatedPosts = [...followedPosts];
      // Si le post existe, on toggle le like (pour simplicité, on l'incrémente ou décrémente)
      const isLiked = updatedPosts[followedPostIndex].isLiked;
      updatedPosts[followedPostIndex] = {
        ...updatedPosts[followedPostIndex],
        isLiked: !isLiked,
        likes: isLiked
          ? updatedPosts[followedPostIndex].likes - 1
          : updatedPosts[followedPostIndex].likes + 1,
      };
      setFollowedPosts(updatedPosts);
      return;
    }

    // Vérifier dans les posts recommandés
    const recommendedPostIndex = recommendedPosts.findIndex(
      (post) => post.id === postId
    );
    if (recommendedPostIndex !== -1) {
      const updatedPosts = [...recommendedPosts];
      const isLiked = updatedPosts[recommendedPostIndex].isLiked;
      updatedPosts[recommendedPostIndex] = {
        ...updatedPosts[recommendedPostIndex],
        isLiked: !isLiked,
        likes: isLiked
          ? updatedPosts[recommendedPostIndex].likes - 1
          : updatedPosts[recommendedPostIndex].likes + 1,
      };
      setRecommendedPosts(updatedPosts);
    }
  };

  // Fonction pour sauvegarder un flash dans la wishlist
  const toggleSaveFlash = (flash) => {
    const exists = savedFlashes.some((item) => item.id === flash.id);

    if (exists) {
      // Supprimer de la wishlist
      setSavedFlashes(savedFlashes.filter((item) => item.id !== flash.id));
    } else {
      // Ajouter à la wishlist
      setSavedFlashes([...savedFlashes, flash]);
    }
  };

  // Fonction pour vérifier si un flash est déjà sauvegardé
  const isFlashSaved = (flashId) => {
    return savedFlashes.some((flash) => flash.id === flashId);
  };

  // Valeur partagée via le contexte
  const value = {
    followedPosts,
    recommendedPosts,
    followedFlashes,
    recommendedFlashes,
    savedFlashes,
    toggleLikePost,
    toggleSaveFlash,
    isFlashSaved,
  };

  return (
    <FlashContext.Provider value={value}>{children}</FlashContext.Provider>
  );
}
