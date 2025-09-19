import React, { useState, useContext, useEffect, useCallback } from "react";
import { Plus, Edit, Heart, Eye, MessageCircle, Zap, CheckCircle, Clock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { FlashContext } from "../../../context/FlashContext";

export default function FlashGallery({ 
  displayUser, 
  isOwnProfile, 
  onAddFlash, 
  onEditFlash, 
  onDeleteFlash, 
  onLikeFlash,
  onViewAll
}) {
  const navigate = useNavigate();
  const {
    getFlashesByTatoueur,
    currentUserId,
    toggleLikeFlash,
    deleteFlash,
    hasUserLiked,
    getLikesCount,
  } = useContext(FlashContext);

  const [userFlashs, setUserFlashs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const loadUserFlashs = useCallback(async () => {
    if (!displayUser?._id && !displayUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      const userId = displayUser._id || displayUser.id;
  

      const flashs = await getFlashesByTatoueur(userId, {
        page: 1,
        limit: isOwnProfile ? 6 : 8,
        disponible: isOwnProfile ? undefined : true,
      });

    
      setUserFlashs(flashs);
    } catch (err) {
      console.error("❌ FlashGallery - Erreur chargement flashs:", err);
      setError("Erreur lors du chargement des flashs");
      setUserFlashs([]);
    } finally {
      setLoading(false);
    }
  }, [displayUser?._id, displayUser?.id, isOwnProfile]); // Suppression de getFlashesByTatoueur pour éviter la boucle

  
  useEffect(() => {
    loadUserFlashs();
  }, [displayUser?._id, displayUser?.id, isOwnProfile]); // Utilisation des mêmes dépendances 


  const displayedFlashs = userFlashs.slice(0, isOwnProfile ? 6 : 8);

  
  const handleAddFlash = () => {
    if (onAddFlash) {
      onAddFlash();
    } else {
      navigate("/flashupload");
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else if (isOwnProfile) {
      navigate("/flash/manage");
    } else {
      navigate(`/artiste/${displayUser._id || displayUser.id}/flashs`);
    }
  };

 
  const handleEditFlash = (flashId) => {
    if (onEditFlash) {
      onEditFlash(flashId);
    } else {
    
      navigate(`/flashedit/${flashId}`);
    }
  };

  const handleLikeFlash = async (flash) => {
    try {
      if (onLikeFlash) {
        await onLikeFlash(flash);
      } else {
        await toggleLikeFlash(flash._id || flash.id);
      }
      
      // Mettre à jour localement
      setUserFlashs(prev => prev.map(f => 
        (f._id || f.id) === (flash._id || flash.id) 
          ? { ...f, ...flash }
          : f
      ));
    } catch (err) {
      console.error("❌ Erreur like flash:", err);
    }
  };

  const handleDeleteFlash = async (flashId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce flash ?")) return;

    try {
      if (onDeleteFlash) {
        await onDeleteFlash(flashId);
      } else {
        await deleteFlash(flashId);
      }
      
      // Mettre à jour localement
      setUserFlashs(prev => prev.filter(f => (f._id || f.id) !== flashId));
    } catch (err) {
      console.error("❌ Erreur suppression flash:", err);
      alert("Erreur lors de la suppression du flash");
    }
  };


  const getDisplayStyle = (flash) => {
    if (flash.style === "autre" && flash.styleCustom) {
      return flash.styleCustom;
    }
    return flash.style || "Flash";
  };

 
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  
  const MiniFlashCard = ({ flash }) => {
    const isAvailable = flash.disponible && !flash.reserve;
    const userLiked = hasUserLiked(flash);
    const likesCount = getLikesCount(flash);

    return (
      <div className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
        {/* Image du flash */}
        {flash.image ? (
          <img
            src={flash.image}
            alt={flash.title || "Flash design"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onClick={() => navigate(`/flashdetail/${flash._id || flash.id}`)}
          />
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center"
            onClick={() => navigate(`/flashdetail/${flash._id || flash.id}`)}
          >
            <div className="text-center p-2">
              <Zap size={20} className="text-gray-500 dark:text-gray-300 mx-auto mb-2" />
              <span className="text-gray-500 dark:text-gray-300 text-xs">
                {flash.title || "Flash Design"}
              </span>
            </div>
          </div>
        )}

        {/* Overlay avec informations au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="font-medium text-sm mb-1 truncate">{flash.title || "Sans titre"}</div>
            <div className="text-xs text-gray-300 mb-1">{getDisplayStyle(flash)}</div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">{formatPrice(flash.prix || 0)}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <Heart size={10} />
                  {likesCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={10} />
                  {flash.views || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

    
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleEditFlash(flash._id || flash.id);
              }}
              className="p-2 bg-blue-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100 transition-all"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFlash(flash._id || flash.id);
              }}
              className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100 transition-all"
              title="Supprimer"
            >
              ×
            </button>
          </div>
        )}

        {/* Badge de statut */}
        <div className="absolute top-2 left-2">
          {isAvailable ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle size={8} />
              Libre
            </span>
          ) : flash.reserve ? (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Clock size={8} />
              Réservé
            </span>
          ) : (
            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Indispo
            </span>
          )}
        </div>

        {/* Bouton like pour les autres utilisateurs */}
        {!isOwnProfile && currentUserId && (
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeFlash(flash);
              }}
              className={`p-1 rounded-full transition-colors ${
                userLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart size={12} fill={userLiked ? "currentColor" : "none"} />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">
            {isOwnProfile ? 'Mes flashs disponibles' : 'Flashs disponibles'}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">
            {isOwnProfile ? 'Mes flashs disponibles' : 'Flashs disponibles'}
          </h2>
        </div>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">
          {isOwnProfile ? 'Mes flashs disponibles' : `Flashs de ${displayUser?.nom || 'cet artiste'}`}
        </h2>
        {isOwnProfile ? (
          <div className="flex gap-2">
            <button 
              onClick={handleAddFlash}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
            {userFlashs.length > 0 && (
              <button
                onClick={handleViewAll}
                className="text-red-500 hover:text-red-600 transition-colors text-sm"
              >
                Gérer tout
              </button>
            )}
          </div>
        ) : (
          userFlashs.length > 0 && (
            <button
              onClick={handleViewAll}
              className="text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              Voir tout
            </button>
          )
        )}
      </div>
      
      {displayedFlashs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isOwnProfile 
              ? "Vous n'avez pas encore de flashs" 
              : `${displayUser?.nom || 'Cet artiste'} n'a pas encore publié de flashs`
            }
          </p>
          {isOwnProfile && (
            <button
              onClick={handleAddFlash}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Créer votre premier flash
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedFlashs.map((flash) => (
              <MiniFlashCard key={flash._id || flash.id} flash={flash} />
            ))}
          </div>

          {/* Statistiques des flashs pour le propriétaire */}
          {isOwnProfile && userFlashs.length > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-2 flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total: <span className="font-medium text-gray-900 dark:text-gray-100">{userFlashs.length}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Disponibles: <span className="font-medium text-green-600">{userFlashs.filter(f => f.disponible && !f.reserve).length}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Réservés: <span className="font-medium text-orange-600">{userFlashs.filter(f => f.reserve).length}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Total likes: <span className="font-medium text-red-600">{userFlashs.reduce((acc, f) => acc + getLikesCount(f), 0)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Lien pour voir plus */}
          {userFlashs.length > displayedFlashs.length && (
            <div className="mt-4 text-center">
              <button
                onClick={handleViewAll}
                className="text-red-500 hover:text-red-600 transition-colors text-sm"
              >
                Voir {userFlashs.length - displayedFlashs.length} flashs de plus →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}