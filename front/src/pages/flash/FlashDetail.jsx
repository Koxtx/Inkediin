import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Eye,
  MapPin,
  Calendar,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  MoreVertical,
  Flag,
  Edit,
  Trash2,
  X,
  Tag,
  Send,
  Reply,
  ThumbsUp,
  Star,
} from "lucide-react";
import { FlashContext } from "../../context/FlashContext";

export default function FlashDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getFlashById,
    toggleLikeFlash,
    reserveFlash,
    deleteFlash,
    currentUserId,
    toggleSaveFlash,
    isFlashSaved,
    hasUserLiked,
    getLikesCount,
    addCommentToFlash,
    likeCommentInFlash,
    addReplyToComment,
    likeReplyInFlash,
    deleteCommentFromFlash,
    deleteReplyFromFlash,
    getFlashFromCache,
  } = useContext(FlashContext);

  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    const handleFlashUpdated = (event) => {
      const { flashId: updatedFlashId, updatedFlash } = event.detail;

      if (updatedFlashId === id) {
        setFlash(updatedFlash);

        // Mettre à jour les états locaux
        if (currentUserId) {
          setIsLiked(hasUserLiked(updatedFlash));
          setIsSaved(isFlashSaved(id));
        }
        setLikesCount(getLikesCount(updatedFlash));
      }
    };

    window.addEventListener("flashUpdated", handleFlashUpdated);

    return () => {
      window.removeEventListener("flashUpdated", handleFlashUpdated);
    };
  }, [id, currentUserId]); // Suppression des fonctions pour éviter la boucle infinie

  useEffect(() => {
    const loadFlash = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier d'abord le cache
        const cachedFlash = getFlashFromCache(id);
        if (cachedFlash) {
          setFlash(cachedFlash);

          // Calculer les états utilisateur
          if (currentUserId) {
            const userLiked = hasUserLiked(cachedFlash);
            const userSaved = isFlashSaved(id);
            setIsLiked(userLiked);
            setIsSaved(userSaved);
          }
          setLikesCount(getLikesCount(cachedFlash));
          setLoading(false);
          return;
        }

        // Sinon, charger depuis l'API
        const flashData = await getFlashById(id);

        setFlash(flashData);

        if (currentUserId) {
          const userLiked = hasUserLiked(flashData);
          const userSaved = isFlashSaved(flashData._id || flashData.id);
          setIsLiked(userLiked);
          setIsSaved(userSaved);
        }

        const likes = getLikesCount(flashData);
        setLikesCount(likes);
      } catch (err) {
        console.error("❌ FlashDetail - Erreur chargement:", err);
        setError("Flash non trouvé ou erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFlash();
    }
  }, [
    id,
    currentUserId,
  ]); // Suppression des fonctions pour éviter la boucle infinie

  const handleLike = async () => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour liker un Flash");
      return;
    }

    try {
      // Mise à jour optimiste
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

      // Utiliser la fonction du contexte qui gère la synchronisation
      const updatedFlash = await toggleLikeFlash(id);

      // Les états seront mis à jour automatiquement via l'événement
    } catch (err) {
      console.error("❌ Erreur like Flash:", err);
      // Rollback en cas d'erreur
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      alert("Erreur lors du like");
    }
  };

  const handleSave = async () => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour sauvegarder un Flash");
      return;
    }

    try {
      // Mise à jour optimiste
      setIsSaved(!isSaved);

      await toggleSaveFlash(flash);
    } catch (err) {
      console.error("❌ Erreur save Flash:", err);
      // Rollback en cas d'erreur
      setIsSaved(isSaved);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleReservation = async () => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour réserver un Flash");
      return;
    }

    try {
      const response = await reserveFlash(id);

      setShowReservationModal(false);
      alert("Flash réservé avec succès !");
    } catch (err) {
      console.error("❌ Erreur réservation Flash:", err);
      alert(err.message || "Erreur lors de la réservation");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce Flash ?")) {
      return;
    }

    try {
      await deleteFlash(id);

      alert("Flash supprimé avec succès");
      navigate("/flash");
    } catch (err) {
      console.error("❌ Erreur suppression Flash:", err);
      alert("Erreur lors de la suppression");
    }
  };

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

      // Utiliser la fonction du contexte qui gère la synchronisation
      await addCommentToFlash(id, newComment.trim());

      // Le flash sera mis à jour automatiquement via l'événement
      setNewComment("");
    } catch (err) {
      console.error("❌ Erreur ajout commentaire:", err);
      alert("Erreur lors de l'ajout du commentaire");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour liker un commentaire");
      return;
    }

    try {
      // Utiliser la fonction du contexte qui gère la synchronisation
      await likeCommentInFlash(id, commentId);
    } catch (err) {
      console.error("❌ Erreur like commentaire:", err);
      alert("Erreur lors du like du commentaire");
    }
  };

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
      // Utiliser la fonction du contexte qui gère la synchronisation
      await addReplyToComment(id, commentId, replyText.trim());

      // Réinitialiser l'input de réponse
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("❌ Erreur ajout réponse:", err);
      alert("Erreur lors de l'ajout de la réponse");
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour liker une réponse");
      return;
    }

    try {
      // Utiliser la fonction du contexte qui gère la synchronisation
      await likeReplyInFlash(id, commentId, replyId);
    } catch (err) {
      console.error("❌ Erreur like réponse:", err);
      alert("Erreur lors du like de la réponse");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")
    ) {
      return;
    }

    try {
      // Utiliser la fonction du contexte qui gère la synchronisation
      await deleteCommentFromFlash(id, commentId);
    } catch (err) {
      console.error("❌ Erreur suppression commentaire:", err);
      alert("Erreur lors de la suppression du commentaire");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
      return;
    }

    try {
      // Utiliser la fonction du contexte qui gère la synchronisation
      await deleteReplyFromFlash(id, commentId, replyId);
    } catch (err) {
      console.error("❌ Erreur suppression réponse:", err);
      alert("Erreur lors de la suppression de la réponse");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Découvrez ce Flash de ${flash?.idTatoueur?.nom} à ${flash?.prix}€`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Flash Tattoo", text, url });
      } catch (err) {
        console.log("Partage annulé");
      }
    } else {
      // Fallback copie dans le presse-papier
      navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papier !");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Date inconnue";
    }
  };

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

  const ProfileImage = ({ avatar, username, size = "w-12 h-12" }) => {
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
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">
            {username?.charAt(0)?.toUpperCase() || "F"}
          </div>
        )}
      </div>
    );
  };

  const getDisplayStyle = () => {
    if (flash && flash.style === "autre" && flash.styleCustom) {
      return flash.styleCustom;
    }
    return flash?.style;
  };

  const CommentComponent = ({ comment }) => {
    const isOwner = comment.userId?._id === currentUserId;
    const hasLiked = comment.likes?.some(
      (like) => like.userId?._id === currentUserId
    );

    return (
      <div className="border-b border-gray-700 pb-4 mb-4">
        <div className="flex items-start gap-3">
          <ProfileImage
            avatar={comment.userId?.photoProfil}
            username={comment.userId?.nom}
            size="w-8 h-8"
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
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-2">{comment.contenu}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  hasLiked
                    ? "text-red-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <ThumbsUp size={12} fill={hasLiked ? "currentColor" : "none"} />
                {comment.likes?.length || 0}
              </button>
              <button
                onClick={() =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [comment._id]: prev[comment._id] ? "" : "",
                  }))
                }
                className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1"
              >
                <Reply size={12} />
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
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  {showReplies[comment._id] ? "Masquer" : "Voir"} les{" "}
                  {comment.replies.length} réponse
                  {comment.replies.length > 1 ? "s" : ""}
                </button>
              )}
            </div>

            {/* Input de réponse */}
            {replyInputs.hasOwnProperty(comment._id) && (
              <div className="mt-3 flex gap-2">
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
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddReply(comment._id);
                    }
                  }}
                />
                <button
                  onClick={() => handleAddReply(comment._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Send size={12} />
                </button>
              </div>
            )}

            {/* Réponses */}
            {showReplies[comment._id] && comment.replies && (
              <div className="mt-3 ml-6 space-y-3">
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
                        size="w-6 h-6"
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
                              onClick={() =>
                                handleDeleteReply(comment._id, reply._id)
                              }
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              <Trash2 size={10} />
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
                            size={10}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du Flash...</p>
        </div>
      </div>
    );
  }

  if (error || !flash) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">
            Flash non trouvé
          </h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/flash")}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retour aux Flash
          </button>
        </div>
      </div>
    );
  }

  const isOwnFlash = flash.idTatoueur?._id === currentUserId;
  const isAvailable = flash.disponible && !flash.reserve;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Zap size={10} />
              FLASH
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Share2 size={20} />
            </button>

            {isOwnFlash && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MoreVertical size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                    <button
                      onClick={() => navigate(`/flash/edit/${id}`)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-blue-400"
                    >
                      <Edit size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-red-400"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image du Flash */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                  <Zap size={48} className="text-gray-600" />
                </div>
              )}
              <img
                src={flash.image}
                alt="Flash design"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />

              {/* Stats overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-sm">
                  <Eye size={12} />
                  {flash.views || 0}
                </div>
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-sm">
                  <Heart size={12} />
                  {likesCount}
                </div>
              </div>
            </div>
          </div>

          {/* Informations du Flash */}
          <div className="space-y-6">
            {/* Artiste */}
            <div className="flex items-center justify-between">
              <Link
                to={`/artiste/${flash.idTatoueur?._id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <ProfileImage
                  avatar={flash.idTatoueur?.photoProfil}
                  username={flash.idTatoueur?.nom}
                />
                <div>
                  <h2 className="font-bold text-lg">
                    {flash.idTatoueur?.nom || "Artiste"}
                  </h2>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <MapPin size={12} />
                    {flash.idTatoueur?.ville || "Localisation non renseignée"}
                  </p>
                </div>
              </Link>
            </div>

            {/* Titre et artiste du Flash */}
            {(flash.title || flash.artist) && (
              <div className="space-y-2">
                {flash.title && (
                  <h1 className="text-2xl font-bold text-white">
                    {flash.title}
                  </h1>
                )}
                {flash.artist && flash.artist !== flash.idTatoueur?.nom && (
                  <p className="text-gray-300 flex items-center gap-2">
                    <User size={16} />
                    Par {flash.artist}
                  </p>
                )}
              </div>
            )}

            {/* Prix et statut */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-400">
                  {flash.prix?.toFixed(2)}€
                </div>
                <div className="flex gap-2">
                  {flash.disponible ? (
                    <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle size={14} />
                      Disponible
                    </span>
                  ) : (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                      Non disponible
                    </span>
                  )}

                  {flash.reserve && (
                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Clock size={14} />
                      Réservé
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Style et taille */}
            <div className="flex items-center gap-4">
              {flash.style && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Style:</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 px-2 py-1 rounded-full text-sm capitalize">
                    {getDisplayStyle()}
                  </span>
                </div>
              )}
              {flash.taille && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Taille:</span>
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200 px-2 py-1 rounded-full text-sm capitalize">
                    {flash.taille}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {flash.tags && flash.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                  <Tag size={16} className="text-red-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {flash.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emplacements recommandés */}
            {flash.emplacement && flash.emplacement.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  Emplacements recommandés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {flash.emplacement.map((emp, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm"
                    >
                      {emp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {flash.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300">Description</h3>
                <p className="text-gray-300 leading-relaxed">
                  {flash.description}
                </p>
              </div>
            )}

            {/* Informations techniques */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                <Zap size={16} className="text-red-500" />
                Informations Flash
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Créé le</span>
                  <p className="font-medium">
                    {formatDate(flash.date || flash.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Statut</span>
                  <p className="font-medium">
                    {isAvailable
                      ? "Libre"
                      : flash.reserve
                      ? "Réservé"
                      : "Indisponible"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Vues</span>
                  <p className="font-medium">{flash.views || 0}</p>
                </div>
                <div>
                  <span className="text-gray-400">Commentaires</span>
                  <p className="font-medium">
                    {flash.commentaires?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Like, Commentaire et Save */}
              <div className="flex gap-3">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isLiked
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Heart size={18} fill={isLiked ? "white" : "none"} />
                  {isLiked ? "Aimé" : "J'aime"} ({likesCount})
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  <MessageCircle size={18} />
                  Commentaires ({flash.commentaires?.length || 0})
                </button>

                <button
                  onClick={handleSave}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSaved
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Star size={18} fill={isSaved ? "white" : "none"} />
                  {isSaved ? "Sauvé" : "Sauver"}
                </button>
              </div>

              {/* Réservation */}
              {!isOwnFlash && isAvailable && (
                <button
                  onClick={handleReservation}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Réserver ce Flash
                </button>
              )}
            </div>
          </div>
        </div>

        {showComments && (
          <div className="mt-12 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle size={20} className="text-red-500" />
              Commentaires ({flash.commentaires?.length || 0})
            </h3>

            {/* Formulaire d'ajout de commentaire */}
            {currentUserId ? (
              <div className="mb-6">
                <div className="flex gap-3">
                  <ProfileImage
                    avatar={null}
                    username="Vous"
                    size="w-10 h-10"
                  />
                  <div className="flex-1 flex gap-2">
                    <textarea
                      placeholder="Écrire un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-red-500"
                      rows="3"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={commentLoading || !newComment.trim()}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {commentLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Send size={16} />
                      )}
                      {commentLoading ? "Envoi..." : "Publier"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 text-center py-8 text-gray-400">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-4">Connectez-vous pour commenter ce Flash</p>
                <Link
                  to="/signin"
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            )}

            {/* Liste des commentaires */}
            <div className="space-y-4">
              {flash.commentaires && flash.commentaires.length > 0 ? (
                flash.commentaires.map((comment) => (
                  <CommentComponent key={comment._id} comment={comment} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <MessageCircle
                    size={48}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p>Aucun commentaire pour le moment</p>
                  <p className="text-sm">
                    Soyez le premier à commenter ce Flash !
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flash similaires ou autres Flash de l'artiste */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">
            Autres Flash de {flash.idTatoueur?.nom}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Placeholder pour les flash similaires */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-800 aspect-square rounded-lg animate-pulse flex items-center justify-center"
              >
                <Zap size={24} className="text-gray-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
