import React, { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { update, updateAvatar } from "../../../api/auth.api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Camera,
  User,
  MapPin,
  MessageSquare,
  Palette,
  Upload,
  X,
} from "lucide-react";

export default function ModifierProfil({ onBack }) {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    localisation: "",
    bio: "",
    styles: "",
    photoProfil: "",
  });

  // ✅ NOUVEAU: État pour gérer l'upload d'image
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialiser le formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        email: user.email || "",
        localisation: user.localisation || "",
        bio: user.bio || "",
        styles: user.styles || "",
        photoProfil: user.photoProfil || "",
      });
      // Initialiser la prévisualisation avec la photo existante
      setImagePreview(user.photoProfil || null);
    }
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // ✅ NOUVEAU: Validation d'image
  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      return { valid: false, error: 'Aucun fichier sélectionné' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Type de fichier non autorisé. Types acceptés: JPEG, PNG, WebP` 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Le fichier est trop volumineux. Taille maximale: 5MB` 
      };
    }

    return { valid: true };
  };

  // ✅ MODIFICATION: Nouvelle gestion de l'upload d'avatar avec Cloudinary
  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Valider le fichier
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      try {
        setUploadingAvatar(true);
        
        // Créer une prévisualisation locale
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        // Stocker le fichier pour l'upload plus tard
        setSelectedImageFile(file);
        
        toast.success("Image sélectionnée. Cliquez sur 'Enregistrer' pour confirmer.");
        
      } catch (error) {
        console.error("Erreur lors de la sélection de l'image:", error);
        toast.error("Erreur lors de la sélection de l'image");
      } finally {
        setUploadingAvatar(false);
      }
    },
    []
  );

  // ✅ NOUVEAU: Fonction pour supprimer l'image
  const removeImage = useCallback(() => {
    setSelectedImageFile(null);
    setImagePreview(user.photoProfil || null); // Revenir à l'image originale
    
    // Reset de l'input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.info("Image supprimée. Cliquez sur 'Enregistrer' pour confirmer.");
  }, [user.photoProfil]);

  // ✅ MODIFICATION: Mise à jour du profil avec support Cloudinary
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        // Si une nouvelle image a été sélectionnée, la mettre à jour d'abord
        let updatedUser = user;
        if (selectedImageFile) {
          console.log("📷 Upload de la nouvelle image...");
          try {
            updatedUser = await updateAvatar(selectedImageFile);
            toast.success("Photo de profil mise à jour !");
            setUser(updatedUser); // Mettre à jour immédiatement le contexte
          } catch (error) {
            console.error("Erreur upload avatar:", error);
            toast.error("Erreur lors de la mise à jour de la photo");
            // Continuer avec la mise à jour des autres données même si l'avatar échoue
          }
        }

        // Puis mettre à jour les autres données du profil
        const updateData = {
          _id: updatedUser._id,
          nom: formData.nom,
          email: formData.email,
          localisation: formData.localisation,
          bio: formData.bio,
          styles: formData.styles,
        };

        console.log("📝 Mise à jour des données profil...");
        const finalUpdatedUser = await update(updateData);

        if (finalUpdatedUser && finalUpdatedUser._id) {
          setUser(finalUpdatedUser);
          toast.success("Profil mis à jour avec succès !");
          
          // Reset des états d'upload
          setSelectedImageFile(null);
          
          if (onBack) onBack();
        } else {
          toast.error("Erreur lors de la mise à jour du profil");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error("Erreur lors de la mise à jour du profil");
      } finally {
        setLoading(false);
      }
    },
    [formData, selectedImageFile, user._id, setUser, onBack]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Modifier le profil
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                
                {/* Overlay de loading */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Bouton camera pour changer la photo */}
              <label className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading || uploadingAvatar}
                />
              </label>

              {/* Bouton supprimer si une nouvelle image est sélectionnée */}
              {selectedImageFile && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -left-2 bg-gray-500 hover:bg-gray-600 text-white p-1 rounded-full transition-colors"
                  disabled={loading || uploadingAvatar}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="text-center mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cliquez sur l'icône pour changer votre photo
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, WebP jusqu'à 5MB
              </p>
              
              {/* Indicateur de changement d'image */}
              {selectedImageFile && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ✓ Nouvelle image sélectionnée
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Votre nom"
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                disabled={loading}
              />
              {formData.nom && (
                <p className="text-sm text-gray-500 mt-1">
                  {formData.nom.length}/50
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                disabled={loading}
              />
            </div>

            {/* Localisation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Localisation
              </label>
              <input
                type="text"
                name="localisation"
                value={formData.localisation}
                onChange={handleInputChange}
                placeholder="Ville, Pays"
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                disabled={loading}
              />
              {formData.localisation && (
                <p className="text-sm text-gray-500 mt-1">
                  {formData.localisation.length}/100
                </p>
              )}
            </div>

            {user?.userType === "tatoueur" && (
              <>
                {/* Bio */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Parlez-nous de vous..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                    disabled={loading}
                  />
                  {formData.bio && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.bio.length}/500
                    </p>
                  )}
                </div>

                {/* Styles */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Styles de tatouage
                  </label>
                  <input
                    type="text"
                    name="styles"
                    value={formData.styles}
                    onChange={handleInputChange}
                    placeholder="Réalisme, Traditionnel, Minimaliste..."
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    disabled={loading}
                  />
                  {formData.styles && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.styles.length}/200
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || uploadingAvatar}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}