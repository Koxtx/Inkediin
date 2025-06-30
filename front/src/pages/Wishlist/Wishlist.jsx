import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  MessageCircle,
  Eye,
  Trash2,
  Bookmark,
  Image,
  Zap,
  Filter,
  RotateCcw,
  User,
  MapPin,
  Calendar,
  Star,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  getSavedContent,
  toggleSavePost,
  toggleSaveFlash,
} from "../../api/auth.api";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Composant pour un flash sauvegardé
function SavedFlashCard({ flash, onRemove, onNavigate }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.stopPropagation();

    if (window.confirm("Retirer ce flash de votre wishlist ?")) {
      setIsRemoving(true);
      try {
      

        const result = await toggleSaveFlash(flash._id || flash.id);

        if (result.success) {
          toast.success("Flash retiré de la wishlist");
          onRemove(flash._id || flash.id);
        } else {
          toast.error(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du flash:", error);
        toast.error("Une erreur est survenue");
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`/flashdetail/${flash._id || flash.id}`);
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  };

  // Sécuriser l'accès aux données
  const displayUser = flash.user || flash.idTatoueur || flash.auteur || {};
  const displayTitle = flash.title || flash.titre || flash.description || "Flash sauvegardé";
  const displayImage = flash.image || flash.images?.[0] || null;
  const displayPrice = flash.price || flash.prix;
  const displayStyle = flash.style || flash.category || "Non spécifié";



  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      {/* Image du flash */}
      <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 relative overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback si pas d'image */}
        <div
          className={`w-full h-full flex items-center justify-center text-white ${
            displayImage ? "hidden" : "flex"
          }`}
        >
          <div className="text-center">
            <Zap size={32} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Flash Tattoo</p>
          </div>
        </div>

        {/* Bouton de suppression */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 ${
            isRemoving ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Retirer de la wishlist"
        >
          {isRemoving ? (
            <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Trash2 size={14} />
          )}
        </button>

        {/* Badge type de contenu */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500 text-white">
            Flash
          </span>
        </div>

        {/* Prix */}
        {displayPrice && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 text-sm font-bold rounded bg-black bg-opacity-70 text-white">
              {displayPrice}€
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {displayTitle}
        </h3>

        {/* Style */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
            {displayStyle}
          </span>
        </div>

        {/* Informations artiste */}
        {displayUser && displayUser.nom && (
          <div className="flex items-center mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-3">
              {displayUser.photoProfil ? (
                <img
                  src={displayUser.photoProfil}
                  alt={displayUser.nom}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className={
                  displayUser.photoProfil
                    ? "hidden"
                    : "flex items-center justify-center w-full h-full"
                }
              >
                {getInitials(displayUser.nom)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {displayUser.nom}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <MapPin size={10} className="mr-1" />
                {displayUser.localisation || "Localisation non spécifiée"}
              </p>
            </div>
          </div>
        )}

        {/* Stats et date */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            {flash.likesCount > 0 && (
              <div className="flex items-center">
                <Heart size={12} className="mr-1" />
                <span>{flash.likesCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs">
            <Calendar size={10} className="mr-1" />
            <span>
              {new Date(
                flash.savedAt || flash.createdAt || Date.now()
              ).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour une publication sauvegardée
function SavedPostCard({ post, onRemove, onNavigate }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.stopPropagation();

    if (window.confirm("Retirer cette publication de vos sauvegardées ?")) {
      setIsRemoving(true);
      try {
      

        const result = await toggleSavePost(post._id || post.id);

        if (result.success) {
          toast.success("Publication retirée des sauvegardées");
          onRemove(post._id || post.id);
        } else {
          toast.error(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du post:", error);
        toast.error("Une erreur est survenue");
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`/post/${post._id || post.id}`);
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  };

  // Sécuriser l'accès aux données
  const displayUser = post.user || post.idTatoueur || {};
  const displayTitle = post.title || post.contenu || post.description || "Publication sauvegardée";
  const displayImage = post.image || post.images?.[0] || null;



  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      {/* Image du post */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback si pas d'image */}
        <div
          className={`w-full h-full flex items-center justify-center text-white ${
            displayImage ? "hidden" : "flex"
          }`}
        >
          <div className="text-center">
            <Image size={32} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Publication</p>
          </div>
        </div>

        {/* Bouton de suppression */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 ${
            isRemoving ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Retirer des sauvegardées"
        >
          {isRemoving ? (
            <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Trash2 size={14} />
          )}
        </button>

        {/* Badge type de contenu */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
            Post
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {displayTitle}
        </h3>

        {/* Informations auteur */}
        {displayUser && displayUser.nom && (
          <div className="flex items-center mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-3">
              {displayUser.photoProfil ? (
                <img
                  src={displayUser.photoProfil}
                  alt={displayUser.nom}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className={
                  displayUser.photoProfil
                    ? "hidden"
                    : "flex items-center justify-center w-full h-full"
                }
              >
                {getInitials(displayUser.nom)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {displayUser.nom}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {displayUser.userType === "tatoueur" ? "Tatoueur" : "Client"}
              </p>
            </div>
          </div>
        )}

        {/* Stats et date de sauvegarde */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {post.likesCount > 0 && (
              <div className="flex items-center">
                <Heart size={12} className="mr-1" />
                <span>{post.likesCount}</span>
              </div>
            )}
            {post.commentsCount > 0 && (
              <div className="flex items-center">
                <MessageCircle size={12} className="mr-1" />
                <span>{post.commentsCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs">
            <Calendar size={10} className="mr-1" />
            <span>
              {new Date(post.savedAt || post.createdAt || Date.now()).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal Wishlist
export default function Wishlist() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // États pour les données
  const [savedContent, setSavedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  // États pour les filtres et la recherche
  const [contentType, setContentType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [refreshing, setRefreshing] = useState(false);

  // Fonction de navigation
  const handleNavigation = (path) => {
   
    navigate(path);
  };

  // Charger le contenu sauvegardé
  const loadSavedContent = async () => {
    if (!isAuthenticated) {
      setError("Vous devez être connecté pour voir votre wishlist");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

   

      const result = await getSavedContent({
        type: contentType,
        page: 1,
        limit: 100,
      });

    

      if (result && result.success) {
        const contentData = result.data || [];
        setSavedContent([...contentData]); // Force un nouveau tableau
        setStats(result.stats || {});
        
        
      } else {
        setError(result?.message || "Erreur lors du chargement");
        console.error("❌ Erreur API:", result?.message);
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement:", err);
      setError("Une erreur est survenue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // Charger au changement de filtre ou au montage
  useEffect(() => {
    loadSavedContent();
  }, [contentType, isAuthenticated]);

 

  // Rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedContent();
    setRefreshing(false);
    toast.success("Contenu rafraîchi");
  };

  // Gérer la suppression d'un élément
  const handleRemoveItem = (itemId) => {

    setSavedContent((prev) =>
      prev.filter((item) => (item._id || item.id) !== itemId)
    );
  };

  // Obtenir le contenu à afficher selon les filtres
  const getDisplayContent = () => {
    let content = [...savedContent];

   

    // Appliquer la recherche
    if (searchQuery) {
      content = content.filter((item) => {
        const searchableText = [
          item.title,
          item.titre,
          item.description,
          item.contenu,
          item.user?.nom,
          item.idTatoueur?.nom,
          item.auteur?.nom,
          item.category,
          item.style,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchQuery.toLowerCase());
      });
      
    }

    // Appliquer le tri
    content.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.savedAt || b.createdAt || 0) -
            new Date(a.savedAt || a.createdAt || 0)
          );
        case "oldest":
          return (
            new Date(a.savedAt || a.createdAt || 0) -
            new Date(b.savedAt || b.createdAt || 0)
          );
        case "popular":
          return (b.likesCount || 0) - (a.likesCount || 0);
        case "type":
          return (a.contentType || "").localeCompare(b.contentType || "");
        default:
          return 0;
      }
    });

    return content;
  };

  const displayContent = getDisplayContent();

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("recent");
    setContentType("all");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Connexion requise
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous devez être connecté pour accéder à votre wishlist
          </p>
          <button
            onClick={() => navigate("/signin")}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Ma Wishlist
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Chargement de votre wishlist...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Ma Wishlist
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center text-red-500">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p className="mb-4 text-gray-900 dark:text-gray-100">
                ❌ {error}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec titre et statistiques */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Ma Wishlist
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Retrouvez tous vos contenus sauvegardés en un seul endroit
            </p>
            {stats && Object.keys(stats).length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.totalPosts || 0} posts • {stats.totalFlashs || 0} flashs • {stats.total || 0} total
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <RotateCcw size={16} />
            )}
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher dans vos sauvegardes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Filtres et tri */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Filtre par type */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Type:
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tout</option>
              <option value="posts">Posts seulement</option>
              <option value="flashs">Flashs seulement</option>
            </select>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trier par:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="recent">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="popular">Plus populaire</option>
              <option value="type">Type de contenu</option>
            </select>
          </div>

          {/* Bouton reset */}
          <button
            onClick={resetFilters}
            className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={14} className="mr-1" />
            Réinitialiser
          </button>
        </div>

        {/* Statistiques détaillées */}
        {savedContent.length > 0 && stats && Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-500">
                {stats.totalPosts || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Posts sauvegardés
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-yellow-500">
                {stats.totalFlashs || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Flashs sauvegardés
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-500">
                {stats.total || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total sauvegardé
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-500">
                {Math.round((stats.total || 0) / 7)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Par semaine
              </div>
            </div>
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : displayContent.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} className="text-gray-400" />
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {searchQuery
                ? "Aucun contenu trouvé"
                : contentType !== "all"
                ? `Aucun ${contentType === "posts" ? "post" : "flash"} sauvegardé`
                : "Aucun contenu sauvegardé"}
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              {searchQuery
                ? "Essayez de modifier vos termes de recherche"
                : contentType !== "all"
                ? `Essayez de changer le filtre ou sauvegardez des ${contentType === "posts" ? "posts" : "flashs"}`
                : "Commencez à sauvegarder des posts et flashs qui vous intéressent"}
            </p>
            {!searchQuery && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/feed")}
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Image size={16} className="mr-2" />
                  Explorer les posts
                </button>
                <button
                  onClick={() => navigate("/flashs")}
                  className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Zap size={16} className="mr-2" />
                  Explorer les flashs
                </button>
              </div>
            )}
          </div>
        ) : (
          <div key={`${contentType}-${displayContent.length}`}>
         
            
            {/* Grille de contenu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayContent.map((item, index) => {
               
                // Déterminer le type de contenu
                const isFlash =
                  item.contentType === "flash" ||
                  item.prix !== undefined ||
                  item.price !== undefined ||
                  item.style !== undefined;

                if (isFlash) {
                  return (
                    <SavedFlashCard
                      key={`flash-${item._id || item.id}-${index}`}
                      flash={item}
                      onRemove={handleRemoveItem}
                      onNavigate={handleNavigation}
                    />
                  );
                } else {
                  return (
                    <SavedPostCard
                      key={`post-${item._id || item.id}-${index}`}
                      post={item}
                      onRemove={handleRemoveItem}
                      onNavigate={handleNavigation}
                    />
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        {displayContent.length > 0 && (
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => {
                setContentType("all");
                setSortBy("recent");
                setSearchQuery("");
              }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={16} className="inline mr-2" />
              Réinitialiser les filtres
            </button>
            <button
              onClick={() => navigate("/search")}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus size={16} className="inline mr-2" />
              Découvrir plus de contenu
            </button>
          </div>
        )}

        {/* Section conseils si contenu vide */}
        {displayContent.length === 0 && !searchQuery && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
              💡 Comment sauvegarder du contenu
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li className="flex items-start">
                <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Cliquez sur l'icône bookmark (🔖) sur les posts qui vous plaisent
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Sauvegardez les flashs de tatoueurs pour vos futurs projets
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Retrouvez facilement vos contenus préférés dans cette wishlist
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Organisez vos inspirations tatouage par catégorie
              </li>
            </ul>
          </div>
        )}

        {/* Informations utilisateur */}
        {user && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Wishlist de{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {user.nom}
            </span>
            {stats.total > 0 && (
              <span>
                {" "}
                • Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        )}

        {/* Footer avec navigation supplémentaire */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Explorez plus de contenu
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/artists")}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                🎨 Découvrir des artistes
              </button>
              <button
                onClick={() => navigate("/styles")}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ✨ Explorer les styles
              </button>
              <button
                onClick={() => navigate("/gallery")}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                📸 Galerie communauté
              </button>
              <button
                onClick={() => navigate("/trending")}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                🔥 Tendances
              </button>
            </div>
          </div>
        </div>

        {/* Call to action final */}
        {displayContent.length === 0 && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">
                🚀 Commencez votre collection !
              </h3>
              <p className="mb-4 opacity-90">
                Découvrez des milliers de créations uniques et construisez votre
                wishlist personnalisée
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/feed")}
                  className="px-6 py-3 bg-white text-red-500 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Explorer maintenant
                </button>
                <button
                  onClick={() => navigate("/how-it-works")}
                  className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  Comment ça marche ?
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}