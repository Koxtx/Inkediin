import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Bookmark, Image, Zap, Filter, RotateCcw } from "lucide-react";
import { getSavedContent, toggleSavePost, toggleSaveFlash } from "../../../api/auth.api";
import toast from "react-hot-toast";

// Composant pour afficher un post sauvegardé
function SavedPostItem({ post, onUnsave }) {
  const [isUnsaving, setIsUnsaving] = useState(false);
  const navigate = useNavigate();

  const handleUnsave = async (e) => {
    e.stopPropagation();
    
    setIsUnsaving(true);
    try {
      const result = await toggleSavePost(post._id || post.id);
      
      if (result.success) {
        toast.success("Post retiré des sauvegardés");
        onUnsave(post._id || post.id);
      } else {
        toast.error(result.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsUnsaving(false);
    }
  };

  // ✅ CORRECTION: Navigation vers le détail du post
  const handleClick = () => {
    navigate(`/post/${post._id || post.id}`);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  // ✅ CORRECTION: Sécuriser l'accès aux données pour les POSTS
  const displayUser = post.user || post.idTatoueur || {};
  const displayTitle = post.title || (post.contenu ? post.contenu.substring(0, 100) + '...' : "Publication sauvegardée");
  const displayImage = post.image || post.images?.[0] || null;

  // ✅ CORRECTION: Gérer les likes et commentaires de manière sécurisée
  const likesCount = post.likesCount || 
                   (Array.isArray(post.likes) ? post.likes.length : 0) || 
                   0;
  
  const commentsCount = post.commentsCount || 
                       post.commentaires?.length || 
                       post.comments || 
                       0;

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Image du post */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback si pas d'image */}
        <div className={`w-full h-full flex items-center justify-center text-white ${displayImage ? 'hidden' : 'flex'}`}>
          <div className="text-center">
            <Image size={32} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Publication</p>
          </div>
        </div>
        
        {/* Actions overlay */}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleUnsave}
            disabled={isUnsaving}
            className={`p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors ${
              isUnsaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Retirer des sauvegardés"
          >
            {isUnsaving ? (
              <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Bookmark size={14} className="fill-current" />
            )}
          </button>
        </div>

        {/* Badge type de contenu */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
            Post
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Titre et description */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {displayTitle}
          </h3>
          {post.description && post.description !== displayTitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {post.description}
            </p>
          )}
        </div>

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
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={displayUser.photoProfil ? 'hidden' : 'flex items-center justify-center w-full h-full'}>
                {getInitials(displayUser.nom)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {displayUser.nom}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {displayUser.userType === 'tatoueur' ? 'Tatoueur' : 'Client'}
              </p>
            </div>
          </div>
        )}

        {/* ✅ CORRECTION: Stats avec gestion sécurisée des nombres */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {likesCount > 0 && (
              <span className="flex items-center">
                <Heart size={12} className="mr-1" />
                <span>{likesCount}</span>
              </span>
            )}
            {commentsCount > 0 && (
              <span>{commentsCount} commentaire{commentsCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <span>
            {new Date(post.savedAt || post.createdAt || Date.now()).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher un flash sauvegardé
function SavedFlashItem({ flash, onUnsave }) {
  const [isUnsaving, setIsUnsaving] = useState(false);
  const navigate = useNavigate();

  const handleUnsave = async (e) => {
    e.stopPropagation();
    
    setIsUnsaving(true);
    try {
      const result = await toggleSaveFlash(flash._id || flash.id);
      
      if (result.success) {
        toast.success("Flash retiré des sauvegardés");
        onUnsave(flash._id || flash.id);
      } else {
        toast.error(result.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsUnsaving(false);
    }
  };

  // ✅ CORRECTION: Navigation vers flashdetail avec l'ID comme paramètre (selon la route du router)
  const handleClick = () => {
    navigate(`/flashdetail/${flash._id || flash.id}`);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  // ✅ CORRECTION: Sécuriser l'accès aux données pour les FLASHS
  const displayUser = flash.user || flash.idTatoueur || {};
  const displayTitle = flash.title || flash.description || "Flash sauvegardé";
  const displayImage = flash.image || flash.images?.[0] || null;
  const displayPrice = flash.price || flash.prix;

  // ✅ CORRECTION: Gérer les likes de manière sécurisée
  const likesCount = flash.likesCount || 
                    (Array.isArray(flash.likes) ? flash.likes.length : 0) || 
                    0;

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Image du flash */}
      <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 relative overflow-hidden">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback si pas d'image */}
        <div className={`w-full h-full flex items-center justify-center text-white ${displayImage ? 'hidden' : 'flex'}`}>
          <div className="text-center">
            <Zap size={32} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Flash</p>
          </div>
        </div>
        
        {/* Actions overlay */}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleUnsave}
            disabled={isUnsaving}
            className={`p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors ${
              isUnsaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Retirer des sauvegardés"
          >
            {isUnsaving ? (
              <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Bookmark size={14} className="fill-current" />
            )}
          </button>
        </div>

        {/* Badge type de contenu */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500 text-white">
            Flash
          </span>
        </div>

        {/* Prix si disponible */}
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
        {/* Titre et style */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {displayTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Style: {flash.style || flash.displayStyle || "Non spécifié"}
          </p>
          {flash.description && flash.description !== displayTitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {flash.description}
            </p>
          )}
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
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={displayUser.photoProfil ? 'hidden' : 'flex items-center justify-center w-full h-full'}>
                {getInitials(displayUser.nom)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {displayUser.nom}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {displayUser.localisation || 'Localisation non spécifiée'}
              </p>
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            {flash.available !== false && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Disponible
              </span>
            )}
            {likesCount > 0 && (
              <span className="flex items-center">
                <Heart size={12} className="mr-1" />
                <span>{likesCount}</span>
              </span>
            )}
          </div>
          <span>
            {new Date(flash.savedAt || flash.createdAt || Date.now()).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ClientSavedContent({ isOwnProfile, onItemClick }) {
  const [savedContent, setSavedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentType, setContentType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({});

  // ✅ CORRECTION: Debug des données reçues
  useEffect(() => {
    console.log('🔍 ClientSavedContent - État actuel:', {
      savedContent: savedContent.length,
      contentType,
      loading,
      error,
      stats
    });
    
    if (savedContent.length > 0) {
      console.log('📄 Premier élément sauvegardé:', savedContent[0]);
    }
  }, [savedContent, contentType, loading, error, stats]);

  // Charger le contenu sauvegardé
  useEffect(() => {
    const loadSavedContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📤 Chargement contenu sauvegardé, type:', contentType);
        
        const result = await getSavedContent({
          type: contentType,
          page: 1,
          limit: 50
        });
        
        console.log('📥 Résultat API getSavedContent:', result);
        
        if (result.success) {
          setSavedContent(result.data || []);
          setStats(result.stats || {});
          
          console.log('✅ Contenu sauvegardé chargé:', {
            items: result.data?.length || 0,
            stats: result.stats
          });
        } else {
          setError(result.message || 'Erreur lors du chargement');
          console.error('❌ Erreur API:', result.message);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement du contenu sauvegardé:', err);
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    loadSavedContent();
  }, [contentType]);

  // Gérer la suppression d'un élément
  const handleRemoveItem = (itemId) => {
    console.log('🗑️ Suppression item:', itemId);
    setSavedContent(prev => prev.filter(item => (item._id || item.id) !== itemId));
  };

  // Filtrer et trier le contenu
  const filteredAndSortedContent = React.useMemo(() => {
    let filtered = [...savedContent];

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.savedAt || b.createdAt || 0) - new Date(a.savedAt || a.createdAt || 0);
        case 'oldest':
          return new Date(a.savedAt || a.createdAt || 0) - new Date(b.savedAt || b.createdAt || 0);
        case 'type':
          return (a.contentType || '').localeCompare(b.contentType || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [savedContent, sortBy]);

  if (loading) {
    return (
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-4">
          {isOwnProfile ? "Mes contenus sauvegardés" : "Contenus sauvegardés"}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-4">
          {isOwnProfile ? "Mes contenus sauvegardés" : "Contenus sauvegardés"}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center text-red-500">
            <p className="mb-4">❌ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      {/* Header avec titre et statistiques */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">
            {isOwnProfile ? "Mes contenus sauvegardés" : "Contenus sauvegardés"}
          </h2>
          {stats && Object.keys(stats).length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalPosts || 0} posts • {stats.totalFlashs || 0} flashs • {stats.total || 0} total
            </p>
          )}
        </div>
      </div>

      {/* Filtres et tri */}
      {savedContent.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
            >
              <option value="all">Tout</option>
              <option value="posts">Posts seulement</option>
              <option value="flashs">Flashs seulement</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Trier par:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
            >
              <option value="recent">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="type">Type de contenu</option>
            </select>
          </div>
        </div>
      )}

      {/* Liste du contenu */}
      {filteredAndSortedContent.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {contentType !== 'all' ? 'Aucun contenu avec ce filtre' : 'Aucun contenu sauvegardé'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isOwnProfile 
                ? contentType !== 'all'
                  ? 'Essayez de changer le filtre ou sauvegardez du contenu'
                  : 'Commencez à sauvegarder des posts et flashs qui vous intéressent'
                : 'Cet utilisateur n\'a pas encore de contenu sauvegardé'
              }
            </p>
            {isOwnProfile && (
              <div className="flex justify-center space-x-4">
                <Link
                  to="/feed"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Image size={16} className="mr-2" />
                  Explorer les posts
                </Link>
                <Link
                  to="/flashs"
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Zap size={16} className="mr-2" />
                  Explorer les flashs
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedContent.map((item) => {
            // ✅ CORRECTION: Meilleure détection du type de contenu
            const isFlash = item.contentType === 'flash' || 
                           item.prix !== undefined || 
                           item.price !== undefined ||
                           item.style !== undefined;
            
            console.log('🔍 Rendu item:', {
              id: item._id || item.id,
              type: item.contentType,
              isFlash,
              hasUser: !!(item.user || item.idTatoueur),
              title: item.title,
              image: item.image || item.images?.[0]
            });

            if (isFlash) {
              return (
                <SavedFlashItem
                  key={item._id || item.id}
                  flash={item}
                  onUnsave={handleRemoveItem}
                />
              );
            } else {
              return (
                <SavedPostItem
                  key={item._id || item.id}
                  post={item}
                  onUnsave={handleRemoveItem}
                />
              );
            }
          })}
        </div>
      )}

      {/* Section conseils si contenu vide */}
      {isOwnProfile && savedContent.length === 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Comment sauvegarder du contenu
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Cliquez sur l'icône bookmark sur les posts qui vous plaisent</li>
            <li>• Sauvegardez les flashs de tatoueurs pour plus tard</li>
            <li>• Retrouvez facilement vos contenus préférés ici</li>
            <li>• Organisez vos inspirations tatouage</li>
          </ul>
        </div>
      )}

      {/* Statistiques détaillées */}
      {savedContent.length > 0 && isOwnProfile && stats && Object.keys(stats).length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-500">{stats.totalPosts || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Posts sauvegardés</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-500">{stats.totalFlashs || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Flashs sauvegardés</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-500">{stats.total || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total sauvegardé</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-500">
              {savedContent.length > 0 ? Math.round(savedContent.length / 7) : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Par semaine</div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      {isOwnProfile && savedContent.length > 0 && (
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => {
              setContentType('all');
              setSortBy('recent');
            }}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={16} className="mr-2" />
            Réinitialiser les filtres
          </button>
          
          <Link
            to="/search"
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Filter size={16} className="mr-2" />
            Découvrir plus de contenu
          </Link>
        </div>
      )}
    </div>
  );
}