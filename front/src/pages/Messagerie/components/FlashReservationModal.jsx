import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Loader2 } from 'lucide-react';
import { MessagerieContext } from '../../../context/MessagerieContext';
import { messagerieUtils } from '../../../api/messagerie.api';

export default function FlashReservationModal({ 
  isOpen, 
  onClose, 
  flash, 
  tatoueur 
}) {
  const navigate = useNavigate();
  const { createReservationConversation } = useContext(MessagerieContext);
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialiser le message avec un template
  React.useEffect(() => {
    if (flash && isOpen) {
      const template = messagerieUtils.createReservationTemplate(flash);
      setMessage(template);
    }
  }, [flash, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Veuillez saisir un message');
      return;
    }

    // Valider les données
    const reservationData = {
      flashId: flash._id,
      tatoueurId: tatoueur._id,
      contenu: message.trim()
    };

    const validationErrors = messagerieUtils.validateReservationData(reservationData);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer la conversation de réservation
      const response = await createReservationConversation(reservationData);
      
      // Fermer le modal
      onClose();
      
      // Rediriger vers la conversation
      navigate(`/conversation/${response.conversation._id}`, {
        state: {
          contactInfo: {
            id: tatoueur._id,
            name: tatoueur.nom || 'Tatoueur',
            initials: tatoueur.nom?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'TA',
            status: 'Hors ligne',
            userType: 'tatoueur',
            avatar: tatoueur.photoProfil
          }
        }
      });
      
    } catch (err) {
      console.error('Erreur lors de la création de la réservation:', err);
      setError(err.message || 'Erreur lors de la création de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Réserver ce flash
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Flash Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-4">
            {flash.images && flash.images[0] && (
              <img
                src={flash.images[0]}
                alt={flash.titre}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {flash.titre}
              </h3>
              <p className="text-red-500 font-bold text-lg">
                {flash.prix}€
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                par {tatoueur.nom}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message au tatoueur
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez votre message de réservation..."
              rows="4"
              maxLength="500"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <div className="mt-1 text-right">
              <span className={`text-xs ${message.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Info réservation */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Comment ça marche ?
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Votre message sera envoyé au tatoueur</li>
              <li>• Il pourra vous répondre pour confirmer la disponibilité</li>
              <li>• Vous pourrez discuter des détails ensemble</li>
              <li>• Le paiement se fera selon les conditions du tatoueur</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}