import React, { useState, useContext } from "react";
import { X, Image, Zap, Euro, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FlashContext } from "../../context/FlashContext";

export default function FlashUploadPage() {
  const { addFlash } = useContext(FlashContext);
  const navigate = useNavigate();
  
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [disponible, setDisponible] = useState(true);
  const [reserve, setReserve] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // ✅ Validation de l'image (plus stricte pour les Flash)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB pour les Flash (qualité importante)

      if (!allowedTypes.includes(file.type)) {
        setErrors(['Format d\'image non supporté. Utilisez JPG, PNG ou WebP.']);
        return;
      }

      if (file.size > maxSize) {
        setErrors(['L\'image est trop volumineuse. Maximum 10MB.']);
        return;
      }

      setErrors([]);
      setSelectedImage(file);
      
      console.log('📷 Flash Upload - Image sélectionnée:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setErrors([]);
  };

  const handlePrixChange = (e) => {
    const value = e.target.value;
    // Permettre seulement les nombres et virgules/points
    if (value === '' || /^\d+([.,]\d{0,2})?$/.test(value)) {
      setPrix(value);
    }
  };

  const handleSubmit = async () => {
    // ✅ Validation spécifique aux Flash
    const validationErrors = [];
    
    if (!selectedImage) {
      validationErrors.push('Une image est obligatoire pour un Flash');
    }
    
    if (!prix || parseFloat(prix.replace(',', '.')) <= 0) {
      validationErrors.push('Le prix doit être supérieur à 0€');
    }
    
    if (parseFloat(prix.replace(',', '.')) > 10000) {
      validationErrors.push('Le prix ne peut pas dépasser 10 000€');
    }
    
    if (description.length > 1000) {
      validationErrors.push('La description ne peut pas dépasser 1000 caractères');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      console.log('📤 Flash Upload - Début soumission:', {
        description: description.trim(),
        prix: parseFloat(prix.replace(',', '.')),
        hasImage: !!selectedImage,
        imageName: selectedImage?.name,
        imageSize: selectedImage?.size,
        disponible,
        reserve
      });

      const flashData = {
        image: selectedImage, // File object obligatoire
        prix: parseFloat(prix.replace(',', '.')), // Convertir en nombre
        description: description.trim() || undefined, // Optionnel
        disponible: disponible,
        reserve: reserve,
      };

      console.log('📤 Flash Upload - Données à envoyer:', flashData);

      const newFlash = await addFlash(flashData);
      
      console.log('✅ Flash Upload - Flash créé:', newFlash);
      
      // Rediriger vers les Flash après publication
      navigate("/flash", { 
        state: { 
          message: "Flash créé avec succès !", 
          newFlashId: newFlash._id || newFlash.id 
        } 
      });
    } catch (error) {
      console.error("❌ Flash Upload - Erreur lors de la création:", error);
      setErrors([error.message || "Erreur lors de la création du Flash. Veuillez réessayer."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Sauvegarder en local storage
    const draftData = {
      description,
      prix,
      imagePreview,
      disponible,
      reserve,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem("flash_draft", JSON.stringify(draftData));
    alert("Brouillon Flash sauvegardé !");
  };

  // Charger un brouillon au montage du composant
  React.useEffect(() => {
    const savedDraft = localStorage.getItem("flash_draft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        if (window.confirm("Un brouillon Flash a été trouvé. Voulez-vous le charger ?")) {
          setDescription(draftData.description || "");
          setPrix(draftData.prix || "");
          setDisponible(draftData.disponible ?? true);
          setReserve(draftData.reserve ?? false);
          if (draftData.imagePreview) {
            setImagePreview(draftData.imagePreview);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon Flash:', error);
      }
    }
  }, []);

  const remainingChars = 1000 - description.length;
  const formattedPrix = prix ? parseFloat(prix.replace(',', '.')).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nouveau Flash</h1>
        </div>
        <button
          onClick={() => navigate("/flash")}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      {/* ✅ Affichage des erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded mb-6">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
          <Zap size={20} className="text-red-500" />
          Détails du Flash
        </h2>

        <div className="space-y-6">
          {/* ✅ Image obligatoire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image du Flash *
            </label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-red-300 dark:border-red-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors bg-red-50 dark:bg-red-900/20">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="flash-image-upload"
                />
                <label htmlFor="flash-image-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                    <Image size={24} className="text-white" />
                  </div>
                  <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                    Cliquez pour ajouter votre design Flash
                    <br />
                    ou faites glisser l'image ici
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    PNG, JPG, WebP jusqu'à 10MB • Qualité élevée recommandée
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Aperçu Flash"
                  className="max-w-full h-auto max-h-96 rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} />
                </button>
                {/* Infos sur l'image */}
                {selectedImage && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    📷 {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ Prix obligatoire */}
          <div>
            <label
              htmlFor="prix"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Prix du Flash * <Euro className="inline w-4 h-4" />
            </label>
            <div className="relative">
              <input
                id="prix"
                type="text"
                value={prix}
                onChange={handlePrixChange}
                className="w-full px-4 py-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white text-lg font-medium"
                placeholder="150.00"
              />
              <span className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 font-medium">€</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Prix de vente de votre design Flash
              </p>
              {prix && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formattedPrix}€
                </span>
              )}
            </div>
          </div>

          {/* ✅ Description optionnelle */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description (optionnelle)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
              placeholder="Style, taille recommandée, emplacement sur le corps, inspiration..."
              rows="4"
              maxLength="1000"
            ></textarea>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Décrivez votre Flash (style, taille, emplacement...)
              </p>
              <span className={`text-xs ${remainingChars < 100 ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400`}>
                {remainingChars} caractères restants
              </span>
            </div>
          </div>

          {/* ✅ Options de disponibilité */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Disponibilité
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => setDisponible(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CheckCircle size={16} className={disponible ? "text-green-500" : "text-gray-400"} />
                  Flash disponible à la réservation
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reserve}
                  onChange={(e) => setReserve(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock size={16} className={reserve ? "text-orange-500" : "text-gray-400"} />
                  Flash déjà réservé
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Aperçu du Flash */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          <Zap size={20} className="text-red-500" />
          Aperçu du Flash
        </h2>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              <Zap size={16} />
            </div>
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <p className="font-medium dark:text-white">Votre nom</p>
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  FLASH
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">À l'instant</p>
            </div>
          </div>
          
          {imagePreview && (
            <div className="mb-3">
              <img
                src={imagePreview}
                alt="Aperçu Flash"
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}
          
          <div className="flex justify-between items-center mb-3">
            {prix && (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formattedPrix}€
              </div>
            )}
            <div className="flex gap-2">
              {disponible && (
                <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                  Disponible
                </span>
              )}
              {reserve && (
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-medium">
                  Réservé
                </span>
              )}
            </div>
          </div>
          
          {description && (
            <p className="text-gray-800 dark:text-gray-200 mb-3 text-sm">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>👁️ 0 vues</span>
              <span>⭐ 0 favoris</span>
            </div>
            <button className="text-red-500 hover:text-red-600 font-medium">
              Réserver ce Flash
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Boutons d'action */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleSaveDraft}
          disabled={!selectedImage && !description && !prix}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer brouillon
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedImage || !prix || isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Publication...
            </>
          ) : (
            <>
              <Zap size={16} />
              Publier le Flash
            </>
          )}
        </button>
      </div>
    </div>
  );
}