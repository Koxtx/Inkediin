import React, { useState, useEffect, useContext } from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Post from "./components/Post";
import FlashCard from "./components/FlashCard";
import { FlashContext } from "../../context/FlashContext";
import { PublicationContext } from "../../context/PublicationContext";
import { AuthContext } from "../../context/AuthContext"; // ✅ AJOUT: Import du contexte Auth

export default function Feed() {
  const [activeTab, setActiveTab] = useState("publication");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Utilisation du contexte Auth pour vérifier le type d'utilisateur
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};

  // ✅ Vérifier si l'utilisateur est un tatoueur
  const isTatoueur = user?.userType === 'tatoueur';

  // ✅ Utilisation des contextes avec vérification d'existence
  const flashContext = useContext(FlashContext);
  const publicationContext = useContext(PublicationContext);

  // ✅ Extraction des données Flash avec fallbacks
  const {
    followedFlashes = [],
    recommendedFlashes = [],
    loading: flashLoading = false,
    error: flashError = null,
    hasMore: flashHasMore = false,
    currentUserId: flashCurrentUserId = null,
    toggleLikeFlash,
    toggleSaveFlash,
    loadMoreFlashes,
    refreshData: refreshFlashData,
    clearError: clearFlashError,
  } = flashContext || {};

  // ✅ Extraction des données Publication avec fallbacks
  const {
    followedPosts = [],
    recommendedPosts = [],
    savedPosts = [],
    toggleLikePost,
    toggleSavePost,
    toggleLikeComment,
    toggleLikeReply,
    addComment,
    addReplyToComment,
    loading: postLoading = false,
    error: postError = null,
    refreshData: refreshPostData,
    clearError: clearPostError,
    loadMorePosts,
    currentUserId: postCurrentUserId = null,
  } = publicationContext || {};

  // ✅ Utiliser l'ID utilisateur disponible
  const currentUserId = flashCurrentUserId || postCurrentUserId || user?._id || user?.id;

  // ✅ Debug des contextes
  useEffect(() => {
    console.log("🔍 Feed - Debug contextes:", {
      flashContext: !!flashContext,
      publicationContext: !!publicationContext,
      authContext: !!authContext,
      userType: user?.userType,
      isTatoueur,
      followedFlashes: followedFlashes?.length || 0,
      recommendedFlashes: recommendedFlashes?.length || 0,
      followedPosts: followedPosts?.length || 0,
      recommendedPosts: recommendedPosts?.length || 0,
      currentUserId,
      flashLoading,
      postLoading,
      flashError,
      postError
    });
  }, [
    flashContext, 
    publicationContext, 
    authContext,
    user,
    isTatoueur,
    followedFlashes, 
    recommendedFlashes, 
    followedPosts, 
    recommendedPosts, 
    currentUserId,
    flashLoading,
    postLoading,
    flashError,
    postError
  ]);

  // ✅ Afficher un message de succès si on vient de créer du contenu
  useEffect(() => {
    if (location.state?.message) {
      showNotification(location.state.message, "success");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Fonction pour afficher les notifications
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

  // ✅ Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";

    try {
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
    } catch (error) {
      console.error("Erreur formatage date:", error);
      return "Date inconnue";
    }
  };

  // ✅ Fonction pour vérifier si l'utilisateur a liké (pour les posts)
  const hasUserLiked = (likes, userId) => {
    if (!likes || !Array.isArray(likes) || !userId) {
      return false;
    }

    return likes.some((like) => {
      const likeUserId =
        like.userId?._id ||
        like.userId?.id ||
        like.userId ||
        like._id ||
        like.id;
      const normalizedLikeUserId = likeUserId?.toString();
      const normalizedCurrentUserId = userId?.toString();

      return normalizedLikeUserId === normalizedCurrentUserId;
    });
  };

  // ✅ Fonction pour vérifier si l'utilisateur est propriétaire
  const isUserOwner = (post, userId) => {
    if (!userId || !post?.idTatoueur) return false;

    const ownerId =
      post.idTatoueur._id || post.idTatoueur.id || post.idTatoueur;
    const isOwner = ownerId?.toString() === userId?.toString();

    return isOwner;
  };

  // ✅ Fonction pour adapter les commentaires
  const adaptComments = (commentaires) => {
    if (!commentaires || !Array.isArray(commentaires)) return [];

    return commentaires.map((comment) => {
      const adaptedReplies = comment.replies ? comment.replies.map((reply) => ({
        id: reply._id || reply.id,
        username: reply.userId?.nom || reply.username || "Utilisateur",
        userAvatar: reply.userId?.photoProfil || reply.userId?.avatar || null,
        text: reply.contenu || reply.text || "",
        time: formatDate(reply.dateReponse || reply.createdAt),
        likes: reply.likes || [],
        isLiked: hasUserLiked(reply.likes, currentUserId),
      })) : [];

      return {
        id: comment._id || comment.id,
        username: comment.userId?.nom || comment.username || "Utilisateur",
        userAvatar: comment.userId?.photoProfil || comment.userId?.avatar || null,
        text: comment.contenu || comment.text || "",
        time: formatDate(comment.dateCommentaire || comment.createdAt),
        likes: comment.likes || [],
        isLiked: hasUserLiked(comment.likes, currentUserId),
        replies: adaptedReplies,
      };
    });
  };

  // ✅ Fonction pour vérifier si le post est sauvegardé
  const isPostSaved = (postId) => {
    if (!savedPosts || !Array.isArray(savedPosts)) return false;
    return savedPosts.some(savedPost => 
      (savedPost._id || savedPost.id) === postId
    );
  };

  // ✅ Fonction pour adapter les données de publication
  const adaptPostData = (post) => {
    const likesCount = post.likesCount || post.likes?.length || 0;
    const isLiked = hasUserLiked(post.likes, currentUserId);
    const commentsCount = post.commentaires?.length || 0;
    const isSaved = isPostSaved(post._id || post.id);

    return {
      id: post._id || post.id,
      username: post.idTatoueur?.nom || post.username || "Utilisateur",
      userAvatar: post.idTatoueur?.photoProfil || post.idTatoueur?.avatar || null,
      time: formatDate(post.datePublication || post.createdAt),
      likes: likesCount,
      caption: post.contenu || "",
      comments: commentsCount,
      isLiked: isLiked,
      isSaved: isSaved,
      image: post.image,
      commentsData: adaptComments(post.commentaires),
      isOwnPost: isUserOwner(post, currentUserId),
      currentUser: "current_user",
      currentUserAvatar: null,
    };
  };

  // ✅ Fonction pour gérer le rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "publication") {
        if (refreshPostData) {
          await refreshPostData();
        }
        if (clearPostError) {
          clearPostError();
        }
        showNotification("Publications mises à jour", "success");
      } else {
        if (refreshFlashData) {
          await refreshFlashData();
        }
        if (clearFlashError) {
          clearFlashError();
        }
        showNotification("Flashs mis à jour", "success");
      }
    } catch (error) {
      console.error("Erreur rafraîchissement:", error);
      showNotification("Erreur lors de la mise à jour", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ Fonction pour créer du contenu (uniquement pour les tatoueurs)
  const handleCreateContent = () => {
    if (!isTatoueur) {
      showNotification("Cette fonctionnalité est réservée aux tatoueurs", "error");
      return;
    }

    if (activeTab === "publication") {
      navigate("/uploadpublication");
    } else {
      navigate("/flashupload");
    }
  };

  // ✅ Fonction pour charger plus de contenu
  const handleLoadMore = async (type) => {
    try {
      if (activeTab === "publication") {
        if (loadMorePosts) {
          const currentPage = Math.ceil(
            (type === "followed" ? followedPosts.length : recommendedPosts.length) / 10
          ) + 1;
          await loadMorePosts(type, currentPage);
        }
      } else {
        if (loadMoreFlashes) {
          await loadMoreFlashes();
        }
      }
    } catch (error) {
      console.error("Erreur load more:", error);
      showNotification("Erreur lors du chargement", "error");
    }
  };

  // ✅ Fonction pour gérer le like FLASH
  const handleLikeFlash = async (flashId) => {
    if (!toggleLikeFlash) {
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('👍 Feed - handleLikeFlash:', { flashId, currentUserId });
      await toggleLikeFlash(flashId);
      console.log('✅ Feed - Like flash terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur like flash:', error);
      showNotification("Erreur lors du like", "error");
    }
  };

  // ✅ Fonction pour gérer la sauvegarde FLASH
  const handleSaveFlash = async (flash) => {
    if (!toggleSaveFlash) {
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('💾 Feed - handleSaveFlash:', flash._id || flash.id);
      await toggleSaveFlash(flash);
      console.log('✅ Feed - Save flash terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur save flash:', error);
      showNotification("Erreur lors de la sauvegarde", "error");
    }
  };

  // ✅ Fonction pour gérer le like POST
  const handleLikePost = async (postId) => {
    if (!toggleLikePost) {
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('👍 Feed - handleLikePost:', { postId, currentUserId });
      await toggleLikePost(postId);
      console.log('✅ Feed - Like post terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur like post:', error);
      showNotification("Erreur lors du like", "error");
    }
  };

  // ✅ Fonction pour gérer la sauvegarde POST
  const handleSavePost = async (post) => {
    if (!toggleSavePost) {
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('💾 Feed - handleSavePost:', post._id || post.id);
      await toggleSavePost(post);
      console.log('✅ Feed - Save post terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur save post:', error);
      showNotification("Erreur lors de la sauvegarde", "error");
    }
  };

  // ✅ Fonction pour gérer le like de commentaire
  const handleLikeComment = async (postId, commentId) => {
    if (!toggleLikeComment) {
      console.error('❌ toggleLikeComment non disponible dans le contexte');
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('👍 Feed - handleLikeComment:', { postId, commentId, currentUserId });
      await toggleLikeComment(postId, commentId);
      console.log('✅ Feed - Like commentaire terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur like commentaire:', error);
      showNotification("Erreur lors du like du commentaire", "error");
    }
  };

  // ✅ Fonction pour gérer le like de réponse
  const handleLikeReply = async (postId, commentId, replyId) => {
    if (!toggleLikeReply) {
      console.error('❌ toggleLikeReply non disponible dans le contexte');
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('👍 Feed - handleLikeReply:', { postId, commentId, replyId, currentUserId });
      await toggleLikeReply(postId, commentId, replyId);
      console.log('✅ Feed - Like réponse terminé');
    } catch (error) {
      console.error('❌ Feed - Erreur like réponse:', error);
      showNotification("Erreur lors du like de la réponse", "error");
    }
  };

  // ✅ Fonction pour gérer l'ajout de commentaire
  const handleAddComment = async (postId, commentData) => {
    if (!addComment) {
      console.error('❌ addComment non disponible dans le contexte');
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('💬 Feed - handleAddComment:', { postId, commentData });
      await addComment(postId, commentData);
      console.log('✅ Feed - Commentaire ajouté');
    } catch (error) {
      console.error('❌ Feed - Erreur ajout commentaire:', error);
      showNotification("Erreur lors de l'ajout du commentaire", "error");
    }
  };

  // ✅ Fonction pour gérer l'ajout de réponse
  const handleAddReply = async (postId, commentId, replyData) => {
    if (!addReplyToComment) {
      console.error('❌ addReplyToComment non disponible dans le contexte');
      showNotification("Fonctionnalité non disponible", "error");
      return;
    }

    try {
      console.log('💬 Feed - handleAddReply:', { postId, commentId, replyData });
      await addReplyToComment(postId, commentId, replyData);
      console.log('✅ Feed - Réponse ajoutée');
    } catch (error) {
      console.error('❌ Feed - Erreur ajout réponse:', error);
      showNotification("Erreur lors de l'ajout de la réponse", "error");
    }
  };

  // ✅ Obtenir l'état de chargement actuel
  const currentLoading = activeTab === "publication" ? postLoading : flashLoading;
  const currentError = activeTab === "publication" ? postError : flashError;
  const currentContent = activeTab === "publication" 
    ? { followed: followedPosts, recommended: recommendedPosts }
    : { followed: followedFlashes, recommended: recommendedFlashes };

  // ✅ Vérifier si les contextes sont chargés
  if (!flashContext || !publicationContext) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des contextes...</p>
          <p className="text-gray-500 text-sm mt-2">
            Flash: {flashContext ? "✅" : "❌"} | Publication: {publicationContext ? "✅" : "❌"}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Composant d'erreur
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

  // ✅ Composant de chargement
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    </div>
  );

  // ✅ Composant pour charger plus
  const LoadMoreButton = ({ type, loading = false }) => (
    <div className="flex justify-center py-4">
      <button
        onClick={() => handleLoadMore(type)}
        disabled={loading || (activeTab === "flash" && !flashHasMore)}
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
              {/* ✅ MODIFICATION: Bouton + visible uniquement pour les tatoueurs */}
              {isTatoueur && (
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
              )}
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
          currentContent.followed.length === 0 &&
          currentContent.recommended.length === 0 && <LoadingSpinner />}

        {/* Contenu des tatoueurs suivis */}
        {!currentError && currentContent.followed.length > 0 && (
          <section>
            <h2 className="p-4 text-lg font-bold">
              {activeTab === "publication"
                ? "Publications récentes"
                : "Flashs récents"}{" "}
              des tatoueurs suivis
            </h2>

            {activeTab === "publication" ? (
              <div className="mt-2">
                {currentContent.followed.map((post) => {
                  const adaptedPost = adaptPostData(post);
                  return (
                    <Post
                      key={adaptedPost.id}
                      {...adaptedPost}
                      onLike={() => handleLikePost(adaptedPost.id)}
                      onSave={() => handleSavePost(post)}
                      onLikeComment={(commentId) => handleLikeComment(adaptedPost.id, commentId)}
                      onLikeReply={(commentId, replyId) => handleLikeReply(adaptedPost.id, commentId, replyId)}
                      onAddComment={(commentData) => handleAddComment(adaptedPost.id, commentData)}
                      onAddReply={(commentId, replyData) => handleAddReply(adaptedPost.id, commentId, replyData)}
                    />
                  );
                })}
                {currentContent.followed.length >= 10 && (
                  <LoadMoreButton type="followed" loading={currentLoading} />
                )}
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {currentContent.followed.map((flash) => (
                  <FlashCard
                    key={flash._id || flash.id}
                    {...flash}
                    currentUserId={currentUserId}
                    onLike={() => handleLikeFlash(flash._id || flash.id)}
                    onSave={() => handleSaveFlash(flash)}
                  />
                ))}
                {(currentContent.followed.length >= 10 && flashHasMore) && (
                  <LoadMoreButton type="followed" loading={currentLoading} />
                )}
              </div>
            )}
          </section>
        )}

        {/* Contenu recommandé */}
        {!currentError && currentContent.recommended.length > 0 && (
          <section className="mt-8">
            <h2 className="p-4 text-lg font-bold">
              {activeTab === "publication"
                ? "Publications recommandées"
                : "Flashs recommandés"}
            </h2>

            {activeTab === "publication" ? (
              <div className="mt-2">
                {currentContent.recommended.map((post) => {
                  const adaptedPost = adaptPostData(post);
                  return (
                    <Post
                      key={adaptedPost.id}
                      {...adaptedPost}
                      onLike={() => handleLikePost(adaptedPost.id)}
                      onSave={() => handleSavePost(post)}
                      onLikeComment={(commentId) => handleLikeComment(adaptedPost.id, commentId)}
                      onLikeReply={(commentId, replyId) => handleLikeReply(adaptedPost.id, commentId, replyId)}
                      onAddComment={(commentData) => handleAddComment(adaptedPost.id, commentData)}
                      onAddReply={(commentId, replyData) => handleAddReply(adaptedPost.id, commentId, replyData)}
                    />
                  );
                })}
                {currentContent.recommended.length >= 10 && (
                  <LoadMoreButton type="recommended" loading={currentLoading} />
                )}
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {currentContent.recommended.map((flash) => (
                  <FlashCard
                    key={flash._id || flash.id}
                    {...flash}
                    currentUserId={currentUserId}
                    onLike={() => handleLikeFlash(flash._id || flash.id)}
                    onSave={() => handleSaveFlash(flash)}
                  />
                ))}
                {(currentContent.recommended.length >= 10 && flashHasMore) && (
                  <LoadMoreButton type="recommended" loading={currentLoading} />
                )}
              </div>
            )}
          </section>
        )}

        {/* État vide */}
        {!currentError &&
          !currentLoading &&
          currentContent.followed.length === 0 &&
          currentContent.recommended.length === 0 && (
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
              {/* ✅ MODIFICATION: Bouton création uniquement pour les tatoueurs */}
              {isTatoueur && (
                <button
                  onClick={handleCreateContent}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {activeTab === "publication"
                    ? "Créer votre première publication"
                    : "Créer votre premier flash"}
                </button>
              )}
              {/* ✅ AJOUT: Message pour les clients */}
              {!isTatoueur && (
                <p className="text-gray-600 text-sm italic">
                  Seuls les tatoueurs peuvent créer du contenu
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  );
}