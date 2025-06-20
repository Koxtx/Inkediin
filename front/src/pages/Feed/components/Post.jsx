import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share,
  MoreVertical,
  Flag,
  Trash2,
  X,
  Edit,
} from "lucide-react";
import { FlashContext } from "../../../context/FlashContext";
import { PublicationContext } from "../../../context/PublicationContext";

export default function Post({
  id,
  username,
  userAvatar,
  time,
  likes,
  caption,
  comments,
  isLiked,
  isSaved,
  image,
  isOwnPost = false,
  commentsData = [],
  currentUser = "current_user",
  currentUserAvatar,
  onLike,
  onSave,
  // ✅ AJOUT: Nouveaux callbacks pour les commentaires
  onLikeComment,
  onLikeReply,
  onAddComment,
  onAddReply,
}) {
  const { toggleLikePost } = useContext(FlashContext);
  const {
    deletePost,
    addComment,
    addReplyToComment,
    toggleLikeComment,
    toggleLikeReply,
    currentUserId, // ✅ AJOUT: Récupérer l'ID utilisateur du contexte
  } = useContext(PublicationContext);

  // ✅ CORRECTION: États locaux initialisés correctement
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [localComments, setLocalComments] = useState(commentsData);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsSaved, setLocalIsSaved] = useState(isSaved);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  // ✅ CORRECTION: Fonction pour vérifier si l'utilisateur a liké
  const checkIfUserLiked = (likesArray) => {
    if (!likesArray || !Array.isArray(likesArray) || !currentUserId) return false;
    
    return likesArray.some(like => {
      const likeUserId = like.userId?._id || like.userId?.id || like.userId;
      return likeUserId?.toString() === currentUserId?.toString();
    });
  };

  // ✅ CORRECTION: Fonction pour compter les likes
  const getLikesCount = (likesArray) => {
    return likesArray && Array.isArray(likesArray) ? likesArray.length : 0;
  };

  // ✅ CORRECTION: Mettre à jour les états locaux quand les props changent
  useEffect(() => {
    console.log('🔄 Post - Mise à jour des props:', {
      id,
      likes: likes, // ✅ IMPORTANT: likes vient des props
      commentsData: commentsData?.length || 0,
      currentUserId,
      isLiked: isLiked // ✅ IMPORTANT: isLiked vient des props
    });

    // ✅ CORRECTION: Toujours mettre à jour avec les props
    setLocalLikes(likes || 0);
    setLocalIsLiked(isLiked || false);

    // Mettre à jour les commentaires
    if (commentsData !== undefined) {
      setLocalComments(commentsData);
    }

    // Mettre à jour l'état sauvegardé
    if (isSaved !== undefined) {
      setLocalIsSaved(isSaved);
    }
  }, [likes, isLiked, commentsData, isSaved, currentUserId]); // ✅ AJOUT: likes et isLiked dans les dépendances

  // ✅ CORRECTION: handleCommentLike utilisant les callbacks du Feed
  const handleCommentLike = async (
    commentId,
    isReply = false,
    parentCommentId = null,
    replyId = null
  ) => {
    try {
      console.log('👍 Post - handleCommentLike:', { 
        commentId, 
        isReply, 
        parentCommentId, 
        replyId,
        currentUserId
      });
      
      if (isReply && parentCommentId && replyId) {
        // Like d'une réponse - utiliser le callback du Feed
        if (onLikeReply) {
          await onLikeReply(parentCommentId, replyId);
          console.log('✅ Post - Like réponse via callback');
        } else if (toggleLikeReply) {
          await toggleLikeReply(id, parentCommentId, replyId);
          console.log('✅ Post - Like réponse via contexte');
        }
      } else {
        // Like d'un commentaire principal - utiliser le callback du Feed
        if (onLikeComment) {
          await onLikeComment(commentId);
          console.log('✅ Post - Like commentaire via callback');
        } else if (toggleLikeComment) {
          await toggleLikeComment(id, commentId);
          console.log('✅ Post - Like commentaire via contexte');
        } else {
          console.warn('⚠️ Aucune fonction de like commentaire disponible');
        }
      }
    } catch (error) {
      console.error("❌ Erreur handleCommentLike:", error);
      alert('Erreur lors du like. Veuillez réessayer.');
    }
  };

  // ✅ CORRECTION: handleAddReply utilisant les callbacks du Feed
  const handleAddReply = async (commentId) => {
    if (replyText.trim()) {
      try {
        console.log('💬 Post - handleAddReply:', { commentId, replyText });
        
        const replyData = {
          contenu: replyText.trim(),
          userId: currentUserId || "current_user",
          userType: "Tatoueur",
        };

        // Utiliser le callback du Feed en priorité
        if (onAddReply) {
          await onAddReply(commentId, replyData);
          console.log('✅ Post - Réponse ajoutée via callback');
        } else if (addReplyToComment) {
          await addReplyToComment(id, commentId, replyData);
          console.log('✅ Post - Réponse ajoutée via contexte');
        } else {
          console.warn('⚠️ Aucune fonction d\'ajout de réponse disponible');
        }
        
        setReplyText("");
        setReplyingTo(null);
      } catch (error) {
        console.error("❌ Erreur handleAddReply:", error);
        alert('Erreur lors de l\'ajout de la réponse. Veuillez réessayer.');
      }
    }
  };

  // ✅ FONCTION AMÉLIORÉE: Gestion des URLs Cloudinary et base64
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) {
      console.log("⚠️ getProfileImageUrl - Pas d'image fournie");
      return null;
    }

    console.log("🔍 getProfileImageUrl - Input:", imagePath);

    // Si c'est déjà une URL Cloudinary complète
    if (imagePath.startsWith("https://res.cloudinary.com")) {
      console.log("✅ URL Cloudinary détectée:", imagePath);
      return imagePath;
    }

    // Si c'est du base64, retourner tel quel
    if (imagePath.startsWith("data:image")) {
      console.log("✅ Image base64 détectée");
      return imagePath;
    }

    // Si l'image commence par http/https, c'est déjà une URL complète
    if (imagePath.startsWith("http")) {
      console.log("✅ URL HTTP détectée:", imagePath);
      return imagePath;
    }

    // ✅ NOUVEAU: Gérer les IDs Cloudinary sans préfixe
    if (imagePath && !imagePath.includes("/") && !imagePath.includes("\\")) {
      // C'est probablement un ID Cloudinary - remplacez YOUR_CLOUD_NAME par votre nom Cloudinary
      const cloudinaryUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/f_auto,q_auto,w_150,h_150,c_fill,g_face/${imagePath}`;
      console.log("🔄 ID Cloudinary transformé:", cloudinaryUrl);
      return cloudinaryUrl;
    }

    // Fallback pour les anciennes images locales
    const baseUrl = "http://localhost:3000";
    const cleanPath = imagePath.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    const fallbackUrl = `${baseUrl}${finalPath}`;

    console.log("⚠️ Fallback URL:", fallbackUrl);
    return fallbackUrl;
  };

  // ✅ FONCTION AMÉLIORÉE: Gestion des images de publication Cloudinary
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    console.log("🖼️ getImageUrl - Input:", imagePath);

    // Si c'est déjà une URL Cloudinary complète
    if (imagePath.startsWith("https://res.cloudinary.com")) {
      console.log("✅ URL Cloudinary publication détectée");
      return imagePath;
    }

    // Si l'image commence par http, c'est déjà une URL complète
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // ✅ NOUVEAU: Gérer les IDs Cloudinary pour les publications
    if (imagePath && !imagePath.includes("/") && !imagePath.includes("\\")) {
      const cloudinaryUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/f_auto,q_auto/${imagePath}`;
      console.log("🔄 ID Cloudinary publication transformé:", cloudinaryUrl);
      return cloudinaryUrl;
    }

    // Fallback pour les anciennes images locales
    const baseUrl = "http://localhost:3000";
    const cleanPath = imagePath.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    return `${baseUrl}${finalPath}`;
  };

  // ✅ COMPOSANT AMÉLIORÉ: ProfileImage avec meilleur debug et gestion d'erreur
  const ProfileImage = ({ avatar, username, size = "w-10 h-10" }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoading, setImgLoading] = useState(!!avatar);

    const handleImageLoad = () => {
      console.log("✅ Image chargée avec succès:", avatar);
      setImgLoading(false);
      setImgError(false);
    };

    const handleImageError = (error) => {
      console.error("❌ Erreur chargement image profil:", {
        avatar,
        error: error.target?.error,
        src: error.target?.src,
      });
      setImgLoading(false);
      setImgError(true);
    };

    const imageUrl = getProfileImageUrl(avatar);
    console.log("🔗 URL finale pour ProfileImage:", imageUrl);

    return (
      <div
        className={`${size} rounded-full overflow-hidden bg-gray-600 flex-shrink-0 relative`}
      >
        {imageUrl && !imgError ? (
          <>
            {imgLoading && (
              <div className="absolute inset-0 bg-gray-400 animate-pulse rounded-full" />
            )}
            <img
              src={imageUrl}
              alt={`Photo de profil de ${username}`}
              className={`w-full h-full object-cover transition-opacity ${
                imgLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
            {username?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  // ✅ CORRECTION: handleLike simplifié - déléguer au Feed
  const handleLike = async () => {
    try {
      console.log('👍 Post - handleLike:', {
        postId: id,
        currentUserId,
        hasCallback: !!onLike
      });

      // ✅ PRIORITÉ: Utiliser le callback du Feed si disponible
      if (onLike) {
        console.log('📡 Post - Utilisation callback Feed...');
        await onLike();
        console.log('✅ Post - Callback Feed terminé');
        return;
      }

      // ✅ FALLBACK: Utiliser le contexte directement
      if (toggleLikePost) {
        console.log('📡 Post - Utilisation contexte...');
        await toggleLikePost(id);
        console.log('✅ Post - Contexte terminé');
        return;
      }

      console.warn('⚠️ Aucune méthode de like disponible');
    } catch (error) {
      console.error('❌ Post - Erreur handleLike:', error);
      alert('Erreur lors du like. Veuillez réessayer.');
    }
  };

  const handleSave = () => {
    setLocalIsSaved(!localIsSaved);

    // Utiliser le callback du Feed si disponible
    if (onSave) {
      onSave();
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        console.log('💬 Post - handleAddComment:', { newComment, currentUserId });
        
        const commentData = {
          userId: currentUserId || "current_user",
          userType: "Tatoueur",
          username: currentUser,
          contenu: newComment.trim(),
        };

        // ✅ CORRECTION: Utiliser le callback du Feed en priorité
        if (onAddComment) {
          await onAddComment(commentData);
          console.log('✅ Post - Commentaire ajouté via callback');
        } else if (addComment) {
          await addComment(id, commentData);
          console.log('✅ Post - Commentaire ajouté via contexte');
        } else {
          console.warn('⚠️ Aucune fonction d\'ajout de commentaire disponible');
          // Fallback: mise à jour locale
          const comment = {
            id: Date.now(),
            username: currentUser,
            userAvatar: currentUserAvatar,
            text: newComment.trim(),
            time: "maintenant",
            likes: [],
            isLiked: false,
            replies: [],
          };
          setLocalComments((prev) => [...prev, comment]);
        }
        
        setNewComment("");
      } catch (error) {
        console.error("❌ Erreur handleAddComment:", error);
        alert('Erreur lors de l\'ajout du commentaire. Veuillez réessayer.');
      }
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      setLocalComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
    }
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
      setLocalComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.filter(
                  (reply) => reply.id !== replyId
                ),
              }
            : comment
        )
      );
    }
  };

  const handleDeletePost = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
      if (deletePost) {
        deletePost(id);
      }
      setShowMenu(false);
    }
  };

  const handleEditPost = () => {
    // Fonction pour éditer le post (à implémenter)
    alert("Fonctionnalité d'édition à venir");
    setShowMenu(false);
  };

  const handleReportPost = () => {
    alert("Post signalé aux modérateurs");
    setShowMenu(false);
  };

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // ✅ CORRECTION: Calculer le nombre total de commentaires + réponses
  const totalCommentsCount = localComments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  );

  return (
    <article className="mb-6 border-b border-gray-700">
      <div className="flex items-center p-4">
        {/* Photo de profil de l'auteur du post */}
        <div className="mr-3">
          <ProfileImage
            avatar={userAvatar}
            username={username}
          />
        </div>
        <div className="flex-1">
          <div className="font-bold">{username}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            className="text-xl text-gray-500 hover:text-white transition-colors p-1"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
              {isOwnPost ? (
                <>
                  <button
                    onClick={handleEditPost}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-blue-400 hover:text-blue-300"
                  >
                    <Edit size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </>
              ) : (
                <button
                  onClick={handleReportPost}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-yellow-400 hover:text-yellow-300"
                >
                  <Flag size={16} />
                  Signaler
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zone d'image avec gestion d'erreur Cloudinary améliorée */}
      <div className="w-full aspect-square bg-gray-700 relative overflow-hidden">
        {image && !imageError ? (
          <img
            src={getImageUrl(image)}
            alt={`Publication de ${username}`}
            className="w-full h-full object-cover"
            onError={() => {
              console.warn(`❌ Erreur chargement image publication: ${image}`);
              setImageError(true);
            }}
            onLoad={() => {
              console.log(`✅ Image publication chargée: ${image}`);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            {imageError ? (
              <div className="text-center">
                <div className="text-sm">Image non disponible</div>
                <div className="text-xs mt-1 text-gray-600">
                  {image && `Chemin: ${image.substring(0, 50)}...`}
                </div>
              </div>
            ) : (
              <div className="text-sm">Aucune image</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center p-4">
        <button
          className="mr-4 text-xl hover:scale-110 transition-transform"
          onClick={handleLike}
        >
          <Heart
            fill={localIsLiked ? "#ef4444" : "none"}
            color={localIsLiked ? "#ef4444" : "currentColor"}
          />
        </button>
        <button
          className="mr-4 text-xl hover:scale-110 transition-transform"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle />
        </button>
        <button
          className="ml-auto text-xl hover:scale-110 transition-transform"
          onClick={handleSave}
        >
          <Bookmark
            fill={localIsSaved ? "#ef4444" : "none"}
            color={localIsSaved ? "#ef4444" : "currentColor"}
          />
        </button>
      </div>

      <div className="px-4 mb-1 text-sm font-bold">{localLikes} j'aime</div>

      <div className="px-4 text-sm leading-relaxed">
        <span className="font-bold">{username}</span> {caption}
      </div>

      <button
        className="p-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        onClick={() => setShowComments(!showComments)}
      >
        Voir les {totalCommentsCount} commentaires
      </button>

      {showComments && (
        <div className="border-t border-gray-700 bg-gray-800/50">
          {/* Zone des commentaires */}
          <div className="max-h-80 overflow-y-auto">
            {localComments.map((comment) => (
              <div key={comment.id || comment._id} className="border-b border-gray-700/50">
                {/* Commentaire principal */}
                <div className="flex items-start p-4">
                  {/* Photo de profil du commentateur */}
                  <div className="mr-3">
                    <ProfileImage
                      avatar={
                        comment.userAvatar ||
                        comment.userId?.photoProfil ||
                        comment.userId?.avatar ||
                        comment.userId?.profilePicture
                      }
                      username={
                        comment.username ||
                        comment.userId?.nom ||
                        comment.userId?.name ||
                        comment.userId?.username ||
                        "Utilisateur"
                      }
                      size="w-8 h-8"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-bold mr-2">
                        {comment.username ||
                          comment.userId?.nom ||
                          "Utilisateur"}
                      </span>
                      {comment.text || comment.contenu}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500 gap-4">
                      <span>{comment.time}</span>
                      <span>{getLikesCount(comment.likes)} j'aime</span>

                      <button
                        onClick={() => handleCommentLike(comment.id || comment._id)}
                        className={`hover:text-red-400 transition-colors ${
                          checkIfUserLiked(comment.likes) ? "text-red-400" : ""
                        }`}
                      >
                        J'aime
                      </button>
                      <button
                        onClick={() => setReplyingTo(comment.id || comment._id)}
                        className="hover:text-blue-400 transition-colors"
                      >
                        Répondre
                      </button>
                      {(comment.username === currentUser ||
                        comment.userId?.nom === currentUser ||
                        isOwnPost) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id || comment._id)}
                          className="hover:text-red-400 transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Réponses */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 border-l border-gray-700 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id || reply._id} className="flex items-start py-3">
                        {/* Photo de profil pour les réponses */}
                        <div className="mr-3">
                          <ProfileImage
                            avatar={
                              reply.userAvatar ||
                              reply.userId?.photoProfil ||
                              reply.userId?.avatar
                            }
                            username={
                              reply.username ||
                              reply.userId?.nom ||
                              reply.userId?.name ||
                              "Utilisateur"
                            }
                            size="w-6 h-6"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-bold mr-2">
                              {reply.username ||
                                reply.userId?.nom ||
                                "Utilisateur"}
                            </span>
                            {reply.text || reply.contenu}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500 gap-4">
                            <span>{reply.time}</span>
                            <span>{getLikesCount(reply.likes)} j'aime</span>
                            <button
                              onClick={() => 
                                handleCommentLike(
                                  reply.id || reply._id, 
                                  true, 
                                  comment.id || comment._id, 
                                  reply.id || reply._id
                                )
                              }
                              className={`hover:text-red-400 transition-colors ${
                                checkIfUserLiked(reply.likes) ? "text-red-400" : ""
                              }`}
                            >
                              J'aime
                            </button>
                            {(reply.username === currentUser ||
                              reply.userId?.nom === currentUser ||
                              isOwnPost) && (
                              <button
                                onClick={() =>
                                  handleDeleteReply(comment.id || comment._id, reply.id || reply._id)
                                }
                                className="hover:text-red-400 transition-colors"
                              >
                                Supprimer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Zone de réponse */}
                {replyingTo === (comment.id || comment._id) && (
                  <div className="ml-11 p-4 border-t border-gray-700/50">
                    <div className="flex items-center">
                      {/* Photo de profil dans la zone de réponse */}
                      <div className="mr-3">
                        <ProfileImage
                          avatar={currentUserAvatar}
                          username={currentUser}
                          size="w-6 h-6"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder={`Répondre à ${
                          comment.username ||
                          comment.userId?.nom ||
                          "cet utilisateur"
                        }...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddReply(comment.id || comment._id)
                        }
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500"
                        autoFocus
                      />
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="ml-2 text-gray-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                      {replyText.trim() && (
                        <button
                          onClick={() => handleAddReply(comment.id || comment._id)}
                          className="ml-2 text-blue-400 hover:text-blue-300 font-semibold text-sm"
                        >
                          Publier
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Zone d'ajout de commentaire */}
          <div className="flex items-center p-4 border-t border-gray-700">
            {/* Photo de profil dans la zone d'ajout de commentaire */}
            <div className="mr-3">
              <ProfileImage
                avatar={currentUserAvatar}
                username={currentUser}
                size="w-8 h-8"
              />
            </div>
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500"
            />
            {newComment.trim() && (
              <button
                onClick={handleAddComment}
                className="ml-2 text-blue-400 hover:text-blue-300 font-semibold text-sm"
              >
                Publier
              </button>
            )}
          </div>

          {/* Bouton fermer */}
          <div className="flex justify-center p-2">
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}