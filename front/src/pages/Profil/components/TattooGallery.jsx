import React, { useState, useEffect, useContext } from "react";
import { Plus, Edit, Heart, Trash2, Eye, MessageCircle, Share, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicationContext } from "../../../context/PublicationContext";
import { publicationApi } from "../../../api/feed.api";

export default function TattooGallery({
  displayUser,
  isOwnProfile,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onLikeItem,
}) {
  const navigate = useNavigate();
  const { toggleLikePost, toggleSavePost, loading: contextLoading } = useContext(PublicationContext);
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ AJOUT: Fonction pour construire l'URL de l'image (même logique que Post.js)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si l'image commence par http, c'est déjà une URL complète
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Construire l'URL avec le serveur backend
    // const baseUrl = "http://localhost:3000";
    const baseUrl = "https://inkediin.onrender.com";

    
    // Nettoyer le chemin (remplacer \ par /)
    const cleanPath = imagePath.replace(/\\/g, '/');
    
    // S'assurer que le chemin commence par /
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    return `${baseUrl}${finalPath}`;
  };

  // Charger les publications de l'utilisateur
  useEffect(() => {
    if (displayUser?._id) {
      loadUserPublications();
    }
  }, [displayUser?._id]);

  const loadUserPublications = async (page = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      // ✅ CORRECTION: Toujours utiliser getPublicationsByTattooArtist pour récupérer les publications d'un utilisateur spécifique
      response = await publicationApi.getPublicationsByTattooArtist(displayUser._id, {
        page,
        limit: 12
      });

      if (response.publications) {
        const adaptedPublications = response.publications.map(pub => ({
          id: pub._id || pub.id,
          // ✅ CORRECTION: Utiliser getImageUrl pour construire l'URL correcte
          imageUrl: getImageUrl(pub.image),
          title: pub.contenu?.slice(0, 50) + (pub.contenu?.length > 50 ? '...' : '') || 'Sans titre',
          style: pub.tags?.[0] || 'Style non défini',
          contenu: pub.contenu,
          tags: pub.tags || [],
          likes: pub.likes?.length || 0,
          comments: pub.commentaires?.length || 0,
          datePublication: pub.datePublication || pub.createdAt,
          isLiked: pub.likes?.some(like => like.userId === displayUser._id) || false,
          isSaved: false, // À implémenter selon votre logique
          username: pub.idTatoueur?.nom || displayUser.nom,
          artistId: pub.idTatoueur?._id || displayUser._id
        }));

        if (append) {
          setPublications(prev => [...prev, ...adaptedPublications]);
        } else {
          setPublications(adaptedPublications);
        }

        setHasMore(response.publications.length === 12);
        setCurrentPage(page);
      }
    } catch (error) {
      setError('Erreur lors du chargement de la galerie');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    navigate("/uploadpublication");
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadUserPublications(currentPage + 1, true);
    }
  };

  const handleLikePublication = async (publication) => {
    try {
      // Mise à jour optimiste de l'UI
      setPublications(prev => prev.map(pub => 
        pub.id === publication.id 
          ? {
              ...pub,
              isLiked: !pub.isLiked,
              likes: pub.isLiked ? pub.likes - 1 : pub.likes + 1
            }
          : pub
      ));

      // Appel à l'API via le contexte ou directement
      if (toggleLikePost) {
        await toggleLikePost(publication.id);
      } else {
        await publicationApi.toggleLikePublication(publication.id);
      }

      if (onLikeItem) {
        onLikeItem(publication.id);
      }
    } catch (error) {
      // Rollback en cas d'erreur
      setPublications(prev => prev.map(pub => 
        pub.id === publication.id 
          ? {
              ...pub,
              isLiked: !pub.isLiked,
              likes: pub.isLiked ? pub.likes + 1 : pub.likes - 1
            }
          : pub
      ));
    }
  };

  const handleDeletePublication = async (publicationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      return;
    }

    try {
      await publicationApi.deletePublication(publicationId);
      setPublications(prev => prev.filter(pub => pub.id !== publicationId));
      
      if (onDeleteItem) {
        onDeleteItem(publicationId);
      }
    } catch (error) {
      setError('Erreur lors de la suppression');
    }
  };

  const handlePublicationClick = (publication) => {
    setSelectedPublication(publication);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPublication(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      return diffHours === 0 ? 'À l\'instant' : `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // État de chargement
  if (loading && publications.length === 0) {
    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Publications</h2>
          {isOwnProfile && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
          )}
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-red-500" size={32} />
          <span className="ml-3">Chargement des publications...</span>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error && publications.length === 0) {
    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Publications</h2>
          {isOwnProfile && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
          )}
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => loadUserPublications()}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Publications ({publications.length})
          </h2>
          {isOwnProfile && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
          )}
        </div>

        {publications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {isOwnProfile 
                ? "Vous n'avez pas encore publié de contenu" 
                : "Aucune publication disponible"
              }
            </p>
            {isOwnProfile && (
              <button
                onClick={handleAddClick}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Créer votre première publication
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {publications.map((publication) => (
                <div
                  key={publication.id}
                  className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handlePublicationClick(publication)}
                >
                  <div className="w-full h-full relative">
                    {/* ✅ CORRECTION: Vérification et affichage de l'image */}
                    {publication.imageUrl ? (
                      <img
                        src={publication.imageUrl}
                        alt={publication.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // En cas d'erreur de chargement d'image
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback si pas d'image ou erreur de chargement */}
                    <div 
                      className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center ${
                        publication.imageUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm text-center p-2">
                        {publication.contenu?.slice(0, 100) || 'Publication sans image'}
                      </span>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="font-medium text-sm mb-1">{publication.title}</div>
                      <div className="text-xs text-gray-300 mb-2">{publication.style}</div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {publication.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {publication.comments}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                      {!isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePublication(publication);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                            publication.isLiked 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/20 text-white hover:bg-red-500'
                          }`}
                        >
                          <Heart className="w-3 h-3" fill={publication.isLiked ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      
                      {isOwnProfile && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditItem) onEditItem(publication.id);
                            }}
                            className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-blue-500 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePublication(publication.id);
                            }}
                            className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton "Charger plus" */}
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Chargement...
                    </>
                  ) : (
                    'Charger plus'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de détail de publication */}
      {showModal && selectedPublication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedPublication.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedPublication.username}</h3>
                    <p className="text-sm text-gray-500">{formatDate(selectedPublication.datePublication)}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* ✅ CORRECTION: Image dans la modal aussi */}
              {selectedPublication.imageUrl && (
                <img
                  src={selectedPublication.imageUrl}
                  alt={selectedPublication.title}
                  className="w-full rounded-lg mb-4"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}

              <div className="mb-4">
                <p className="text-gray-800 dark:text-gray-200 mb-3">
                  {selectedPublication.contenu}
                </p>
                {selectedPublication.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPublication.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikePublication(selectedPublication)}
                    className={`flex items-center gap-2 transition-colors ${
                      selectedPublication.isLiked 
                        ? 'text-red-500' 
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      size={20} 
                      fill={selectedPublication.isLiked ? 'currentColor' : 'none'} 
                    />
                    {selectedPublication.likes}
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageCircle size={20} />
                    {selectedPublication.comments}
                  </button>
                </div>
                <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <Share size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}