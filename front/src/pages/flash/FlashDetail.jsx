import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
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
  Trash2
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
    currentUserId 
  } = useContext(FlashContext);

  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Charger les données du Flash
  useEffect(() => {
    const loadFlash = async () => {
      try {
        setLoading(true);
        console.log('🔍 FlashDetail - Chargement Flash ID:', id);
        
        const flashData = await getFlashById(id);
        console.log('✅ FlashDetail - Flash chargé:', flashData);
        
        setFlash(flashData);
        
        // Calculer les likes
        const likes = flashData.likes || [];
        setLikesCount(likes.length);
        setIsLiked(likes.some(like => 
          (like.userId?._id || like.userId) === currentUserId
        ));
        
      } catch (err) {
        console.error('❌ FlashDetail - Erreur chargement:', err);
        setError('Flash non trouvé ou erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFlash();
    }
  }, [id, getFlashById, currentUserId]);

  // Gestion du like
  const handleLike = async () => {
    try {
      console.log('👍 FlashDetail - Toggle like');
      await toggleLikeFlash(id);
      
      // Mise à jour optimiste
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      
    } catch (err) {
      console.error('❌ Erreur like Flash:', err);
      alert('Erreur lors du like');
    }
  };

  // Gestion de la réservation
  const handleReservation = async () => {
    try {
      console.log('📅 FlashDetail - Réservation Flash');
      await reserveFlash(id);
      
      // Mettre à jour le flash
      setFlash(prev => ({ ...prev, reserve: true }));
      setShowReservationModal(false);
      alert('Flash réservé avec succès !');
      
    } catch (err) {
      console.error('❌ Erreur réservation Flash:', err);
      alert('Erreur lors de la réservation');
    }
  };

  // Partage
  const handleShare = async () => {
    const url = window.location.href;
    const text = `Découvrez ce Flash de ${flash?.idTatoueur?.nom} à ${flash?.prix}€`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Flash Tattoo', text, url });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback copie dans le presse-papier
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier !');
    }
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  // Composant Avatar
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
      <div className={`${size} rounded-full overflow-hidden bg-gray-600 flex-shrink-0`}>
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
          <h1 className="text-xl font-bold text-white mb-2">Flash non trouvé</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/flash')}
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
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-blue-400">
                      <Edit size={16} />
                      Modifier
                    </button>
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-red-400">
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
                  imageLoaded ? 'opacity-100' : 'opacity-0'
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
                  <h2 className="font-bold text-lg">{flash.idTatoueur?.nom || 'Artiste'}</h2>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <MapPin size={12} />
                    {flash.idTatoueur?.ville || 'Localisation non renseignée'}
                  </p>
                </div>
              </Link>
            </div>

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
                  <p className="font-medium">{formatDate(flash.date || flash.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Statut</span>
                  <p className="font-medium">
                    {isAvailable ? 'Libre' : flash.reserve ? 'Réservé' : 'Indisponible'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Like et réservation */}
              <div className="flex gap-3">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isLiked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Heart size={18} fill={isLiked ? 'white' : 'none'} />
                  {isLiked ? 'Aimé' : 'J\'aime'} ({likesCount})
                </button>

                {!isOwnFlash && isAvailable && (
                  <button
                    onClick={() => setShowReservationModal(true)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} />
                    Réserver
                  </button>
                )}
              </div>

              {/* Contact artiste */}
              {!isOwnFlash && (
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Contacter l'artiste
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Flash similaires */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Autres Flash de {flash.idTatoueur?.nom}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Placeholder pour les flash similaires */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 aspect-square rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Contacter {flash.idTatoueur?.nom}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {flash.idTatoueur?.email && (
                <a
                  href={`mailto:${flash.idTatoueur.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Mail size={20} className="text-blue-400" />
                  <span>Envoyer un email</span>
                </a>
              )}
              
              {flash.idTatoueur?.telephone && (
                <a
                  href={`tel:${flash.idTatoueur.telephone}`}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Phone size={20} className="text-green-400" />
                  <span>Appeler</span>
                </a>
              )}
              
              {flash.idTatoueur?.instagram && (
                <a
                  href={`https://instagram.com/${flash.idTatoueur.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Instagram size={20} className="text-pink-400" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de réservation */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Réserver ce Flash</h3>
              <button
                onClick={() => setShowReservationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">Flash sélectionné</p>
                <div className="flex items-center gap-3">
                  <img
                    src={flash.image}
                    alt="Flash"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold">{flash.idTatoueur?.nom}</p>
                    <p className="text-lg font-bold text-green-400">{flash.prix?.toFixed(2)}€</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">
                En réservant ce Flash, vous confirmez votre intention de le faire tatouer. 
                L'artiste vous contactera pour fixer un rendez-vous.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReservation}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-600"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}