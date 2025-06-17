import React, { useState } from 'react';
import { MessageCircle, Heart, Share2 } from 'lucide-react';
import FlashReservationModal from './FlashReservationModal';

export default function FlashCardWithReservation({ flash, tatoueur, onLike, onShare }) {
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(flash._id, !isLiked);
  };

  const handleShare = () => {
    if (onShare) onShare(flash);
  };

  const handleReservation = () => {
    setShowReservationModal(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Image du flash */}
        <div className="relative">
          {flash.images && flash.images[0] && (
            <img
              src={flash.images[0]}
              alt={flash.titre}
              className="w-full h-64 object-cover"
            />
          )}
          
          {/* Badge de prix */}
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
            {flash.prix}€
          </div>
          
          {/* Badge de disponibilité */}
          {flash.disponible && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Disponible
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* Titre et description */}
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            {flash.titre}
          </h3>
          
          {flash.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {flash.description}
            </p>
          )}

          {/* Informations du tatoueur */}
          <div className="flex items-center mb-4">
            {tatoueur.photoProfil ? (
              <img
                src={tatoueur.photoProfil}
                alt={tatoueur.nom}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-400 text-white flex items-center justify-center text-sm font-medium">
                {tatoueur.nom?.charAt(0) || 'T'}
              </div>
            )}
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {tatoueur.nom}
              </p>
              {tatoueur.ville && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tatoueur.ville}
                </p>
              )}
            </div>
          </div>

          {/* Tags/Catégories */}
          {flash.tags && flash.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {flash.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {flash.tags.length > 3 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{flash.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            {/* Boutons d'interaction */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isLiked 
                    ? 'text-red-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{flash.likes || 0}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </button>
            </div>

            {/* Bouton de réservation */}
            {flash.disponible && (
              <button
                onClick={handleReservation}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Réserver</span>
              </button>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                {flash.taille && `Taille: ${flash.taille}`}
              </span>
              <span>
                Publié {new Date(flash.dateCreation).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      <FlashReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        flash={flash}
        tatoueur={tatoueur}
      />
    </>
  );
}