import React, { useState, useEffect, useContext } from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Post from "./components/Post";
import FlashCard from "./components/FlashCard";
import { FlashContext } from "../../context/FlashContext";
import { PublicationContext } from "../../context/PublicationContext";

export default function Feed() {
  const [activeTab, setActiveTab] = useState("publication");
  const [followedContent, setFollowedContent] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Utilisation des contextes
  const {
    followedFlashes,
    recommendedFlashes,
    toggleLikeFlash,
    toggleSaveFlash,
    loading: flashLoading,
    error: flashError,
  } = useContext(FlashContext);

  const {
    followedPosts,
    recommendedPosts,
    toggleLikePost,
    toggleSavePost,
    // ✅ AJOUT: Récupération des fonctions de gestion des commentaires
    toggleLikeComment,
    toggleLikeReply,
    addComment,
    addReplyToComment,
    loading: postLoading,
    error: postError,
    refreshData,
    clearError,
    loadMorePosts,
    currentUserId: contextUserId, // ✅ AJOUT: Récupérer l'ID du contexte
  } = useContext(PublicationContext);

  // Fonction pour récupérer l'utilisateur
  const getCurrentUser = () => {
    try {
      // Méthode 1: localStorage 'user'
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        const user = JSON.parse(userFromStorage);
        const userId = user._id || user.id;
        if (userId) {
          return {
            id: userId,
            info: {
              ...user,
              // ✅ NORMALISER la photo de profil
              photoProfil:
                user.photoProfil || user.avatar || user.profilePicture || null,
            },
          };
        }
      }

      // Méthode 2: localStorage 'currentUser' ou autres variantes
      const altKeys = ["currentUser", "authUser", "loggedUser"];
      for (const key of altKeys) {
        const userData = localStorage.getItem(key);
        if (userData) {
          const user = JSON.parse(userData);
          const userId = user._id || user.id;
          if (userId) {
            return {
              id: userId,
              info: {
                ...user,
                // ✅ NORMALISER la photo de profil
                photoProfil:
                  user.photoProfil ||
                  user.avatar ||
                  user.profilePicture ||
                  null,
              },
            };
          }
        }
      }

      // Méthode 3: Cookies JWT
      const cookies = document.cookie.split("; ");

      const tokenCookie = cookies.find((row) => row.startsWith("token="));
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];

        try {
          // Décoder le payload JWT (partie centrale)
          const payload = JSON.parse(atob(token.split(".")[1]));

          const userId =
            payload.sub || payload.userId || payload.id || payload._id;
          if (userId) {
            return {
              id: userId,
              info: {
                id: userId,
                nom: payload.nom || payload.username || payload.name,
                email: payload.email,
                role: payload.role,
                // ✅ AJOUTER la photo de profil depuis le JWT
                photoProfil:
                  payload.photoProfil ||
                  payload.avatar ||
                  payload.profilePicture ||
                  null,
              },
            };
          }
        } catch (jwtError) {
          // Erreur silencieuse pour le décodage JWT
        }
      }

      // Méthode 4: Vérifier sessionStorage
      const sessionUser =
        sessionStorage.getItem("user") || sessionStorage.getItem("currentUser");
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        const userId = user._id || user.id;
        if (userId) {
          return {
            id: userId,
            info: {
              ...user,
              // ✅ NORMALISER la photo de profil
              photoProfil:
                user.photoProfil || user.avatar || user.profilePicture || null,
            },
          };
        }
      }

      return { id: null, info: null };
    } catch (error) {
      return { id: null, info: null };
    }
  };

  // Récupérer l'utilisateur au montage
  useEffect(() => {
    const { id, info } = getCurrentUser();
    
    // ✅ CORRECTION: Utiliser l'ID du contexte en priorité
    const finalUserId = contextUserId || id;
    const finalUserInfo = info;
    
    setCurrentUserId(finalUserId);
    setCurrentUserInfo(finalUserInfo);

    console.log('👤 Feed - User info:', {
      contextUserId,
      localId: id,
      finalUserId,
      finalUserInfo
    });

    // Pour les tests, utiliser un ID fixe si aucun utilisateur détecté
    if (!finalUserId) {
      setCurrentUserId("68492f8aff76a60093ccb90b");
      setCurrentUserInfo({
        id: "68492f8aff76a60093ccb90b",
        nom: "Test User",
        role: "tatoueur",
      });
    }
  }, [contextUserId]);

  // Afficher un message de succès si on vient de créer du contenu
  useEffect(() => {
    if (location.state?.message) {
      showNotification(location.state.message, "success");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Mettre à jour le contenu en fonction de l'onglet actif
  useEffect(() => {
    if (activeTab === "publication") {
      setFollowedContent(followedPosts);
      setRecommendedContent(recommendedPosts);
    } else {
      setFollowedContent(followedFlashes);
      setRecommendedContent(recommendedFlashes);
    }
  }, [
    activeTab,
    followedPosts,
    recommendedPosts,
    followedFlashes,
    recommendedFlashes,
  ]);

  // Fonction pour vérifier si l'utilisateur a liké avec debug
  const hasUserLiked = (likes, userId) => {
    console.log("🔍 hasUserLiked - Debug:", {
      likes,
      likesType: typeof likes,
      likesIsArray: Array.isArray(likes),
      likesLength: likes?.length,
      userId,
      userIdType: typeof userId
    });

    if (!likes || !Array.isArray(likes) || !userId) {
      console.log("⚠️ hasUserLiked - Conditions non remplies");
      return false;
    }

    const userHasLiked = likes.some((like) => {
      const likeUserId =
        like.userId?._id ||
        like.userId?.id ||
        like.userId ||
        like._id ||
        like.id;
      const normalizedLikeUserId = likeUserId?.toString();
      const normalizedCurrentUserId = userId?.toString();

      console.log("🔍 hasUserLiked - Comparaison:", {
        likeUserId,
        normalizedLikeUserId,
        normalizedCurrentUserId,
        match: normalizedLikeUserId === normalizedCurrentUserId
      });

      return normalizedLikeUserId === normalizedCurrentUserId;
    });

    console.log("💡 hasUserLiked - Résultat:", userHasLiked);
    return userHasLiked;
  };

  // Fonction pour vérifier si l'utilisateur est propriétaire
  const isUserOwner = (post, userId) => {
    if (!userId || !post?.idTatoueur) return false;

    const ownerId =
      post.idTatoueur._id || post.idTatoueur.id || post.idTatoueur;
    const isOwner = ownerId?.toString() === userId?.toString();

    return isOwner;
  };

  // ✅ CORRECTION: Fonction pour adapter les commentaires avec gestion des likes
  const adaptComments = (commentaires) => {
    if (!commentaires || !Array.isArray(commentaires)) return [];

    return commentaires.map((comment) => {
      // ✅ AJOUT: Adapter les réponses aussi
      const adaptedReplies = comment.replies ? comment.replies.map((reply) => ({
        id: reply._id || reply.id,
        username: reply.userId?.nom || reply.username || "Utilisateur",
        userAvatar: reply.userId?.photoProfil || reply.userId?.avatar || null,
        text: reply.contenu || reply.text || "",
        time: formatDate(reply.dateReponse || reply.createdAt),
        likes: reply.likes || [], // ✅ CORRECTION: Garder l'array complet
        isLiked: hasUserLiked(reply.likes, currentUserId),
      })) : [];

      return {
        id: comment._id || comment.id,
        username: comment.userId?.nom || comment.username || "Utilisateur",
        userAvatar: comment.userId?.photoProfil || comment.userId?.avatar || null,
        text: comment.contenu || comment.text || "",
        time: formatDate(comment.dateCommentaire || comment.createdAt),
        likes: comment.likes || [], // ✅ CORRECTION: Garder l'array complet pour les calculs
        isLiked: hasUserLiked(comment.likes, currentUserId),
        replies: adaptedReplies,
      };
    });
  };

  // ✅ FONCTION HELPER: Vérifier si le post est sauvegardé
  const isPostSaved = (postId) => {
    // ✅ SOLUTION TEMPORAIRE: Accéder aux savedPosts via le contexte complet
    const contextSavedPosts = React.useContext(PublicationContext)?.savedPosts || [];
    const isSaved = contextSavedPosts.some(savedPost => 
      (savedPost._id || savedPost.id) === postId
    );
    
    console.log("💾 isPostSaved - Debug:", {
      postId,
      savedPostsCount: contextSavedPosts.length,
      savedPostIds: contextSavedPosts.map(p => p._id || p.id),
      isSaved
    });
    
    return isSaved;
  };

  // ✅ CORRECTION: Fonction pour adapter les données de publication
  const adaptPostData = (post) => {
    // ✅ AJOUT: Debug des données de publication
    console.log("📦 FEED - Debug publication:", {
      postId: post._id || post.id,
      rawLikes: post.likes,
      likesLength: post.likes?.length,
      likesCount: post.likesCount,
      isLiked: hasUserLiked(post.likes, currentUserId),
      currentUserId
    });

    // ✅ CORRECTION: Utiliser les données réelles de l'API
    const likesCount = post.likesCount || post.likes?.length || 0;
    const isLiked = hasUserLiked(post.likes, currentUserId);
    const commentsCount = post.commentaires?.length || 0;
    const isSaved = isPostSaved(post._id || post.id); // ✅ CORRECTION: Vérifier si sauvegardé

    const adaptedData = {
      id: post._id || post.id,
      username: post.idTatoueur?.nom || post.username || "Utilisateur",
      userAvatar:
        post.idTatoueur?.photoProfil || post.idTatoueur?.avatar || null,
      time: formatDate(post.datePublication || post.createdAt),
      likes: likesCount, // ✅ CORRECTION: Utiliser likesCount calculé
      caption: post.contenu || "",
      comments: commentsCount,
      isLiked: isLiked, // ✅ CORRECTION: Utiliser isLiked calculé
      isSaved: isSaved, // ✅ CORRECTION: Utiliser isSaved calculé
      image: post.image,
      commentsData: adaptComments(post.commentaires),
      isOwnPost: isUserOwner(post, currentUserId),
      currentUser: currentUserInfo?.nom || "current_user",
      currentUserAvatar:
        currentUserInfo?.photoProfil || currentUserInfo?.avatar || null,
    };

    // ✅ AJOUT: Debug des données adaptées
    console.log("📦 FEED - Données adaptées:", {
      id: adaptedData.id,
      username: adaptedData.username,
      likes: adaptedData.likes, // ✅ IMPORTANT: Vérifier cette valeur
      isLiked: adaptedData.isLiked,
      isSaved: adaptedData.isSaved, // ✅ IMPORTANT: Vérifier cette valeur
      commentsData: adaptedData.commentsData.length,
    });

    return adaptedData;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes === 0 ? "À l'instant" : `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  // Fonction pour afficher les notifications
  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    const bgColor =
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Fonction pour gérer le rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "publication") {
        await refreshData();
        clearError();
        showNotification("Publications mises à jour", "success");
      } else {
        showNotification("Flashs mis à jour", "success");
      }
    } catch (error) {
      showNotification("Erreur lors de la mise à jour", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fonction pour créer du contenu
  const handleCreateContent = () => {
    if (activeTab === "publication") {
      navigate("/uploadpublication");
    } else {
      navigate("/flashupload");
    }
  };

  // Fonction pour charger plus de contenu
  const handleLoadMore = async (type) => {
    try {
      if (activeTab === "publication") {
        const currentPage =
          Math.ceil(
            (type === "followed"
              ? followedContent.length
              : recommendedContent.length) / 10
          ) + 1;
        await loadMorePosts(type, currentPage);
      }
    } catch (error) {
      showNotification("Erreur lors du chargement", "error");
    }
  };

  // ✅ CORRECTION: Fonction pour gérer le like SANS mise à jour optimiste
  const handleLikePost = async (postId) => {
    try {
      console.log('👍 Feed - handleLikePost:', { postId, currentUserId });
      
      // ✅ CORRECTION: Pas de mise à jour optimiste, laisser le contexte gérer
      await toggleLikePost(postId);
      
      console.log('✅ Feed - Like post terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur like post:', error);
      showNotification("Erreur lors du like", "error");
    }
  };

  // ✅ AJOUT: Fonction pour gérer le like de commentaire
  const handleLikeComment = async (postId, commentId) => {
    try {
      console.log('👍 Feed - handleLikeComment:', { postId, commentId, currentUserId });
      
      if (!toggleLikeComment) {
        console.error('❌ toggleLikeComment non disponible dans le contexte');
        showNotification("Fonctionnalité non disponible", "error");
        return;
      }
      
      await toggleLikeComment(postId, commentId);
      console.log('✅ Feed - Like commentaire terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur like commentaire:', error);
      showNotification("Erreur lors du like du commentaire", "error");
    }
  };

  // ✅ AJOUT: Fonction pour gérer le like de réponse
  const handleLikeReply = async (postId, commentId, replyId) => {
    try {
      console.log('👍 Feed - handleLikeReply:', { postId, commentId, replyId, currentUserId });
      
      if (!toggleLikeReply) {
        console.error('❌ toggleLikeReply non disponible dans le contexte');
        showNotification("Fonctionnalité non disponible", "error");
        return;
      }
      
      await toggleLikeReply(postId, commentId, replyId);
      console.log('✅ Feed - Like réponse terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur like réponse:', error);
      showNotification("Erreur lors du like de la réponse", "error");
    }
  };

  // ✅ AJOUT: Fonction pour gérer l'ajout de commentaire
  const handleAddComment = async (postId, commentData) => {
    try {
      console.log('💬 Feed - handleAddComment:', { postId, commentData });
      
      if (!addComment) {
        console.error('❌ addComment non disponible dans le contexte');
        showNotification("Fonctionnalité non disponible", "error");
        return;
      }
      
      await addComment(postId, commentData);
      console.log('✅ Feed - Commentaire ajouté');
    } catch (error) {
      console.error('❌ Feed - Erreur ajout commentaire:', error);
      showNotification("Erreur lors de l'ajout du commentaire", "error");
    }
  };

  // ✅ AJOUT: Fonction pour gérer l'ajout de réponse
  const handleAddReply = async (postId, commentId, replyData) => {
    try {
      console.log('💬 Feed - handleAddReply:', { postId, commentId, replyData });
      
      if (!addReplyToComment) {
        console.error('❌ addReplyToComment non disponible dans le contexte');
        showNotification("Fonctionnalité non disponible", "error");
        return;
      }
      
      await addReplyToComment(postId, commentId, replyData);
      console.log('✅ Feed - Réponse ajoutée');
    } catch (error) {
      console.error('❌ Feed - Erreur ajout réponse:', error);
      showNotification("Erreur lors de l'ajout de la réponse", "error");
    }
  };

  // Obtenir l'état de chargement actuel
  const currentLoading =
    activeTab === "publication" ? postLoading : flashLoading;
  const currentError = activeTab === "publication" ? postError : flashError;

  // Composant d'erreur
  const ErrorMessage = ({ error, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <p className="text-gray-400 text-center mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Réessayer
      </button>
    </div>
  );

  // Composant de chargement
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    </div>
  );

  // Composant pour charger plus
  const LoadMoreButton = ({ type, loading = false }) => (
    <div className="flex justify-center py-4">
      <button
        onClick={() => handleLoadMore(type)}
        disabled={loading}
        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Chargement...
          </div>
        ) : (
          "Charger plus"
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-16 bg-black text-white">
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        {/* Header avec boutons de création et rafraîchissement */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm z-10 border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">Feed</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-white p-2 rounded-full transition-colors disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw
                  size={20}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={handleCreateContent}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                title={
                  activeTab === "publication"
                    ? "Créer une publication"
                    : "Créer un flash"
                }
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${
                activeTab === "publication"
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab("publication")}
            >
              Publications ({followedPosts.length + recommendedPosts.length})
            </button>
            <button
              className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${
                activeTab === "flash"
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab("flash")}
            >
              Flashs ({followedFlashes.length + recommendedFlashes.length})
            </button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {currentError && (
          <div className="p-4">
            <ErrorMessage error={currentError} onRetry={handleRefresh} />
          </div>
        )}

        {/* Chargement initial */}
        {currentLoading &&
          followedContent.length === 0 &&
          recommendedContent.length === 0 && <LoadingSpinner />}

        {/* Contenu des tatoueurs suivis */}
        {!currentError && followedContent.length > 0 && (
          <section>
            <h2 className="p-4 text-lg font-bold">
              {activeTab === "publication"
                ? "Publications récentes"
                : "Flashs récents"}{" "}
              des tatoueurs suivis
            </h2>

            {activeTab === "publication" ? (
              <div className="mt-2">
                {followedContent.map((post) => {
                  const adaptedPost = adaptPostData(post);
                  return (
                    <Post
                      key={adaptedPost.id}
                      {...adaptedPost}
                      onLike={() => handleLikePost(adaptedPost.id)}
                      onSave={() => toggleSavePost(post)}
                      // ✅ AJOUT: Callbacks pour les fonctionnalités des commentaires
                      onLikeComment={(commentId) => handleLikeComment(adaptedPost.id, commentId)}
                      onLikeReply={(commentId, replyId) => handleLikeReply(adaptedPost.id, commentId, replyId)}
                      onAddComment={(commentData) => handleAddComment(adaptedPost.id, commentData)}
                      onAddReply={(commentId, replyData) => handleAddReply(adaptedPost.id, commentId, replyData)}
                    />
                  );
                })}
                {followedContent.length >= 10 && (
                  <LoadMoreButton type="followed" loading={currentLoading} />
                )}
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {followedContent.map((flash) => (
                  <FlashCard
                    key={flash.id}
                    {...flash}
                    onLike={() => toggleLikeFlash(flash.id)}
                    onSave={() => toggleSaveFlash(flash)}
                  />
                ))}
                {followedContent.length >= 10 && (
                  <LoadMoreButton type="followed" loading={currentLoading} />
                )}
              </div>
            )}
          </section>
        )}

        {/* Contenu recommandé */}
        {!currentError && recommendedContent.length > 0 && (
          <section className="mt-8">
            <h2 className="p-4 text-lg font-bold">
              {activeTab === "publication"
                ? "Publications recommandées"
                : "Flashs recommandés"}
            </h2>

            {activeTab === "publication" ? (
              <div className="mt-2">
                {recommendedContent.map((post) => {
                  const adaptedPost = adaptPostData(post);
                  return (
                    <Post
                      key={adaptedPost.id}
                      {...adaptedPost}
                      onLike={() => handleLikePost(adaptedPost.id)}
                      onSave={() => toggleSavePost(post)}
                      // ✅ AJOUT: Callbacks pour les fonctionnalités des commentaires
                      onLikeComment={(commentId) => handleLikeComment(adaptedPost.id, commentId)}
                      onLikeReply={(commentId, replyId) => handleLikeReply(adaptedPost.id, commentId, replyId)}
                      onAddComment={(commentData) => handleAddComment(adaptedPost.id, commentData)}
                      onAddReply={(commentId, replyData) => handleAddReply(adaptedPost.id, commentId, replyData)}
                    />
                  );
                })}
                {recommendedContent.length >= 10 && (
                  <LoadMoreButton type="recommended" loading={currentLoading} />
                )}
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {recommendedContent.map((flash) => (
                  <FlashCard
                    key={flash.id}
                    {...flash}
                    onLike={() => toggleLikeFlash(flash.id)}
                    onSave={() => toggleSaveFlash(flash)}
                  />
                ))}
                {recommendedContent.length >= 10 && (
                  <LoadMoreButton type="recommended" loading={currentLoading} />
                )}
              </div>
            )}
          </section>
        )}

        {/* État vide */}
        {!currentError &&
          !currentLoading &&
          followedContent.length === 0 &&
          recommendedContent.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                {`Aucun${
                  activeTab === "publication" ? "e publication" : " flash"
                } disponible`}
              </div>
              <p className="text-gray-500 text-sm mb-6">
                {activeTab === "publication"
                  ? "Suivez des tatoueurs pour voir leurs publications ici"
                  : "Suivez des tatoueurs pour voir leurs flashs ici"}
              </p>
              <button
                onClick={handleCreateContent}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                {activeTab === "publication"
                  ? "Créer votre première publication"
                  : "Créer votre premier flash"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}