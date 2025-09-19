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

  const enrichPublicationData = (publications) => {
    console.group("🔄 enrichPublicationData - Processing");

    if (!publications || !Array.isArray(publications)) {
      console.warn("⚠️ Publications invalides:", publications);
      console.groupEnd();
      return [];
    }

    const enriched = publications.map((publication, index) => {
      const originalAuthor = publication.idTatoueur;

      const enrichedAuthor = originalAuthor
        ? {
            ...originalAuthor,

            photoProfil:
              originalAuthor.photoProfil ||
              originalAuthor.avatar ||
              originalAuthor.profilePicture ||
              originalAuthor.profileImage ||
              originalAuthor.image ||
              originalAuthor.photo ||
              null,
          }
        : null;

      const originalComments = publication.commentaires || [];

      const enrichedComments = originalComments.map((comment, commentIndex) => {
        const originalCommentUser = comment.userId;

        const enrichedCommentUser = originalCommentUser
          ? {
              ...originalCommentUser,

              photoProfil:
                originalCommentUser.photoProfil ||
                originalCommentUser.avatar ||
                originalCommentUser.profilePicture ||
                originalCommentUser.profileImage ||
                originalCommentUser.image ||
                originalCommentUser.photo ||
                null,
            }
          : null;

        return {
          ...comment,
          userId: enrichedCommentUser,
        };
      });

      const enrichedPublication = {
        ...publication,
        idTatoueur: enrichedAuthor,
        commentaires: enrichedComments,
      };

      return enrichedPublication;
    });

    console.groupEnd();
    return enriched;
  };

  useEffect(() => {
    const getCurrentUser = () => {
      try {
        const cookies = document.cookie.split("; ");
        const tokenCookie = cookies.find((row) => row.startsWith("token="));

        if (tokenCookie) {
          const token = tokenCookie.split("=")[1];
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId =
            payload.sub || payload.userId || payload.id || payload._id;

          if (userId) {
            setCurrentUserId(userId);

            return;
          }
        }

        // Fallback temporaire
        setCurrentUserId("68492f8aff76a60093ccb90b");
      } catch (error) {
        console.error("❌ PublicationProvider - Erreur init user:", error);
        setCurrentUserId("68492f8aff76a60093ccb90b");
      }
    };

    getCurrentUser();
  }, []);

  // Charger les données initiales
  useEffect(() => {
    if (currentUserId) {
      loadInitialData();
    }
  }, [currentUserId]); // Suppression de loadInitialData pour éviter la boucle infinie

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.group("🌐 PublicationProvider - Chargement données");

      // Charger les publications en parallèle
      const [followedData, recommendedData, savedData] =
        await Promise.allSettled([
          publicationApi.getFollowedPublications({ limit: 20 }),
          publicationApi.getRecommendedPublications({ limit: 20 }),
          publicationApi.getSavedPublications({ limit: 50 }),
        ]);

      if (followedData.status === "fulfilled") {
        const rawFollowed = followedData.value.publications || [];

        const enrichedFollowed = enrichPublicationData(rawFollowed);
        setFollowedPosts(enrichedFollowed);
      } else {
        console.error(
          "❌ Erreur chargement publications suivies:",
          followedData.reason
        );
      }

      if (recommendedData.status === "fulfilled") {
        const rawRecommended = recommendedData.value.publications || [];

        const enrichedRecommended = enrichPublicationData(rawRecommended);
        setRecommendedPosts(enrichedRecommended);
      } else {
        console.error(
          "❌ Erreur chargement publications recommandées:",
          recommendedData.reason
        );
      }

      if (savedData.status === "fulfilled") {
        const rawSaved = savedData.value.publications || [];

        // Pour les sauvegardées, adaptation avec avatars
        const adaptedSaved = rawSaved.map((post) => {
          const adapted = {
            id: post._id || post.id,
            idTatoueur: post.idTatoueur?._id || post.idTatoueur,
            username: post.idTatoueur?.nom || post.username || "Utilisateur",
            userAvatar:
              post.idTatoueur?.photoProfil ||
              post.idTatoueur?.avatar ||
              post.idTatoueur?.profilePicture ||
              null,
            contenu: post.contenu,
            image: post.image,
            dateSaved: new Date(post.dateSaved || post.createdAt),
            datePublication: new Date(post.datePublication || post.createdAt),
          };

          return adapted;
        });

        setSavedPosts(adaptedSaved);
      } else {
        console.error(
          "❌ Erreur chargement publications sauvegardées:",
          savedData.reason
        );
      }

      console.groupEnd();
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur chargement:", error);
      setError("Erreur lors du chargement des publications");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ajouter une nouvelle publication
  const addPublication = async (publicationData) => {
    try {
      setLoading(true);
      setError(null);

      // Valider les données
      const validationErrors =
        publicationUtils.validatePublicationData(publicationData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      // Créer la publication via l'API
      const newPublication = await publicationApi.createPublication(
        publicationData
      );

      const userInfo = getCurrentUserInfo();
      const enrichedNewPublication = {
        ...newPublication,
        idTatoueur: {
          _id: userInfo.id,
          nom: userInfo.nom,
          photoProfil: userInfo.photoProfil,
        },
      };

      // Ajouter la publication enrichie en première position
      setFollowedPosts((prev) => [enrichedNewPublication, ...prev]);

      return newPublication;
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur création:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleLikePost = async (postId) => {
    try {
      console.group("👍 PublicationProvider - Toggle like POST");

      // Appel API direct

      const result = await publicationApi.toggleLikePublication(postId);

      if (result) {
        // Recharger les données suivies
        try {
          const followedData = await publicationApi.getFollowedPublications({
            limit: 20,
          });
          if (followedData.publications) {
            const enrichedFollowed = enrichPublicationData(
              followedData.publications
            );
            setFollowedPosts(enrichedFollowed);
          }
        } catch (error) {
          console.warn("⚠️ Erreur rechargement followedPosts:", error);
        }

        // Recharger les données recommandées
        try {
          const recommendedData =
            await publicationApi.getRecommendedPublications({ limit: 20 });
          if (recommendedData.publications) {
            const enrichedRecommended = enrichPublicationData(
              recommendedData.publications
            );
            setRecommendedPosts(enrichedRecommended);
          }
        } catch (error) {
          console.warn("⚠️ Erreur rechargement recommendedPosts:", error);
        }
      }

      console.groupEnd();
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur like:", error);
      setError("Erreur lors du like");
      throw error;
    }
  };

  // Fonction pour sauvegarder/désauvegarder une publication
  const toggleSavePost = async (post) => {
    try {
      const postId = post._id || post.id;
      const isAlreadySaved = savedPosts.some(
        (savedPost) => savedPost.id === postId
      );

      // Mise à jour optimiste
      if (isAlreadySaved) {
        setSavedPosts((prev) =>
          prev.filter((savedPost) => savedPost.id !== postId)
        );
      } else {
        const postToSave = {
          id: postId,
          idTatoueur: post.idTatoueur?._id || post.idTatoueur,
          username: post.idTatoueur?.nom || post.username || "Utilisateur",
          userAvatar:
            post.idTatoueur?.photoProfil ||
            post.idTatoueur?.avatar ||
            post.idTatoueur?.profilePicture ||
            null,
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
      await loadInitialData();
      setError("Erreur lors de la sauvegarde");
    }
  };

  // Fonction pour vérifier si une publication est sauvegardée
  const isPostSaved = (postId) => {
    return savedPosts.some((post) => post.id === postId);
  };

  // Fonction pour supprimer une publication
  const deletePost = async (postId) => {
    try {
      if (
        !window.confirm(
          "Êtes-vous sûr de vouloir supprimer cette publication ?"
        )
      ) {
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
      const enrichedPosts = enrichPublicationData(response.publications || []);
      return enrichedPosts;
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur recherche tag:", error);
      setError("Erreur lors de la recherche");
      return [];
    }
  };

  // Fonction pour obtenir les publications par artiste
  const getPostsByArtist = async (artistId) => {
    try {
      const response = await publicationApi.getPublicationsByTattooArtist(
        artistId
      );
      const enrichedPosts = enrichPublicationData(response.publications || []);
      return enrichedPosts;
    } catch (error) {
      console.error(
        "❌ PublicationProvider - Erreur recherche artiste:",
        error
      );
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
        response = await publicationApi.getFollowedPublications({
          page,
          limit: 10,
        });
        const newPosts = enrichPublicationData(response.publications || []);
        setFollowedPosts((prev) => [...prev, ...newPosts]);
      } else if (type === "recommended") {
        response = await publicationApi.getRecommendedPublications({
          page,
          limit: 10,
        });
        const newPosts = enrichPublicationData(response.publications || []);
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

  const getCurrentUserInfo = () => {
    try {
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((row) => row.startsWith("token="));
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
          id: payload.sub || payload.userId || payload.id || payload._id,
          nom:
            payload.nom ||
            payload.username ||
            payload.name ||
            payload.displayName,
          photoProfil:
            payload.photoProfil ||
            payload.avatar ||
            payload.profilePicture ||
            null,
          userType: payload.userType || payload.role || "tatoueur",
        };
      }
      return {
        id: "68492f8aff76a60093ccb90b",
        nom: "Test User",
        photoProfil: null,
        userType: "tatoueur",
      };
    } catch {
      return {
        id: "68492f8aff76a60093ccb90b",
        nom: "Test User",
        photoProfil: null,
        userType: "tatoueur",
      };
    }
  };

  const addComment = async (postId, commentData) => {
    try {
      const validationErrors =
        publicationUtils.validateCommentData(commentData);
      if (validationErrors.length > 0)
        throw new Error(validationErrors.join(", "));

      const userInfo = getCurrentUserInfo();
      const enrichedCommentData = {
        ...commentData,
        userId: userInfo.id,
        userAvatar: userInfo.photoProfil,
      };

      const newComment = await publicationApi.addComment(
        postId,
        enrichedCommentData
      );
      const enrichedComment = {
        ...newComment,
        userId: {
          _id: userInfo.id,
          nom: userInfo.nom,
          photoProfil: userInfo.photoProfil,
        },
      };

      const updatePostComments = (postArray, setPostArray) => {
        const postIndex = postArray.findIndex(
          (post) => (post._id || post.id) === postId
        );
        if (postIndex !== -1) {
          const updatedPosts = [...postArray];
          const currentComments = updatedPosts[postIndex].commentaires || [];
          updatedPosts[postIndex] = {
            ...updatedPosts[postIndex],
            commentaires: [...currentComments, enrichedComment],
          };
          setPostArray(updatedPosts);
          return true;
        }
        return false;
      };

      let updated = updatePostComments(followedPosts, setFollowedPosts);
      if (!updated) updatePostComments(recommendedPosts, setRecommendedPosts);

      return enrichedComment;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const addReplyToComment = async (postId, commentId, replyData) => {
    try {
      const validationErrors = publicationUtils.validateCommentData(replyData);
      if (validationErrors.length > 0)
        throw new Error(validationErrors.join(", "));

      const updatedFeed = await publicationApi.addReplyToComment(
        postId,
        commentId,
        replyData
      );

      const updatePostReplies = (postArray, setPostArray) => {
        const postIndex = postArray.findIndex(
          (post) => (post._id || post.id) === postId
        );
        if (postIndex !== -1) {
          const updatedPosts = [...postArray];
          updatedPosts[postIndex] = updatedFeed;
          setPostArray(updatedPosts);
          return true;
        }
        return false;
      };

      let updated = updatePostReplies(followedPosts, setFollowedPosts);
      if (!updated) updatePostReplies(recommendedPosts, setRecommendedPosts);

      return updatedFeed;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const toggleLikeComment = async (postId, commentId) => {
    try {
      // Fonction pour mettre à jour un commentaire dans un post
      const updateCommentLike = (postArray, setPostArray) => {
        const postIndex = postArray.findIndex(
          (post) => (post._id || post.id) === postId
        );

        if (postIndex !== -1) {
          const updatedPosts = [...postArray];
          const post = updatedPosts[postIndex];

          const commentIndex = post.commentaires?.findIndex(
            (c) => (c._id || c.id) === commentId
          );

          if (commentIndex !== -1 && commentIndex !== undefined) {
            const comment = post.commentaires[commentIndex];
            const currentLikes = comment.likes || [];
            const userInfo = getCurrentUserInfo();

            const userHasLiked = currentLikes.some((like) => {
              const likeUserId =
                like.userId?._id || like.userId?.id || like.userId;
              const hasLiked =
                likeUserId?.toString() === currentUserId?.toString();

              return hasLiked;
            });

            // Mise à jour optimiste
            if (userHasLiked) {
              // Retirer le like
              comment.likes = currentLikes.filter((like) => {
                const likeUserId =
                  like.userId?._id || like.userId?.id || like.userId;
                return likeUserId?.toString() !== currentUserId?.toString();
              });
            } else {
              // Ajouter le like
              comment.likes = [
                ...currentLikes,
                {
                  userId: {
                    _id: currentUserId,
                    nom: userInfo.nom,
                  },
                  userType: userInfo.userType,
                  dateLike: new Date(),
                },
              ];
            }

            setPostArray(updatedPosts);
            return true;
          } else {
            console.warn("❌ Commentaire non trouvé dans le post");
          }
        } else {
          console.warn("❌ Post non trouvé dans ce tableau");
        }
        return false;
      };

      // Mise à jour optimiste dans les deux tableaux
      let updated = updateCommentLike(followedPosts, setFollowedPosts);
      if (!updated) {
        updated = updateCommentLike(recommendedPosts, setRecommendedPosts);
      }

      // Appel API seulement si la mise à jour locale a réussi
      if (updated) {
        const result = await publicationApi.toggleLikeComment(
          postId,
          commentId
        );

        // ✅ OPTIONNEL: Mettre à jour avec les données de l'API pour être sûr
        if (result && result.commentaires) {
          const updateWithApiData = (postArray, setPostArray) => {
            const postIndex = postArray.findIndex(
              (post) => (post._id || post.id) === postId
            );
            if (postIndex !== -1) {
              const updatedPosts = [...postArray];
              updatedPosts[postIndex] = {
                ...updatedPosts[postIndex],
                commentaires: result.commentaires,
              };
              setPostArray(updatedPosts);
            }
          };

          // Mettre à jour avec les données API
          updateWithApiData(followedPosts, setFollowedPosts);
          updateWithApiData(recommendedPosts, setRecommendedPosts);
        }
      } else {
        console.warn("⚠️ Pas de mise à jour locale, skip API call");
      }

      console.groupEnd();
    } catch (error) {
      console.error("❌ PublicationProvider - Erreur like commentaire:", error);
      // En cas d'erreur, recharger les données pour synchroniser
      await loadInitialData();
      setError("Erreur lors du like du commentaire");
    }
  };

  const toggleLikeReply = async (postId, commentId, replyId) => {
    try {
      const updateReplyLike = (postArray, setPostArray) => {
        const postIndex = postArray.findIndex(
          (post) => (post._id || post.id) === postId
        );
        if (postIndex !== -1) {
          const updatedPosts = [...postArray];
          const post = updatedPosts[postIndex];
          const commentIndex = post.commentaires.findIndex(
            (c) => c._id === commentId || c.id === commentId
          );
          if (commentIndex !== -1) {
            const comment = post.commentaires[commentIndex];
            const replyIndex = comment.replies?.findIndex(
              (r) => r._id === replyId || r.id === replyId
            );
            if (replyIndex !== -1) {
              const reply = comment.replies[replyIndex];
              const currentLikes = reply.likes || [];
              const userInfo = getCurrentUserInfo();
              const userHasLiked = currentLikes.some((like) => {
                const likeUserId =
                  like.userId?._id || like.userId?.id || like.userId;
                return likeUserId?.toString() === userInfo.id?.toString();
              });

              reply.likes = userHasLiked
                ? currentLikes.filter(
                    (like) =>
                      (
                        like.userId?._id ||
                        like.userId?.id ||
                        like.userId
                      )?.toString() !== userInfo.id?.toString()
                  )
                : [
                    ...currentLikes,
                    {
                      userId: { _id: userInfo.id, nom: userInfo.nom },
                      userType: userInfo.userType,
                      dateLike: new Date(),
                    },
                  ];

              setPostArray(updatedPosts);
              return true;
            }
          }
        }
        return false;
      };

      let updated = updateReplyLike(followedPosts, setFollowedPosts);
      if (!updated)
        updated = updateReplyLike(recommendedPosts, setRecommendedPosts);

      if (updated)
        await publicationApi.toggleLikeReply(postId, commentId, replyId);
    } catch (error) {
      await loadInitialData();
      setError("Erreur lors du like");
    }
  };

  const value = {
    followedPosts,
    recommendedPosts,
    savedPosts,
    loading,
    error,
    currentUserId,

    addPublication,
    deletePost,
    addComment,

    toggleLikePost,
    toggleSavePost,
    isPostSaved,

    getPostsByTag,
    getPostsByArtist,

    refreshData,
    loadMorePosts,
    clearAndReload,

    clearError: () => setError(null),

    setFollowedPosts,
    setRecommendedPosts,
    setSavedPosts,
    setCurrentUserId,

    addReplyToComment,
    toggleLikeComment,
    toggleLikeReply,

    utils: publicationUtils,
  };

  return (
    <PublicationContext.Provider value={value}>
      {children}
    </PublicationContext.Provider>
  );
}
