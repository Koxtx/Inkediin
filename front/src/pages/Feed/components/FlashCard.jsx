import React, { useState, useEffect, useContext } from "react";
import {
  Heart,
  Eye,
  MessageCircle,
  Zap,
  MoreVertical,
  Bookmark,
  MapPin,
  Tag,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Copy,
  BarChart3,
  EyeOff,
  Trash2,
  User,
  Share,
  UserPlus,
  Flag,
  Send,
  Reply,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FlashContext } from "../../../context/FlashContext";

export default function FlashCard({
  // ✅ Props principales (données du backend)
  _id,
  id,
  idTatoueur,
  image,
  prix,
  description,
  title,
  artist,
  style,
  styleCustom,
  taille,
  emplacement = [],
  tags = [],
  disponible = true,
  reserve = false,
  likes = [],
  views = 0,
  commentaires = [],
  date,
  createdAt,

  // ✅ Props calculées/dérivées du backend
  likesCount,
  commentsCount,

  // ✅ Callbacks
  onLike,
  onSave,
  onUpdate,
}) {
  const {
    currentUserId,
    toggleLikeFlash,
    toggleSaveFlash,
    isFlashSaved,
    hasUserLiked,
    getLikesCount,
    // ✅ NOUVELLES FONCTIONS DE SYNCHRONISATION
    addCommentToFlash,
    likeCommentInFlash,
    addReplyToComment,
    likeReplyInFlash,
    deleteCommentFromFlash,
    deleteReplyFromFlash,
    getFlashFromCache,
    updateFlashInCache,
  } = useContext(FlashContext);

  // ✅ ID unifié
  const flashId = _id || id;

  // ✅ États locaux
  const [localFlash, setLocalFlash] = useState({
    _id: flashId,
    id: flashId,
    idTatoueur,
    image,
    prix,
    description,
    title,
    artist,
    style,
    styleCustom,
    taille,
    emplacement,
    tags,
    disponible,
    reserve,
    likes,
    views,
    commentaires,
    date,
    createdAt,
    likesCount,
    commentsCount,
  });

  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localIsSaved, setLocalIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // ✅ NOUVEAUX ÉTATS POUR LES COMMENTAIRES
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [showReplies, setShowReplies] = useState({});

  // ✅ NOUVEAU: Écouter les événements de mise à jour globaux
  useEffect(() => {
    const handleFlashUpdated = (event) => {
      const { flashId: updatedFlashId, updatedFlash } = event.detail;
      
      if (updatedFlashId === flashId) {
        console.log("🔄 FlashCard - Mise à jour reçue:", updatedFlash);
        setLocalFlash(updatedFlash);
        
        // Mettre à jour les états locaux
        if (currentUserId) {
          setLocalIsLiked(hasUserLiked(updatedFlash));
          setLocalIsSaved(isFlashSaved(flashId));
        }
      }
    };

    window.addEventListener('flashUpdated', handleFlashUpdated);
    
    return () => {
      window.removeEventListener('flashUpdated', handleFlashUpdated);
    };
  }, [flashId, hasUserLiked, isFlashSaved, currentUserId]);

  // ✅ Initialiser les états selon l'API
  useEffect(() => {
    // Vérifier d'abord le cache pour avoir les données les plus récentes
    const cachedFlash = getFlashFromCache(flashId);
    if (cachedFlash) {
      setLocalFlash(cachedFlash);
    }

    if (currentUserId) {
      // Vérifier si l'utilisateur a liké
      const flashData = cachedFlash || localFlash;
      const userLiked = hasUserLiked(flashData);
      setLocalIsLiked(userLiked);

      // Vérifier si l'utilisateur a sauvegardé
      const userSaved = isFlashSaved(flashId);
      setLocalIsSaved(userSaved);
    }
  }, [
    currentUserId,
    flashId,
    hasUserLiked,
    isFlashSaved,
    getFlashFromCache,
  ]);

  // ✅ Formatage de la date
  const formatTime = (timeValue) => {
    if (!timeValue) return "?";

    try {
      const date = new Date(timeValue);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) return "À l'instant";
      if (diffInHours < 24) return `${diffInHours}h`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}j`;

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch (error) {
      return timeValue || "?";
    }
  };

  // ✅ Formatage de la date pour les commentaires
  const formatCommentDate = (dateString) => {
    if (!dateString) return "Date inconnue";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays < 7) return `Il y a ${diffDays} jours`;

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "Date inconnue";
    }
  };

  // ✅ Fonction pour obtenir le style d'affichage
  const getDisplayStyle = () => {
    if (localFlash.style === "autre" && localFlash.styleCustom) {
      return localFlash.styleCustom;
    }
    return localFlash.style;
  };

  // ✅ Composant ProfileImage
  const ProfileImage = ({ avatar, username, size = "w-10 h-10" }) => {
    const [imgError, setImgError] = useState(false);

    const getProfileImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("https://res.cloudinary.com")) return imagePath;
      if (imagePath.startsWith("data:image")) return imagePath;
      if (imagePath.startsWith("http")) return imagePath;
      return null;
    };

    const imageUrl = getProfileImageUrl(avatar);

    return (
      <div
        className={`${size} rounded-full overflow-hidden bg-gray-600 flex-shrink-0`}
      >
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={`Photo de profil de ${username}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
            {username?.charAt(0)?.toUpperCase() || "F"}
          </div>
        )}
      </div>
    );
  };

  // ✅ Gestion du like
  const handleLike = async () => {
    try {
      // Mise à jour optimiste
      const wasLiked = localIsLiked;
      setLocalIsLiked(!wasLiked);
      
      // Mettre à jour le flash local
      const updatedLikes = wasLiked 
        ? (localFlash.likesCount || localFlash.likes?.length || 0) - 1
        : (localFlash.likesCount || localFlash.likes?.length || 0) + 1;
      
      setLocalFlash(prev => ({
        ...prev,
        likesCount: updatedLikes
      }));

      // Appel API via le contexte (qui gère la synchronisation)
      await toggleLikeFlash(flashId);
    } catch (error) {
      // Rollback en cas d'erreur
      setLocalIsLiked(localIsLiked);
      setLocalFlash(prev => ({
        ...prev,
        likesCount: localFlash.likesCount || localFlash.likes?.length || 0
      }));
      console.error("Erreur like Flash:", error);
    }
  };

  // ✅ Gestion de la sauvegarde
  const handleSave = async () => {
    try {
      // Mise à jour optimiste
      setLocalIsSaved(!localIsSaved);

      // Appel API via le contexte
      await toggleSaveFlash(localFlash);
    } catch (error) {
      // Rollback en cas d'erreur
      setLocalIsSaved(localIsSaved);
      console.error("Erreur save Flash:", error);
    }
  };

  // ✅ NOUVELLES FONCTIONS POUR LES COMMENTAIRES AVEC SYNCHRONISATION

  // Ajouter un commentaire
  const handleAddComment = async () => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour commenter");
      return;
    }

    if (!newComment.trim()) {
      alert("Veuillez saisir un commentaire");
      return;
    }

    try {
      setCommentLoading(true);
      console.log("💬 FlashCard - Ajout commentaire:", newComment);

      // Utiliser la fonction du contexte qui gère la synchronisation
      const updatedFlash = await addCommentToFlash(flashId, newComment.trim());
      
      // Le flash local sera mis à jour automatiquement via l'événement
      setNewComment("");

      console.log("✅ Commentaire ajouté depuis FlashCard");
    } catch (err) {
      console.error("❌ Erreur ajout commentaire:", err);
      alert("Erreur lors de l'ajout du commentaire");
    } finally {
      setCommentLoading(false);
    }
  };

  // Liker un commentaire
  const handleLikeComment = async (commentId) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour liker un commentaire");
      return;
    }

    try {
      console.log("👍 FlashCard - Like commentaire:", commentId);
      
      // Utiliser la fonction du contexte qui gère la synchronisation
      await likeCommentInFlash(flashId, commentId);
      
      console.log("✅ Commentaire liké depuis FlashCard");
    } catch (err) {
      console.error("❌ Erreur like commentaire:", err);
      alert("Erreur lors du like du commentaire");
    }
  };

  // Ajouter une réponse
  const handleAddReply = async (commentId) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour répondre");
      return;
    }

    const replyText = replyInputs[commentId];
    if (!replyText?.trim()) {
      alert("Veuillez saisir une réponse");
      return;
    }

    try {
      console.log("💬 FlashCard - Ajout réponse:", replyText);
      
      // Utiliser la fonction du contexte qui gère la synchronisation
      await addReplyToComment(flashId, commentId, replyText.trim());

      // Réinitialiser l'input de réponse
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));

      console.log("✅ Réponse ajoutée depuis FlashCard");
    } catch (err) {
      console.error("❌ Erreur ajout réponse:", err);
      alert("Erreur lors de l'ajout de la réponse");
    }
  };

  // Liker une réponse
  const handleLikeReply = async (commentId, replyId) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour liker une réponse");
      return;
    }

    try {
      console.log("👍 FlashCard - Like réponse:", replyId);
      
      // Utiliser la fonction du contexte qui gère la synchronisation
      await likeReplyInFlash(flashId, commentId, replyId);
      
      console.log("✅ Réponse likée depuis FlashCard");
    } catch (err) {
      console.error("❌ Erreur like réponse:", err);
      alert("Erreur lors du like de la réponse");
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return;
    }

    try {
      console.log("🗑️ FlashCard - Suppression commentaire:", commentId);
      
      // Utiliser la fonction du contexte qui gère la synchronisation
      await deleteCommentFromFlash(flashId, commentId);
      
      console.log("✅ Commentaire supprimé depuis FlashCard");
    } catch (err) {
      console.error("❌ Erreur suppression commentaire:", err);
      alert("Erreur lors de la suppression du commentaire");
    }
  };

  // Supprimer une réponse
  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
      return;
    }

    try {
      console.log("🗑️ FlashCard - Suppression réponse:", replyId);
      
      // Utiliser la fonction du contexte qui gère la synchronisation
      await deleteReplyFromFlash(flashId, commentId, replyId);
      
      console.log("✅ Réponse supprimée depuis FlashCard");
    } catch (err) {
      console.error("❌ Erreur suppression réponse:", err);
      alert("Erreur lors de la suppression de la réponse");
    }
  };

  // ✅ Composant Commentaire
  const CommentComponent = ({ comment }) => {
    const isOwner = comment.userId?._id === currentUserId;
    const hasLiked = comment.likes?.some(
      (like) => like.userId?._id === currentUserId
    );

    return (
      <div className="border-b border-gray-700 pb-3 mb-3">
        <div className="flex items-start gap-2">
          <ProfileImage
            avatar={comment.userId?.photoProfil}
            username={comment.userId?.nom}
            size="w-7 h-7"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white text-sm">
                {comment.userId?.nom || "Utilisateur"}
              </span>
              <span className="text-gray-500 text-xs">
                {formatCommentDate(comment.dateCommentaire)}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-2">{comment.contenu}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  hasLiked
                    ? "text-red-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <ThumbsUp size={10} fill={hasLiked ? "currentColor" : "none"} />
                {comment.likes?.length || 0}
              </button>
              <button
                onClick={() => {
                  const currentValue = replyInputs[comment._id] || "";
                  setReplyInputs((prev) => ({
                    ...prev,
                    [comment._id]: currentValue ? "" : "",
                  }));
                }}
                className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1"
              >
                <Reply size={10} />
                Répondre
              </button>
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() =>
                    setShowReplies((prev) => ({
                      ...prev,
                      [comment._id]: !prev[comment._id],
                    }))
                  }
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                >
                  {showReplies[comment._id] ? (
                    <ChevronUp size={10} />
                  ) : (
                    <ChevronDown size={10} />
                  )}
                  {comment.replies.length} réponse{comment.replies.length > 1 ? "s" : ""}
                </button>
              )}
            </div>

            {/* Input de réponse */}
            {replyInputs.hasOwnProperty(comment._id) && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Écrire une réponse..."
                  value={replyInputs[comment._id] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddReply(comment._id);
                    }
                  }}
                />
                <button
                  onClick={() => handleAddReply(comment._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  <Send size={10} />
                </button>
              </div>
            )}

            {/* Réponses */}
            {showReplies[comment._id] && comment.replies && (
              <div className="mt-2 ml-4 space-y-2">
                {comment.replies.map((reply) => {
                  const replyIsOwner = reply.userId?._id === currentUserId;
                  const replyHasLiked = reply.likes?.some(
                    (like) => like.userId?._id === currentUserId
                  );

                  return (
                    <div key={reply._id} className="flex items-start gap-2">
                      <ProfileImage
                        avatar={reply.userId?.photoProfil}
                        username={reply.userId?.nom}
                        size="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-xs">
                            {reply.userId?.nom || "Utilisateur"}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatCommentDate(reply.dateReponse)}
                          </span>
                          {replyIsOwner && (
                            <button
                              onClick={() => handleDeleteReply(comment._id, reply._id)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              <Trash2 size={8} />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs mb-1">
                          {reply.contenu}
                        </p>
                        <button
                          onClick={() =>
                            handleLikeReply(comment._id, reply._id)
                          }
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            replyHasLiked
                              ? "text-red-400"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <ThumbsUp
                            size={8}
                            fill={replyHasLiked ? "currentColor" : "none"}
                          />
                          {reply.likes?.length || 0}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ Données du tatoueur
  const tatoueurData = localFlash.idTatoueur || {};
  const tatoueurNom = tatoueurData.nom || localFlash.artist || "Artiste";
  const tatoueurAvatar = tatoueurData.photoProfil || tatoueurData.avatar;
  const tatoueurVille = tatoueurData.ville || tatoueurData.localisation;

  return (
    <article className="mb-6 border-b border-gray-700 bg-gray-900">
      {/* ✅ Header avec info tatoueur */}
      <div className="flex items-center p-4">
        <div className="mr-3">
          <ProfileImage avatar={tatoueurAvatar} username={tatoueurNom} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-bold text-white">{tatoueurNom}</div>
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap size={8} />
              FLASH
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatTime(localFlash.date || localFlash.createdAt)}</span>
            {tatoueurVille && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin size={10} />
                  {tatoueurVille}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            className="text-xl text-gray-500 hover:text-white transition-colors p-1"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
              {/* ✅ Menu différent selon si c'est le propriétaire ou non */}
              {tatoueurData._id === currentUserId ||
              tatoueurData.id === currentUserId ? (
                // ✅ Menu pour le propriétaire du flash
                <>
                  <Link
                    to={`/flashedit/${flashId}`}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-blue-400 hover:text-blue-300  flex items-center gap-3"
                  >
                    <Edit size={16} />
                    Modifier le flash
                  </Link>
                  <button
                    onClick={() => {
                      console.log("Dupliquer flash:", flashId);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-green-400 hover:text-green-300 flex items-center gap-3"
                  >
                    <Copy size={16} />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      console.log("Voir stats flash:", flashId);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-3"
                  >
                    <BarChart3 size={16} />
                    Statistiques
                  </button>
                  <button
                    onClick={() => {
                      console.log("Toggle disponibilité:", flashId);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-3"
                  >
                    {localFlash.disponible ? <EyeOff size={16} /> : <Eye size={16} />}
                    {localFlash.disponible ? "Masquer" : "Rendre visible"}
                  </button>
                  <hr className="border-gray-600 my-1" />
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Êtes-vous sûr de vouloir supprimer ce flash ?"
                        )
                      ) {
                        console.log("Supprimer flash:", flashId);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-red-400 hover:text-red-300 flex items-center gap-3"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </>
              ) : (
                // ✅ Menu pour les autres utilisateurs
                <>
                  <Link
                    to={`/profil/${tatoueurData._id || tatoueurData.id}`}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-gray-300 flex items-center gap-3"
                  >
                    <User size={16} />
                    Voir le profil
                  </Link>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: localFlash.title || "Flash tattoo",
                          text: `Découvrez ce flash de ${tatoueurNom}`,
                          url:
                            window.location.origin + `/flashdetail/${flashId}`,
                        });
                      } else {
                        navigator.clipboard.writeText(
                          window.location.origin + `/flashdetail/${flashId}`
                        );
                        alert("Lien copié dans le presse-papiers !");
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-gray-300 flex items-center gap-3"
                  >
                    <Share size={16} />
                    Partager
                  </button>
                  <button
                    onClick={() => {
                      console.log("Toggle follow tatoueur:", tatoueurData._id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-3"
                  >
                    <UserPlus size={16} />
                    Suivre {tatoueurNom}
                  </button>
                  <hr className="border-gray-600 my-1" />
                  <button
                    onClick={() => {
                      if (window.confirm("Signaler ce contenu ?")) {
                        console.log("Signaler flash:", flashId);
                        alert("Contenu signalé. Merci !");
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-3"
                  >
                    <Flag size={16} />
                    Signaler
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Zone d'image avec informations overlay */}
      <div className="w-full aspect-square bg-gray-700 relative overflow-hidden">
        {localFlash.image ? (
          <img
            src={localFlash.image}
            alt={localFlash.title || "Flash design"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Zap size={24} className="text-white" />
              </div>
              <div className="text-gray-400 text-sm">Design Flash</div>
            </div>
          </div>
        )}

        {/* ✅ Prix en overlay */}
        <div className="absolute top-3 left-3">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
            {localFlash.prix?.toFixed(2) || "0.00"}€
          </div>
        </div>

        {/* ✅ Statut en overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {localFlash.disponible ? (
            localFlash.reserve ? (
              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Clock size={10} />
                Réservé
              </div>
            ) : (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle size={10} />
                Disponible
              </div>
            )
          ) : (
            <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Indisponible
            </div>
          )}
        </div>

        {/* ✅ Stats en overlay bas */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
            <Eye size={10} />
            {localFlash.views || 0}
          </div>
        </div>

        {/* ✅ Style et taille en overlay bas gauche */}
        {(getDisplayStyle() || localFlash.taille) && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {getDisplayStyle() && (
              <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs capitalize">
                {getDisplayStyle()}
              </div>
            )}
            {localFlash.taille && (
              <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs capitalize">
                {localFlash.taille === "petit" ? "S" : localFlash.taille === "moyen" ? "M" : "L"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Actions (like, commentaire, save) */}
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

      {/* ✅ Likes count */}
      <div className="px-4 mb-2 text-sm font-bold text-white">
        {localFlash.likesCount || localFlash.likes?.length || 0} j'aime
      </div>

      {/* ✅ Titre et description */}
      <div className="px-4 text-sm leading-relaxed text-white">
        <span className="font-bold">{tatoueurNom}</span>
        {localFlash.title && (
          <>
            {" "}
            <span className="font-semibold text-red-400">{localFlash.title}</span>
          </>
        )}
        {localFlash.description && (
          <>
            {" "}
            <span className="text-gray-300">{localFlash.description}</span>
          </>
        )}
      </div>

      {/* ✅ Tags */}
      {localFlash.tags && localFlash.tags.length > 0 && (
        <div className="px-4 mt-2 flex flex-wrap gap-1">
          {localFlash.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
          {localFlash.tags.length > 5 && (
            <span className="text-xs text-gray-500">
              +{localFlash.tags.length - 5} autres
            </span>
          )}
        </div>
      )}

      {/* ✅ Emplacements recommandés */}
      {localFlash.emplacement && localFlash.emplacement.length > 0 && (
        <div className="px-4 mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={12} />
            <span>Recommandé pour: </span>
            <span className="text-gray-300">
              {localFlash.emplacement.slice(0, 3).join(", ")}
              {localFlash.emplacement.length > 3 && ` +${localFlash.emplacement.length - 3}`}
            </span>
          </div>
        </div>
      )}

      {/* ✅ SECTION COMMENTAIRES INTÉGRÉE */}
      {showComments && (
        <div className="px-4 py-4 bg-gray-800 border-t border-gray-700">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MessageCircle size={14} className="text-red-500" />
              Commentaires ({localFlash.commentaires?.length || 0})
            </h4>

            {/* Formulaire d'ajout de commentaire */}
            {currentUserId ? (
              <div className="mb-4">
                <div className="flex gap-2">
                  <ProfileImage
                    avatar={null}
                    username="Vous"
                    size="w-8 h-8"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Écrire un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-red-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={commentLoading || !newComment.trim()}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {commentLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Send size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 text-center py-4 text-gray-400 bg-gray-700 rounded-lg">
                <p className="text-sm mb-2">Connectez-vous pour commenter</p>
                <Link
                  to="/login"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            )}

            {/* Liste des commentaires */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {localFlash.commentaires && localFlash.commentaires.length > 0 ? (
                localFlash.commentaires.slice(0, 5).map((comment) => (
                  <CommentComponent key={comment._id} comment={comment} />
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun commentaire</p>
                  <p className="text-xs">Soyez le premier à commenter !</p>
                </div>
              )}
              
              {/* Lien pour voir tous les commentaires si il y en a plus de 5 */}
              {localFlash.commentaires && localFlash.commentaires.length > 5 && (
                <div className="text-center pt-3 border-t border-gray-600">
                  <Link
                    to={`/flashdetail/${flashId}`}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center justify-center gap-1"
                  >
                    <MessageCircle size={12} />
                    Voir tous les {localFlash.commentaires.length} commentaires
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Commentaires preview (quand fermé) */}
      {!showComments && (localFlash.commentaires?.length || 0) > 0 && (
        <button 
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          onClick={() => setShowComments(true)}
        >
          Voir les {localFlash.commentaires.length} commentaire
          {localFlash.commentaires.length > 1 ? "s" : ""}...
        </button>
      )}

      {/* ✅ Date de création */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar size={10} />
            {formatTime(localFlash.date || localFlash.createdAt)}
          </span>

          {/* ✅ Bouton "Voir les détails" */}
          <Link
            to={`/flashdetail/${flashId}`}
            className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            <Zap size={14} />
            Voir les détails
          </Link>
        </div>
      </div>
    </article>
  );
}