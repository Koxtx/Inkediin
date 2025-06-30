import React, { useState, useEffect, useContext } from "react";
import { Plus, Edit, Trash2, Eye, Heart, Filter, Search, Grid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import de votre contexte existant
import { FlashContext } from "../../../context/FlashContext";

export default function FlashManagement() {
  const navigate = useNavigate();
  
  // Utilisation de votre FlashContext existant
  const {
    allFlashes,
    loading,
    error,
    deleteFlash,
    refreshData,
    clearError,
    searchFlashes,
    loadMoreFlashes,
    hasMore,
    isFlashSaved,
    hasUserLiked,
    getLikesCount,
    toggleLikeFlash,
    toggleSaveFlash,
    reserveFlash
  } = useContext(FlashContext);

  // États pour l'interface
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  
  // États pour les actions
  const [actionLoading, setActionLoading] = useState({});

  // Charger les données au montage
  useEffect(() => {
    if (allFlashes.length === 0 && !loading) {
      refreshData();
    }
  }, []);

  // Gestion de la recherche avec debounce
  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // Si recherche vide, recharger toutes les données
      refreshData();
    }
  }, [searchTerm]);

  // Fonction de recherche
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const searchParams = {
        // Recherche dans le titre et la description
        search: searchTerm,
        // Autres filtres
        ...(filterStatus !== "all" && {
          disponible: filterStatus === "available" ? true : filterStatus === "reserved" ? false : undefined
        }),
        sortBy: sortBy === "recent" ? "date" : sortBy === "popular" ? "likes" : "prix",
        order: sortBy === "price" ? "asc" : "desc"
      };
      
      await searchFlashes(searchParams);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
    }
  };

  // Filtrage côté client des flashs chargés
  const filteredFlashs = allFlashes
    .filter(flash => {
      // Filtre par recherche (si pas de recherche API active)
      if (searchTerm && !loading) {
        const matchesSearch = flash.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             flash.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             flash.description?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
      }

      // Filtre par statut
      if (filterStatus === "available") {
        return flash.disponible && !flash.reserve;
      } else if (filterStatus === "reserved") {
        return flash.reserve || !flash.disponible;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Tri côté client
      switch (sortBy) {
        case "popular":
          return getLikesCount(b) - getLikesCount(a);
        case "price":
          return (a.prix || 0) - (b.prix || 0);
        case "recent":
        default:
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      }
    });

  
  const handleEditFlash = (flashId) => {
 
    navigate(`/flashedit/${flashId}`);
  };


  const handleCreateFlash = () => {
   
    navigate("/flashupload");
  };

  // Fonction pour gérer le toggle de disponibilité/réservation
  const handleToggleAvailability = async (flashId) => {
    try {
      setActionLoading(prev => ({ ...prev, [flashId]: true }));
      await reserveFlash(flashId);
    } catch (err) {
      console.error("Erreur toggle disponibilité:", err);
      alert("Erreur lors du changement de statut");
    } finally {
      setActionLoading(prev => ({ ...prev, [flashId]: false }));
    }
  };

  // Fonction pour supprimer un flash
  const handleDeleteFlash = async (flashId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce flash ?")) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [flashId]: true }));
      await deleteFlash(flashId);
    } catch (err) {
      console.error("Erreur suppression flash:", err);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(prev => ({ ...prev, [flashId]: false }));
    }
  };

  // Fonction pour liker un flash
  const handleLikeFlash = async (flashId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`like_${flashId}`]: true }));
      await toggleLikeFlash(flashId);
    } catch (err) {
      console.error("Erreur like flash:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [`like_${flashId}`]: false }));
    }
  };

  // Fonction pour charger plus de flashs
  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    
    try {
      await loadMoreFlashes();
    } catch (err) {
      console.error("Erreur chargement plus de flashs:", err);
    }
  };

  // Composant GridView
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFlashs.map((flash) => {
        const flashId = flash._id || flash.id;
        const isLiked = hasUserLiked(flash);
        const likesCount = getLikesCount(flash);
        const isSaved = isFlashSaved(flashId);
        
        return (
          <div key={flashId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image placeholder */}
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 relative group">
              {flash.imageUrl || flash.image ? (
                <img 
                  src={flash.imageUrl || flash.image} 
                  alt={flash.title || "Flash tattoo"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-300 text-sm text-center p-4">
                    {flash.title || "Flash sans titre"}
                  </span>
                </div>
              )}
              
              {/* Overlay avec actions - utilise handleEditFlash */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => handleLikeFlash(flashId)}
                  disabled={actionLoading[`like_${flashId}`]}
                  className={`p-2 rounded-full text-white transition-colors ${
                    isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                >
                  <Heart size={16} fill={isLiked ? "white" : "none"} />
                </button>
                <button 
                  onClick={() => handleEditFlash(flashId)}
                  className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteFlash(flashId)}
                  disabled={actionLoading[flashId]}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Badge de statut */}
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  flash.disponible && !flash.reserve
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {flash.disponible && !flash.reserve ? 'Disponible' : 'Réservé'}
                </span>
              </div>

              {/* Badge sauvegardé */}
              {isSaved && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Favori
                  </span>
                </div>
              )}
            </div>

            {/* Informations du flash */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {flash.title || "Flash sans titre"}
                </h3>
                <span className="text-lg font-bold text-red-500">{flash.prix}€</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{flash.style}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">
                {flash.description}
              </p>
              
              {/* Artiste */}
              {flash.idTatoueur && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  Par: {flash.idTatoueur.nom || flash.idTatoueur.name || "Artiste"}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {flash.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} />
                    {likesCount}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleAvailability(flashId)}
                  disabled={actionLoading[flashId]}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    flash.disponible && !flash.reserve
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {actionLoading[flashId] ? '...' : 
                   (flash.disponible && !flash.reserve ? 'Marquer réservé' : 'Marquer disponible')}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Composant ListView (similaire mais en tableau)
  const ListView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Flash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Style
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredFlashs.map((flash) => {
              const flashId = flash._id || flash.id;
              const isLiked = hasUserLiked(flash);
              const likesCount = getLikesCount(flash);
              
              return (
                <tr key={flashId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex-shrink-0 mr-4 flex items-center justify-center overflow-hidden">
                        {flash.imageUrl || flash.image ? (
                          <img 
                            src={flash.imageUrl || flash.image} 
                            alt={flash.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">IMG</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {flash.title || "Flash sans titre"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-48">
                          {flash.description}
                        </div>
                        {flash.idTatoueur && (
                          <div className="text-xs text-gray-400">
                            {flash.idTatoueur.nom || flash.idTatoueur.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                      {flash.style || "Non défini"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-red-500">{flash.prix}€</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flash.disponible && !flash.reserve
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {flash.disponible && !flash.reserve ? 'Disponible' : 'Réservé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {flash.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {likesCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleLikeFlash(flashId)}
                        disabled={actionLoading[`like_${flashId}`]}
                        className={`${isLiked ? 'text-red-600' : 'text-gray-600'} hover:text-red-900`}
                      >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => handleEditFlash(flashId)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier le flash"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteFlash(flashId)}
                        disabled={actionLoading[flashId]}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer le flash"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(flashId)}
                        disabled={actionLoading[flashId]}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          flash.disponible && !flash.reserve
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                        }`}
                      >
                        {actionLoading[flashId] ? '...' : 
                         (flash.disponible && !flash.reserve ? 'Réserver' : 'Libérer')}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Flashs</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos designs disponibles et leurs statuts</p>
        </div>
        <button
          onClick={handleCreateFlash}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus size={20} />
          Nouveau Flash
        </button>
      </div>

      {/* Affichage d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Barre de contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un flash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Filtre par statut */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="all">Tous les statuts</option>
                <option value="available">Disponibles</option>
                <option value="reserved">Réservés</option>
              </select>
            </div>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="recent">Plus récents</option>
              <option value="popular">Plus populaires</option>
              <option value="price">Prix croissant</option>
            </select>

            {/* Mode d'affichage */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total: </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{allFlashes.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Disponibles: </span>
            <span className="font-medium text-green-600">
              {allFlashes.filter(f => f.disponible && !f.reserve).length}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Réservés: </span>
            <span className="font-medium text-red-600">
              {allFlashes.filter(f => f.reserve || !f.disponible).length}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Résultats: </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{filteredFlashs.length}</span>
          </div>
        </div>
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Chargement des flashs...</div>
        </div>
      )}

      {/* Contenu principal */}
      {!loading && filteredFlashs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "Aucun flash ne correspond à vos critères de recherche." 
              : "Vous n'avez pas encore de flashs."
            }
          </div>
          {(!searchTerm && filterStatus === "all") && (
            <button
              onClick={handleCreateFlash}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Créer votre premier flash
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? <GridView /> : <ListView />}
          
          {/* Bouton charger plus */}
          {hasMore && !loading && (
            <div className="text-center py-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Charger plus de flashs
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}