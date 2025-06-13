import React, { useState } from "react";
import { PublicationContext } from "../../context/PublicationContext";

export default function PublicationProvider({ children }) {
  // État pour les publications suivies
  const [followedPosts, setFollowedPosts] = useState([
    {
      id: 1,
      idTatoueur: "artist_1",
      username: "TattooArtist1",
      time: "Il y a 2 heures",
      datePublication: new Date("2024-06-13T10:00:00"),
      contenu: "Nouvelle création réalisée hier ! Style réaliste avec des touches de couleur. Qu'en pensez-vous ? #tattoo #realism #ink",
      image: null,
      tags: ["tattoo", "realism", "ink"],
      likes: 124,
      isLiked: false,
      isSaved: false,
      comments: 18,
      commentsData: [
        {
          id: 1,
          userId: "user_1",
          userType: "Client",
          username: "Client1",
          contenu: "Magnifique travail ! 🔥",
          date: new Date("2024-06-13T11:00:00"),
          likes: 5,
          isLiked: false,
          replies: []
        },
        {
          id: 2,
          userId: "artist_2",
          userType: "Tatoueur",
          username: "InkMaster",
          contenu: "Très beau rendu des couleurs !",
          date: new Date("2024-06-13T11:30:00"),
          likes: 3,
          isLiked: false,
          replies: [
            {
              id: 3,
              userId: "artist_1",
              userType: "Tatoueur",
              username: "TattooArtist1",
              contenu: "Merci beaucoup ! 🙏",
              date: new Date("2024-06-13T12:00:00"),
              likes: 1,
              isLiked: false
            }
          ]
        }
      ]
    },
    {
      id: 2,
      idTatoueur: "artist_2",
      username: "InkMaster",
      time: "Il y a 5 heures",
      datePublication: new Date("2024-06-13T07:00:00"),
      contenu: "Nouveau design terminé pour un client. Style japonais traditionnel. Fier du résultat ! #irezumi #japonais #traditional",
      image: null,
      tags: ["irezumi", "japonais", "traditional"],
      likes: 89,
      isLiked: true,
      isSaved: false,
      comments: 7,
      commentsData: [
        {
          id: 4,
          userId: "client_1",
          userType: "Client",
          username: "TattooLover",
          contenu: "Incroyable niveau de détail !",
          date: new Date("2024-06-13T08:00:00"),
          likes: 2,
          isLiked: false,
          replies: []
        }
      ]
    }
  ]);

  // État pour les publications recommandées
  const [recommendedPosts, setRecommendedPosts] = useState([
    {
      id: 3,
      idTatoueur: "artist_3",
      username: "TattooQueen",
      time: "Il y a 1 jour",
      datePublication: new Date("2024-06-12T15:00:00"),
      contenu: "Pièce terminée après 3 séances. Un mandala avec des éléments floraux. Le client est ravi ! #mandala #flowertattoo #geometric",
      image: null,
      tags: ["mandala", "flowertattoo", "geometric"],
      likes: 432,
      isLiked: false,
      isSaved: true,
      comments: 42,
      commentsData: []
    },
    {
      id: 4,
      idTatoueur: "artist_4",
      username: "InkDreamer",
      time: "Il y a 8 heures",
      datePublication: new Date("2024-06-13T04:00:00"),
      contenu: "Un petit aperçu de mon travail cette semaine. Style minimaliste qui gagne en popularité. #minimalist #finelinetattoo #simple",
      image: null,
      tags: ["minimalist", "finelinetattoo", "simple"],
      likes: 215,
      isLiked: false,
      isSaved: false,
      comments: 23,
      commentsData: []
    }
  ]);

  // État pour les publications sauvegardées
  const [savedPosts, setSavedPosts] = useState([
    {
      id: 3,
      idTatoueur: "artist_3",
      username: "TattooQueen",
      contenu: "Pièce terminée après 3 séances. Un mandala avec des éléments floraux.",
      image: null,
      dateSaved: new Date("2024-06-12T16:00:00"),
      datePublication: new Date("2024-06-12T15:00:00")
    }
  ]);

  // Fonction pour ajouter une nouvelle publication
  const addPublication = (publicationData) => {
    const newPublication = {
      id: Date.now(),
      idTatoueur: publicationData.idTatoueur || "current_user",
      username: publicationData.username || "Votre nom",
      time: "À l'instant",
      datePublication: new Date(),
      contenu: publicationData.contenu,
      image: publicationData.image || null,
      tags: publicationData.tags || [],
      likes: 0,
      isLiked: false,
      isSaved: false,
      comments: 0,
      commentsData: []
    };

    setFollowedPosts(prev => [newPublication, ...prev]);
    return newPublication;
  };

  // Fonction pour liker/unliker une publication
  const toggleLikePost = (postId) => {
    const updatePostInArray = (postArray, setPostArray) => {
      const postIndex = postArray.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        const updatedPosts = [...postArray];
        const post = updatedPosts[postIndex];
        updatedPosts[postIndex] = {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
        setPostArray(updatedPosts);
        return true;
      }
      return false;
    };

    // Essayer de mettre à jour dans les posts suivis
    if (updatePostInArray(followedPosts, setFollowedPosts)) return;
    
    // Sinon, essayer dans les posts recommandés
    updatePostInArray(recommendedPosts, setRecommendedPosts);
  };

  // Fonction pour sauvegarder/désauvegarder une publication
  const toggleSavePost = (post) => {
    const isAlreadySaved = savedPosts.some(savedPost => savedPost.id === post.id);

    if (isAlreadySaved) {
      // Retirer des sauvegardées
      setSavedPosts(prev => prev.filter(savedPost => savedPost.id !== post.id));
    } else {
      // Ajouter aux sauvegardées
      const postToSave = {
        id: post.id,
        idTatoueur: post.idTatoueur,
        username: post.username,
        contenu: post.contenu,
        image: post.image,
        dateSaved: new Date(),
        datePublication: post.datePublication
      };
      setSavedPosts(prev => [postToSave, ...prev]);
    }

    // Mettre à jour le statut isSaved dans les listes de posts
    const updateSaveStatus = (postArray, setPostArray) => {
      const postIndex = postArray.findIndex(p => p.id === post.id);
      if (postIndex !== -1) {
        const updatedPosts = [...postArray];
        updatedPosts[postIndex] = {
          ...updatedPosts[postIndex],
          isSaved: !isAlreadySaved
        };
        setPostArray(updatedPosts);
      }
    };

    updateSaveStatus(followedPosts, setFollowedPosts);
    updateSaveStatus(recommendedPosts, setRecommendedPosts);
  };

  // Fonction pour vérifier si une publication est sauvegardée
  const isPostSaved = (postId) => {
    return savedPosts.some(post => post.id === postId);
  };

  // Fonction pour ajouter un commentaire à une publication
  const addComment = (postId, commentData) => {
    const newComment = {
      id: Date.now(),
      userId: commentData.userId || "current_user",
      userType: commentData.userType || "Tatoueur",
      username: commentData.username || "Votre nom",
      contenu: commentData.contenu,
      date: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    const updatePostComments = (postArray, setPostArray) => {
      const postIndex = postArray.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        const updatedPosts = [...postArray];
        updatedPosts[postIndex] = {
          ...updatedPosts[postIndex],
          commentsData: [...(updatedPosts[postIndex].commentsData || []), newComment],
          comments: (updatedPosts[postIndex].comments || 0) + 1
        };
        setPostArray(updatedPosts);
        return true;
      }
      return false;
    };

    // Essayer de mettre à jour dans les posts suivis
    if (updatePostComments(followedPosts, setFollowedPosts)) return newComment;
    
    // Sinon, essayer dans les posts recommandés
    updatePostComments(recommendedPosts, setRecommendedPosts);
    return newComment;
  };

  // Fonction pour supprimer une publication
  const deletePost = (postId) => {
    setFollowedPosts(prev => prev.filter(post => post.id !== postId));
    setRecommendedPosts(prev => prev.filter(post => post.id !== postId));
    setSavedPosts(prev => prev.filter(post => post.id !== postId));
  };

  // Fonction pour obtenir les publications par tag
  const getPostsByTag = (tag) => {
    const allPosts = [...followedPosts, ...recommendedPosts];
    return allPosts.filter(post => 
      post.tags?.some(postTag => postTag.toLowerCase().includes(tag.toLowerCase())) ||
      post.contenu.toLowerCase().includes(`#${tag.toLowerCase()}`)
    );
  };

  // Fonction pour obtenir les publications par artiste
  const getPostsByArtist = (artistId) => {
    const allPosts = [...followedPosts, ...recommendedPosts];
    return allPosts.filter(post => post.idTatoueur === artistId);
  };

  // Valeur partagée via le contexte
  const value = {
    // États
    followedPosts,
    recommendedPosts,
    savedPosts,
    
    // Fonctions CRUD
    addPublication,
    deletePost,
    addComment,
    
    // Fonctions d'interaction
    toggleLikePost,
    toggleSavePost,
    isPostSaved,
    
    // Fonctions de recherche/filtrage
    getPostsByTag,
    getPostsByArtist,
    
    // Setters pour mise à jour externe si nécessaire
    setFollowedPosts,
    setRecommendedPosts,
    setSavedPosts
  };

  return (
    <PublicationContext.Provider value={value}>
      {children}
    </PublicationContext.Provider>
  );
}
