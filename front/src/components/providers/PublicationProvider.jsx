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

  // ✅ FONCTION AMÉLIORÉE: Enrichir les données avec avatars et debug
  const enrichPublicationData = (publications) => {
    console.group("🔄 enrichPublicationData - Processing");
    console.log("Input publications:", publications?.length || 0);

    if (!publications || !Array.isArray(publications)) {
      console.warn("⚠️ Publications invalides:", publications);
      console.groupEnd();
      return [];
    }

    const enriched = publications.map((publication, index) => {
      console.log(
        `📝 Publication ${index + 1}/${publications.length}:`,
        publication._id
      );

      // ✅ AMÉLIORATION: Enrichir l'auteur avec debug
      const originalAuthor = publication.idTatoueur;
      console.log("👤 Auteur original:", originalAuthor);

      const enrichedAuthor = originalAuthor
        ? {
            ...originalAuthor,
            // ✅ AMÉLIORATION: Chercher la photo dans tous les champs possibles
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

      console.log("✅ Auteur enrichi:", {
        nom: enrichedAuthor?.nom,
        photoProfil: enrichedAuthor?.photoProfil,
      });

      // ✅ AMÉLIORATION: Enrichir les commentaires avec debug
      const originalComments = publication.commentaires || [];
      console.log("💬 Commentaires originaux:", originalComments.length);

      const enrichedComments = originalComments.map((comment, commentIndex) => {
        const originalCommentUser = comment.userId;
        console.log(
          `💬 Commentaire ${commentIndex + 1} - Utilisateur original:`,
          originalCommentUser
        );

        const enrichedCommentUser = originalCommentUser
          ? {
              ...originalCommentUser,
              // ✅ AMÉLIORATION: Chercher la photo dans tous les champs possibles
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

        console.log(
          `✅ Commentaire ${commentIndex + 1} - Utilisateur enrichi:`,
          {
            nom: enrichedCommentUser?.nom,
            photoProfil: enrichedCommentUser?.photoProfil,
          }
        );

        return {
          ...comment,
          userId: enrichedCommentUser,
        };
      });

      console.log("✅ Commentaires enrichis:", enrichedComments.length);

      const enrichedPublication = {
        ...publication,
        idTatoueur: enrichedAuthor,
        commentaires: enrichedComments,
      };

      console.log("✅ Publication enrichie complète");
      return enrichedPublication;
    });

    console.log("✅ enrichPublicationData - Terminé:", enriched.length);
    console.groupEnd();
    return enriched;
  };

  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const getCurrentUser = () => {
      try {
        console.log("🔍 PublicationProvider - Initialisation utilisateur...");

        const cookies = document.cookie.split("; ");
        const tokenCookie = cookies.find((row) => row.startsWith("token="));

        if (tokenCookie) {
          const token = tokenCookie.split("=")[1];
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId =
            payload.sub || payload.userId || payload.id || payload._id;

          if (userId) {
            setCurrentUserId(userId);
            console.log("✅ PublicationProvider - User ID défini:", userId);
            return;
          }
        }

        // Fallback temporaire
        setCurrentUserId("68492f8aff76a60093ccb90b");
        console.log("⚠️ PublicationProvider - ID temporaire utilisé");
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
      console.log(
        "🚀 PublicationProvider - Chargement initial avec userId:",
        currentUserId
      );
      loadInitialData();
    }
  }, [currentUserId]);

  // ✅ FONCTION AMÉLIORÉE: loadInitialData avec enrichissement et debug
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.group("🌐 PublicationProvider - Chargement données");
      console.log("Utilisateur actuel:", currentUserId);

      // Charger les publications en parallèle
      const [followedData, recommendedData, savedData] =
        await Promise.allSettled([
          publicationApi.getFollowedPublications({ limit: 20 }),
          publicationApi.getRecommendedPublications({ limit: 20 }),
          publicationApi.getSavedPublications({ limit: 50 }),
        ]);

      // ✅ TRAITEMENT: Publications suivies
      if (followedData.status === "fulfilled") {
        const rawFollowed = followedData.value.publications || [];
        console.log("📦 Raw followed publications:", rawFollowed.length);

        // Debug de la première publication
        if (rawFollowed.length > 0) {
          console.log("🔍 Première publication suivie:", {
            id: rawFollowed[0]._id,
            auteur: rawFollowed[0].idTatoueur,
            auteurPhoto:
              rawFollowed[0].idTatoueur?.photoProfil ||
              rawFollowed[0].idTatoueur?.avatar,
          });
        }

        const enrichedFollowed = enrichPublicationData(rawFollowed);
        setFollowedPosts(enrichedFollowed);
        console.log(
          "✅ Publications suivies enrichies:",
          enrichedFollowed.length
        );
      } else {
        console.error(
          "❌ Erreur chargement publications suivies:",
          followedData.reason
        );
      }

      // ✅ TRAITEMENT: Publications recommandées
      if (recommendedData.status === "fulfilled") {
        const rawRecommended = recommendedData.value.publications || [];
        console.log("📦 Raw recommended publications:", rawRecommended.length);

        // Debug de la première publication
        if (rawRecommended.length > 0) {
          console.log("🔍 Première publication recommandée:", {
            id: rawRecommended[0]._id,
            auteur: rawRecommended[0].idTatoueur,
            auteurPhoto:
              rawRecommended[0].idTatoueur?.photoProfil ||
              rawRecommended[0].idTatoueur?.avatar,
          });
        }

        const enrichedRecommended = enrichPublicationData(rawRecommended);
        setRecommendedPosts(enrichedRecommended);
        console.log(
          "✅ Publications recommandées enrichies:",
          enrichedRecommended.length
        );
      } else {
        console.error(
          "❌ Erreur chargement publications recommandées:",
          recommendedData.reason
        );
      }

      // ✅ TRAITEMENT: Publications sauvegardées
      if (savedData.status === "fulfilled") {
        const rawSaved = savedData.value.publications || [];
        console.log("📦 Raw saved publications:", rawSaved.length);

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

          console.log("💾 Publication sauvegardée adaptée:", {
            id: adapted.id,
            username: adapted.username,
            userAvatar: adapted.userAvatar,
          });

          return adapted;
        });

        setSavedPosts(adaptedSaved);
        console.log(
          "✅ Publications sauvegardées adaptées:",
          adaptedSaved.length
        );
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

      console.log("📤 addPublication - Données:", publicationData);

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

      console.log(
        "✅ PublicationProvider - Nouvelle publication reçue:",
        newPublication
      );

      // ✅ AMÉLIORATION: Enrichir la nouvelle publication avec les infos utilisateur
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
      console.log("✅ Publication ajoutée au state local");

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
    console.log("Post ID:", postId);
    console.log("User ID:", currentUserId);

    // Appel API direct
    console.log("📡 Appel API toggleLike...");
    const result = await publicationApi.toggleLikePublication(postId);
    console.log("✅ API toggleLike result:", {
      likesCount: result.likesCount || result.likes?.length,
      likes: result.likes
    });

    // ✅ CORRECTION: Forcer le rechargement des données depuis l'API
    if (result) {
      console.log("🔄 Rechargement des données pour synchroniser...");
      
      // Recharger les données suivies
      try {
        const followedData = await publicationApi.getFollowedPublications({ limit: 20 });
        if (followedData.publications) {
          const enrichedFollowed = enrichPublicationData(followedData.publications);
          setFollowedPosts(enrichedFollowed);
          console.log("✅ followedPosts rechargés");
        }
      } catch (error) {
        console.warn("⚠️ Erreur rechargement followedPosts:", error);
      }

      // Recharger les données recommandées
      try {
        const recommendedData = await publicationApi.getRecommendedPublications({ limit: 20 });
        if (recommendedData.publications) {
          const enrichedRecommended = enrichPublicationData(recommendedData.publications);
          setRecommendedPosts(enrichedRecommended);
          console.log("✅ recommendedPosts rechargés");
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

      console.log("💾 toggleSavePost:", { postId, isAlreadySaved });

      // Mise à jour optimiste
      if (isAlreadySaved) {
        setSavedPosts((prev) =>
          prev.filter((savedPost) => savedPost.id !== postId)
        );
        console.log("➖ Post retiré des sauvegardés");
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
        console.log("➕ Post ajouté aux sauvegardés:", postToSave);
      }

      // Appel API
      await publicationApi.toggleSavePublication(postId);
      console.log("✅ API toggleSave success");
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

      console.log("🗑️ Suppression publication:", postId);
      setLoading(true);
      await publicationApi.deletePublication(postId);

      // Supprimer localement
      const removeFromArray = (postArray) =>
        postArray.filter((post) => (post._id || post.id) !== postId);

      setFollowedPosts(removeFromArray);
      setRecommendedPosts(removeFromArray);
      setSavedPosts(removeFromArray);

      console.log("✅ Publication supprimée localement");
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
      console.log("🏷️ Recherche par tag:", tag);
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
      console.log("👨‍🎨 Recherche par artiste:", artistId);
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
    console.log("🔄 Rafraîchissement des données...");
    await loadInitialData();
  };

  // Fonction pour charger plus de publications (pagination)
  const loadMorePosts = async (type = "followed", page = 2) => {
    try {
      console.log("📄 Chargement page supplémentaire:", { type, page });
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
    console.log("🧹 Nettoyage et rechargement...");
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
      console.group("👍 PublicationProvider - toggleLikeComment");
      console.log("Post ID:", postId);
      console.log("Comment ID:", commentId);
      console.log("User ID:", currentUserId);

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

            console.log("📝 Commentaire trouvé:", {
              commentIndex,
              currentLikes: currentLikes.length,
              userInfo,
            });

            const userHasLiked = currentLikes.some((like) => {
              const likeUserId =
                like.userId?._id || like.userId?.id || like.userId;
              const hasLiked =
                likeUserId?.toString() === currentUserId?.toString();
              console.log("🔍 Vérification like commentaire:", {
                likeUserId,
                currentUserId,
                hasLiked,
              });
              return hasLiked;
            });

            console.log("💡 User has liked comment:", userHasLiked);

            // Mise à jour optimiste
            if (userHasLiked) {
              // Retirer le like
              comment.likes = currentLikes.filter((like) => {
                const likeUserId =
                  like.userId?._id || like.userId?.id || like.userId;
                return likeUserId?.toString() !== currentUserId?.toString();
              });
              console.log("➖ Like commentaire retiré");
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
              console.log("➕ Like commentaire ajouté");
            }

            console.log("💾 Nouveaux likes commentaire:", comment.likes.length);
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
        console.log("📡 Appel API toggleLikeComment...");
        const result = await publicationApi.toggleLikeComment(
          postId,
          commentId
        );
        console.log("✅ API toggleLikeComment success:", result);

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

  // ✅ DEBUG: Log des états pour debugging
  useEffect(() => {
    console.log("📊 PublicationProvider State Update:", {
      followedPosts: followedPosts?.length || 0,
      recommendedPosts: recommendedPosts?.length || 0,
      savedPosts: savedPosts?.length || 0,
      loading,
      error,
      currentUserId,
    });
  }, [
    followedPosts,
    recommendedPosts,
    savedPosts,
    loading,
    error,
    currentUserId,
  ]);

  // Valeur partagée via le contexte
  const value = {
    // États
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

    addReplyToComment,
    toggleLikeComment,
    toggleLikeReply,

    // Utilitaires
    utils: publicationUtils,
  };

  return (
    <PublicationContext.Provider value={value}>
      {children}
    </PublicationContext.Provider>
  );
}
