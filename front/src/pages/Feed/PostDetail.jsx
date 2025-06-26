import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ArrowLeft, 
  MoreHorizontal,
  Image as ImageIcon,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2
} from "lucide-react";
import { publicationApi } from "../../api/feed.api";
import toast from "react-hot-toast";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const getCurrentUser = () => {
      try {
        const cookies = document.cookie.split("; ");
        const tokenCookie = cookies.find((row) => row.startsWith("token="));
        if (tokenCookie) {
          const token = tokenCookie.split("=")[1];
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId = payload.sub || payload.userId || payload.id || payload._id;
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error("Erreur récupération user:", error);
      }
    };
    getCurrentUser();
  }, []);

  // ✅ AJOUT: Fonction de test pour diagnostiquer l'API
  const testDirectApiCall = async () => {
    try {
      console.group("🧪 Test API Direct");
      console.log("URL complète:", `${window.location.origin}/api/feeds/${id}`);
      
      // Test avec fetch direct
      const directResponse = await fetch(`/api/feeds/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Status:", directResponse.status);
      console.log("OK:", directResponse.ok);
      
      const directData = await directResponse.text();
      console.log("Raw response:", directData);
      
      try {
        const jsonData = JSON.parse(directData);
        console.log("Parsed JSON:", jsonData);
      } catch (parseError) {
        console.log("Parse error:", parseError);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error("Test direct failed:", error);
    }
  };

  // Charger le détail du post
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 Chargement post ID:", id);
        
        // ✅ AJOUT: Test API direct en cas d'échec
        if (process.env.NODE_ENV === 'development') {
          await testDirectApiCall();
        }
        
        const response = await publicationApi.getPublicationById(id);
        
        console.log("📥 Réponse API getPublicationById:", response);
        
        // ✅ CORRECTION: Gérer différents formats de réponse
        if (response) {
          // Cas 1: Réponse avec success et publication
          if (response.success && response.publication) {
            console.log("✅ Post trouvé avec success:", response.publication);
            setPost(response.publication);
          }
          // Cas 2: Réponse directe avec les données du post
          else if (response._id || response.id) {
            console.log("✅ Post trouvé directement:", response);
            setPost(response);
          }
          // Cas 3: Réponse avec data
          else if (response.data) {
            console.log("✅ Post trouvé dans data:", response.data);
            setPost(response.data);
          }
          // Cas 4: Aucune donnée trouvée
          else {
            console.warn("⚠️ Structure de réponse inconnue:", response);
            setError(response.message || "Post non trouvé");
          }
        } else {
          setError("Post non trouvé");
        }
      } catch (err) {
        console.error("❌ Erreur chargement post:", err);
        setError(err.message || "Impossible de charger le post");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPost();
    }
  }, [id]);

  // Fonctions utilitaires
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const formatDate = (dateString) => {
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

  const hasUserLiked = () => {
    return post?.likes?.some(like => 
      (like.userId?._id || like.userId) === currentUserId
    ) || false;
  };

  // Actions
  const handleLike = async () => {
    if (!post || isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await publicationApi.toggleLikePublication(post._id);
      
      if (result.success) {
        // Mettre à jour localement
        setPost(prev => ({
          ...prev,
          likes: result.likes || []
        }));
        
        toast.success(hasUserLiked() ? "Like retiré" : "Post liké !");
      }
    } catch (error) {
      console.error("Erreur like:", error);
      toast.error("Erreur lors du like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!post || isSaving) return;
    
    setIsSaving(true);
    try {
      const result = await publicationApi.toggleSavePublication(post._id);
      
      if (result.success) {
        toast.success(result.saved ? "Post sauvegardé !" : "Post retiré des sauvegardés");
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post?.idTatoueur?.nom}`,
          text: post?.contenu?.substring(0, 100) + "...",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Partage annulé");
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier !");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      const result = await publicationApi.addComment(post._id, {
        contenu: newComment.trim()
      });
      
      if (result.success) {
        setPost(prev => ({
          ...prev,
          commentaires: [...(prev.commentaires || []), result.comment]
        }));
        setNewComment("");
        toast.success("Commentaire ajouté !");
      }
    } catch (error) {
      console.error("Erreur commentaire:", error);
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;
    
    try {
      await publicationApi.deletePublication(post._id);
      toast.success("Post supprimé !");
      navigate("/feed");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Rendu conditionnel
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Post introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          
          {/* ✅ AJOUT: Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 text-left">
              <h3 className="font-semibold text-sm mb-2">Debug Info:</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Post ID: {id}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                URL: /api/feeds/{id}
              </p>
              <button
                onClick={testDirectApiCall}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Test API Direct
              </button>
            </div>
          )}
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate("/feed")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retour au feed
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const isOwnPost = currentUserId === (post.idTatoueur?._id || post.idTatoueur);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.commentaires?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header avec navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Détail du post
          </h1>
          
          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <MoreHorizontal size={20} />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => navigate(`/post/edit/${post._id}`)}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* En-tête du post */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Link
                to={`/profil/${post.idTatoueur?._id || post.idTatoueur}`}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                  {post.idTatoueur?.photoProfil ? (
                    <img
                      src={post.idTatoueur.photoProfil}
                      alt={post.idTatoueur.nom}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(post.idTatoueur?.nom || "Utilisateur")
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {post.idTatoueur?.nom || "Utilisateur"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(post.datePublication || post.createdAt)}
                  </p>
                </div>
              </Link>
            </div>

            {/* Contenu du post */}
            <div className="mb-4">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                {post.contenu}
              </p>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/tag/${tag}`}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Tag size={12} className="mr-1" />
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Image du post */}
          {post.image && (
            <div className="relative">
              <img
                src={post.image}
                alt="Post"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions du post */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center space-x-2 transition-colors ${
                    hasUserLiked()
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart
                    size={20}
                    className={hasUserLiked() ? "fill-current" : ""}
                  />
                  <span>{likesCount}</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  <MessageCircle size={20} />
                  <span>{commentsCount}</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <Bookmark size={20} />
                </button>

                <button
                  onClick={handleShare}
                  className="text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Formulaire d'ajout de commentaire */}
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-100"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isCommenting}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCommenting ? "..." : "Commenter"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des commentaires */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Commentaires ({commentsCount})
            </h3>
            
            {commentsCount === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucun commentaire pour le moment</p>
                <p className="text-sm">Soyez le premier à commenter !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {post.commentaires?.map((comment) => (
                  <div key={comment._id || comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
                      {comment.userId?.photoProfil ? (
                        <img
                          src={comment.userId.photoProfil}
                          alt={comment.userId.nom}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {comment.userId?.nom || "Utilisateur"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.dateCommentaire || comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.contenu}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 space-x-4">
                        <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 flex items-center">
                          <Heart size={12} className="mr-1" />
                          {comment.likes?.length || 0}
                        </button>
                        <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500">
                          Répondre
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}