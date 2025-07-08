import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, MapPin, DollarSign, Ruler, Palette, Calendar, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import { ReservationContext } from '../../context/ReservationContext';
import { reservationUtils } from '../../api/reservations.api';

export default function CustomReservationModal({ 
  isOpen, 
  onClose, 
  tatoueur 
}) {
  const navigate = useNavigate();
  const { createCustomReservation } = useContext(ReservationContext);
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    style: '',
    styleCustom: '',
    size: '',
    placement: '',
    budget: '',
    preferredDates: '',
    referenceImages: [],
    additionalNotes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Styles de tatouage prédéfinis
  const tattooStyles = [
    'Réaliste', 'Traditional', 'Old School', 'New School', 'Néo-Traditionnel',
    'Japonais', 'Tribal', 'Géométrique', 'Blackwork', 'Dotwork',
    'Watercolor', 'Sketch', 'Biomécanique', 'Mandala', 'Minimaliste', 'Autre'
  ];

  // Tailles prédéfinies
  const sizes = [
    'Très petit (2-5cm)', 'Petit (5-10cm)', 'Moyen (10-15cm)', 
    'Grand (15-25cm)', 'Très grand (25cm+)', 'Sleeve partiel', 'Sleeve complet'
  ];

  // Emplacements prédéfinis
  const placements = [
    'Avant-bras', 'Arrière-bras', 'Biceps', 'Épaule', 'Poitrine', 'Dos',
    'Jambe', 'Mollet', 'Cuisse', 'Cheville', 'Pied', 'Main', 'Doigt',
    'Cou', 'Nuque', 'Côtes', 'Ventre', 'Autre'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  // Gestion des images de référence
  const handleImageUpload = (files) => {
    const newImages = Array.from(files).slice(0, 5 - formData.referenceImages.length);
    setFormData(prev => ({
      ...prev,
      referenceImages: [...prev.referenceImages, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index)
    }));
  };

  // Gestion du drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.projectTitle.trim()) {
      setError('Le titre du projet est requis');
      return;
    }

    if (!formData.description.trim()) {
      setError('La description est requise');
      return;
    }

    if (!formData.style) {
      setError('Le style est requis');
      return;
    }

    if (!formData.size) {
      setError('La taille est requise');
      return;
    }

    if (!formData.placement) {
      setError('L\'emplacement est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Préparer les données de réservation
      const reservationData = {
        tatoueurId: tatoueur._id,
        type: 'custom',
        projectTitle: formData.projectTitle.trim(),
        description: formData.description.trim(),
        style: formData.style === 'Autre' ? formData.styleCustom : formData.style,
        size: formData.size,
        placement: formData.placement,
        budget: formData.budget ? parseInt(formData.budget) : null,
        preferredDates: formData.preferredDates,
        additionalNotes: formData.additionalNotes,
        referenceImages: formData.referenceImages // Sera traité côté serveur
      };

      // Valider les données
      const validationErrors = reservationUtils.validateCustomReservation(reservationData);
      if (validationErrors.length > 0) {
        setError(validationErrors[0]);
        return;
      }

      const response = await createCustomReservation(reservationData);
      
      // Fermer le modal
      onClose();
      
      // Rediriger vers la conversation
      if (response.conversationId) {
        navigate(`/conversation/${response.conversationId}`, {
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
      }
      
    } catch (err) {
      console.error('Erreur lors de la création de la réservation:', err);
      setError(err.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        projectTitle: '',
        description: '',
        style: '',
        styleCustom: '',
        size: '',
        placement: '',
        budget: '',
        preferredDates: '',
        referenceImages: [],
        additionalNotes: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <Palette className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Demande de tatouage personnalisé
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

        {/* Artiste Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-4">
            {tatoueur.photoProfil ? (
              <img
                src={tatoueur.photoProfil}
                alt={tatoueur.nom}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-400 text-white flex items-center justify-center text-lg font-medium">
                {tatoueur.nom?.charAt(0) || 'T'}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {tatoueur.nom}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {tatoueur.localisation || 'Localisation non renseignée'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message d'erreur */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Titre du projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre du projet *
            </label>
            <input
              type="text"
              placeholder="Ex: Tatouage dragon japonais sur l'épaule"
              value={formData.projectTitle}
              onChange={(e) => handleInputChange('projectTitle', e.target.value)}
              disabled={loading}
              maxLength="100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <div className="mt-1 text-right">
              <span className="text-xs text-gray-500">
                {formData.projectTitle.length}/100
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description détaillée *
            </label>
            <textarea
              placeholder="Décrivez votre projet en détail : style souhaité, éléments à inclure, inspiration, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading}
              rows="4"
              maxLength="2000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <div className="mt-1 text-right">
              <span className={`text-xs ${formData.description.length > 1800 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.description.length}/2000
              </span>
            </div>
          </div>

          {/* Style et Taille */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Style *
              </label>
              <select
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="">Sélectionner un style</option>
                {tattooStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
              
              {formData.style === 'Autre' && (
                <input
                  type="text"
                  placeholder="Précisez le style..."
                  value={formData.styleCustom}
                  onChange={(e) => handleInputChange('styleCustom', e.target.value)}
                  disabled={loading}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Taille approximative *
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="">Sélectionner une taille</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Emplacement et Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Emplacement *
              </label>
              <select
                value={formData.placement}
                onChange={(e) => handleInputChange('placement', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="">Sélectionner un emplacement</option>
                {placements.map((placement) => (
                  <option key={placement} value={placement}>{placement}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget approximatif (€)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Ex: 500"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  disabled={loading}
                  min="0"
                  max="10000"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Dates préférées */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dates préférées (optionnel)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ex: Disponible en semaine, éviter juillet..."
                value={formData.preferredDates}
                onChange={(e) => handleInputChange('preferredDates', e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Images de référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images de référence (max 5)
            </label>
            
            {/* Zone de drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
              } ${formData.referenceImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (formData.referenceImages.length < 5) {
                  document.getElementById('reference-upload').click();
                }
              }}
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.referenceImages.length >= 5 
                  ? 'Maximum d\'images atteint'
                  : 'Cliquez ou glissez vos images ici'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG jusqu'à 5MB chacune
              </p>
            </div>

            <input
              id="reference-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              disabled={loading || formData.referenceImages.length >= 5}
            />

            {/* Aperçu des images */}
            {formData.referenceImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {formData.referenceImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Référence ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes additionnelles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes additionnelles (optionnel)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                placeholder="Informations supplémentaires, contraintes particulières..."
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                disabled={loading}
                rows="3"
                maxLength="500"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div className="mt-1 text-right">
              <span className="text-xs text-gray-500">
                {formData.additionalNotes.length}/500
              </span>
            </div>
          </div>

          {/* Info importante */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Comment ça fonctionne ?
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Votre demande sera envoyée directement au tatoueur</li>
              <li>• Il pourra vous répondre pour discuter du projet et donner un devis</li>
              <li>• Vous pourrez échanger ensemble sur tous les détails</li>
              <li>• Le rendez-vous sera fixé d'un commun accord</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
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
              disabled={loading || !formData.projectTitle.trim() || !formData.description.trim() || !formData.style || !formData.size || !formData.placement}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Envoi en cours...
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