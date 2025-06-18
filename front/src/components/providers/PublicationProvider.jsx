import React, { useState, useEffect } from "react";
import { PublicationContext } from "../../context/PublicationContext";
import { publicationApi, publicationUtils } from "../../api/feed.api";

export default function PublicationProvider({ children }) {
  // États pour les publications
  const [followedPosts, setFollowedPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // État pour l'utilisateur actuel
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ AJOUT: Récupérer l'utilisateur actuel
  useEffect(() => {
    const getCurrentUser = () => {
      try {
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(row => row.startsWith('token='));
        
        if (tokenCookie) {
          const token = tokenCookie.split('=')[1];
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.sub || payload.userId || payload.id || payload._id;
          
          if (userId) {
            setCurrentUserId(userId);
            console.log('✅ PublicationProvider - User ID:', userId);
            return;
          }
        }
        
        // Fallback temporaire
        setCurrentUserId('68492f8aff76a60093ccb90b');
        console.log('⚠️ PublicationProvider - ID temporaire');
      } catch (error) {
        console.error('❌ PublicationProvider - Erreur user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Charger les données initiales
  useEffect(() => {
    if (currentUserId) {
      loadInitialData();
    }
  }, [currentUserId]);

  // Fonction pour charger toutes les données initiales
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🌐 PublicationProvider - Chargement données...');
      
      // Charger les publications en parallèle
      const [followedData, recommendedData, savedData] =
        await Promise.allSettled([
          publicationApi.getFollowedPublications({ limit: 20 }),
          publicationApi.getRecommendedPublications({ limit: 20 }),
          publicationApi.getSavedPublications({ limit: 50 }),
        ]);

      // ✅ CORRECTION: Garder les données RAW de l'API
      if (followedData.status === "fulfilled") {
        const rawFollowed = followedData.value.publications || [];
        console.log('📦 PublicationProvider - Raw followed:', rawFollowed);
        
        // ✅ IMPORTANT: Ne PAS transformer, garder les données complètes
        setFollowedPosts(rawFollowed);
      }

      if (recommendedData.status === "fulfilled") {
        const rawRecommended = recommendedData.value.publications || [];
        console.log('📦 PublicationProvider - Raw recommended:', rawRecommended);
        
        // ✅ IMPORTANT: Ne PAS transformer, garder les données complètes
        setRecommendedPosts(rawRecommended);
      }

      if (savedData.status === "fulfilled") {
        const rawSaved = savedData.value.publications || [];
        console.log('📦 PublicationProvider - Raw saved:', rawSaved);
        
        // Pour les sauvegardées, on peut garder une adaptation simple
        const adaptedSaved = rawSaved.map(post => ({
          id: post._id || post.id,
          idTatoueur: post.idTatoueur?._id || post.idTatoueur,
          username: post.idTatoueur?.nom || post.username || "Utilisateur",
          contenu: post.contenu,
          image: post.image,
          dateSaved: new Date(post.dateSaved || post.createdAt),
          datePublication: new Date(post.datePublication || post.createdAt),
        }));
        
        setSavedPosts(adaptedSaved);
      }
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur chargement:", error);
      setError("Erreur lors du chargement des publications");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SUPPRIMÉ: adaptPublicationForState - On garde les données raw !

  // Fonction pour ajouter une nouvelle publication
  const addPublication = async (publicationData) => {
    try {
      setLoading(true);
      setError(null);

      // Valider les données
      const validationErrors = publicationUtils.validatePublicationData(publicationData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      // Créer la publication via l'API
      const newPublication = await publicationApi.createPublication(publicationData);
      
      console.log('✅ PublicationProvider - Nouvelle publication:', newPublication);

      // ✅ CORRECTION: Ajouter la publication RAW sans transformation
      setFollowedPosts((prev) => [newPublication, ...prev]);

      return newPublication;
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur création:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION: Fonction pour liker/unliker avec données raw
  const toggleLikePost = async (postId) => {
    try {
      console.log('👍 PublicationProvider - Toggle like:', postId, 'User:', currentUserId);
      
      // Fonction helper pour mettre à jour un post dans un array
      const updatePostInArray = (postArray, setPostArray) => {
        const postIndex = postArray.findIndex((post) => (post._id || post.id) === postId);
        if (postIndex !== -1) {
          const updatedPosts = [...postArray];
          const post = updatedPosts[postIndex];
          
          // ✅ CORRECTION: Travailler avec les données raw (likes array)
          const currentLikes = post.likes || [];
          const userHasLiked = currentLikes.some(like => {
            const likeUserId = like.userId?._id || like.userId?.id || like.userId;
            return likeUserId?.toString() === currentUserId?.toString();
          });

          console.log('🔍 PublicationProvider - Current likes:', currentLikes);
          console.log('🔍 PublicationProvider - User has liked:', userHasLiked);

          if (userHasLiked) {
            // Retirer le like
            updatedPosts[postIndex] = {
              ...post,
              likes: currentLikes.filter(like => {
                const likeUserId = like.userId?._id || like.userId?.id || like.userId;
                return likeUserId?.toString() !== currentUserId?.toString();
              })
            };
          } else {
            // Ajouter le like
            updatedPosts[postIndex] = {
              ...post,
              likes: [
                ...currentLikes,
                {
                  userId: currentUserId,
                  userType: 'tatoueur', // À adapter selon le type d'utilisateur
                  date: new Date()
                }
              ]
            };
          }

          setPostArray(updatedPosts);
          return true;
        }
        return false;
      };

      // Mise à jour optimiste
      let updated = updatePostInArray(followedPosts, setFollowedPosts);
      if (!updated) {
        updated = updatePostInArray(recommendedPosts, setRecommendedPosts);
      }

      // Appel API
      if (updated) {
        await publicationApi.toggleLikePublication(postId);
        console.log('✅ PublicationProvider - Like API success');
      }
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur like:", error);
      // En cas d'erreur, recharger les données pour être sûr
      await loadInitialData();
      setError("Erreur lors du like");
    }
  };

  // Fonction pour sauvegarder/désauvegarder une publication
  const toggleSavePost = async (post) => {
    try {
      const postId = post._id || post.id;
      const isAlreadySaved = savedPosts.some((savedPost) => savedPost.id === postId);

      // Mise à jour optimiste
      if (isAlreadySaved) {
        setSavedPosts((prev) => prev.filter((savedPost) => savedPost.id !== postId));
      } else {
        const postToSave = {
          id: postId,
          idTatoueur: post.idTatoueur?._id || post.idTatoueur,
          username: post.idTatoueur?.nom || post.username || "Utilisateur",
          contenu: post.contenu,
          image: post.image,
          dateSaved: new Date(),
          datePublication: new Date(post.datePublication || post.createdAt),
        };
        setSavedPosts((prev) => [postToSave, ...prev]);
      }

      // Appel API
      await publicationApi.toggleSavePublication(postId);
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur sauvegarde:", error);
      await loadInitialData(); // Recharger en cas d'erreur
      setError("Erreur lors de la sauvegarde");
    }
  };

  // Fonction pour vérifier si une publication est sauvegardée
  const isPostSaved = (postId) => {
    return savedPosts.some((post) => post.id === postId);
  };

  // Fonction pour ajouter un commentaire à une publication
  const addComment = async (postId, commentData) => {
    try {
      const validationErrors = publicationUtils.validateCommentData(commentData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      const newComment = await publicationApi.addComment(postId, commentData);

      // Mettre à jour localement les commentaires
      const updatePostComments = (postArray, setPostArray) => {
        const postIndex = postArray.findIndex((post) => (post._id || post.id) === postId);
        if (postIndex !== -1) {
          const updatedPosts = [...postArray];
          const currentComments = updatedPosts[postIndex].commentaires || [];
          
          updatedPosts[postIndex] = {
            ...updatedPosts[postIndex],
            commentaires: [...currentComments, newComment]
          };
          
          setPostArray(updatedPosts);
          return true;
        }
        return false;
      };

      // Mettre à jour dans les bonnes listes
      let updated = updatePostComments(followedPosts, setFollowedPosts);
      if (!updated) {
        updatePostComments(recommendedPosts, setRecommendedPosts);
      }

      return newComment;
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur commentaire:", error);
      setError(error.message);
      throw error;
    }
  };

  // Fonction pour supprimer une publication
  const deletePost = async (postId) => {
    try {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
        return;
      }

      setLoading(true);
      await publicationApi.deletePublication(postId);

      // Supprimer localement
      const removeFromArray = (postArray) => 
        postArray.filter((post) => (post._id || post.id) !== postId);

      setFollowedPosts(removeFromArray);
      setRecommendedPosts(removeFromArray);
      setSavedPosts(removeFromArray);
      
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur suppression:", error);
      setError("Erreur lors de la suppression de la publication");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir les publications par tag
  const getPostsByTag = async (tag) => {
    try {
      const response = await publicationApi.getPublicationsByTag(tag);
      return response.publications || [];
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur recherche tag:", error);
      setError("Erreur lors de la recherche");
      return [];
    }
  };

  // Fonction pour obtenir les publications par artiste
  const getPostsByArtist = async (artistId) => {
    try {
      const response = await publicationApi.getPublicationsByTattooArtist(artistId);
      return response.publications || [];
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur recherche artiste:", error);
      setError("Erreur lors de la recherche");
      return [];
    }
  };

  // Fonction pour recharger les données
  const refreshData = async () => {
    await loadInitialData();
  };

  // Fonction pour charger plus de publications (pagination)
  const loadMorePosts = async (type = "followed", page = 2) => {
    try {
      let response;

      if (type === "followed") {
        response = await publicationApi.getFollowedPublications({ page, limit: 10 });
        const newPosts = response.publications || [];
        setFollowedPosts((prev) => [...prev, ...newPosts]);
      } else if (type === "recommended") {
        response = await publicationApi.getRecommendedPublications({ page, limit: 10 });
        const newPosts = response.publications || [];
        setRecommendedPosts((prev) => [...prev, ...newPosts]);
      }

      return response;
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur pagination:", error);
      setError("Erreur lors du chargement");
      throw error;
    }
  };

  // Fonction pour vider le cache et recharger
  const clearAndReload = async () => {
    setFollowedPosts([]);
    setRecommendedPosts([]);
    setSavedPosts([]);
    await loadInitialData();
  };

  // Valeur partagée via le contexte
  const value = {
    // États - ✅ CORRECTION: Données raw de l'API
    followedPosts,
    recommendedPosts,
    savedPosts,
    loading,
    error,
    currentUserId,

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

    // Fonctions de gestion des données
    refreshData,
    loadMorePosts,
    clearAndReload,

    // Fonctions pour gérer les erreurs
    clearError: () => setError(null),

    // Setters
    setFollowedPosts,
    setRecommendedPosts,
    setSavedPosts,
    setCurrentUserId,

    // Utilitaires
    utils: publicationUtils,
  };

  return (
    <PublicationContext.Provider value={value}>
      {children}
    </PublicationContext.Provider>
  );
}