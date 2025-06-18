import React, { useState, useContext, useEffect } from "react";
import { PlusCircle, X, Image, AlertCircle, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicationContext } from "../../context/PublicationContext";

export default function PublicationUploadPage() {
  const { addPublication, loading, error, clearError } = useContext(PublicationContext);
  const navigate = useNavigate();
  
  const [contenu, setContenu] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // Nettoyer les erreurs au montage
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Validation des fichiers
  const validateFile = (file) => {
    const errors = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      errors.push('Format de fichier non supporté. Utilisez JPG, PNG ou WebP.');
    }

    if (file.size > maxSize) {
      errors.push('La taille du fichier ne peut pas dépasser 5MB.');
    }

    return errors;
  };

  // Gestion de la sélection d'image
  const handleFileSelection = (file) => {
    const fileErrors = validateFile(file);
    
    if (fileErrors.length > 0) {
      setValidationErrors(fileErrors);
      return;
    }

    setValidationErrors([]);
    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setValidationErrors([]);
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    
    if (trimmedTag !== "" && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    } else if (tags.length >= 10) {
      setValidationErrors(['Vous ne pouvez pas ajouter plus de 10 tags.']);
    }
    setIsAddingTag(false);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Escape") {
      setIsAddingTag(false);
      setNewTag("");
    }
  };

  // Validation générale du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (contenu.trim().length === 0) {
      errors.push('Le contenu de la publication est requis.');
    }
    
    if (contenu.length > 2000) {
      errors.push('Le contenu ne peut pas dépasser 2000 caractères.');
    }

    return errors;
  };

  const handleSubmit = async () => {
    // Nettoyer les erreurs précédentes
    setValidationErrors([]);
    clearError();
    
    // Validation
    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setValidationErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const publicationData = {
        contenu: contenu.trim(),
        image: selectedImage,
        tags: tags
      };

      const newPublication = await addPublication(publicationData);
      
      // Nettoyer le localStorage si on avait un brouillon
      localStorage.removeItem("publication_draft");
      
      // Rediriger vers le feed avec un message de succès
      navigate("/", { 
        state: { 
          message: "Publication créée avec succès !", 
          newPostId: newPublication.id 
        } 
      });
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      setValidationErrors([error.message || "Erreur lors de la publication. Veuillez réessayer."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    try {
      const draftData = {
        contenu,
        tags,
        imagePreview,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem("publication_draft", JSON.stringify(draftData));
      showNotification("Brouillon sauvegardé !", "success");
    } catch (error) {
      showNotification("Erreur lors de la sauvegarde du brouillon", "error");
    }
  };

  // Fonction pour afficher les notifications
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement("div");
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Charger un brouillon au montage du composant
  useEffect(() => {
    const savedDraft = localStorage.getItem("publication_draft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        const draftAge = Date.now() - new Date(draftData.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures
        
        if (draftAge < maxAge && window.confirm("Un brouillon a été trouvé. Voulez-vous le charger ?")) {
          setContenu(draftData.contenu || "");
          setTags(draftData.tags || []);
          if (draftData.imagePreview) {
            setImagePreview(draftData.imagePreview);
          }
        } else if (draftAge >= maxAge) {
          // Supprimer les brouillons trop anciens
          localStorage.removeItem("publication_draft");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du brouillon:", error);
        localStorage.removeItem("publication_draft");
      }
    }
  }, []);

  // Auto-sauvegarde du brouillon
  useEffect(() => {
    if (contenu.trim() || tags.length > 0 || imagePreview) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 30000); // Auto-sauvegarde toutes les 30 secondes

      return () => clearTimeout(timeoutId);
    }
  }, [contenu, tags, imagePreview]);

  const remainingChars = 2000 - contenu.length;
  const allErrors = [...validationErrors, ...(error ? [error] : [])];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Nouvelle Publication</h1>
        <button
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      {/* Affichage des erreurs */}
      {allErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-red-400 flex-shrink-0 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
                Erreur{allErrors.length > 1 ? 's' : ''} de validation
              </h3>
              <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                {allErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 dark:text-white">
          Contenu de la Publication
        </h2>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="contenu"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Votre message *
            </label>
            <textarea
              id="contenu"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
              placeholder="Partagez vos dernières créations, vos inspirations, ou vos actualités..."
              rows="6"
              maxLength="2000"
            ></textarea>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Partagez vos créations, inspirations et actualités avec la communauté
              </p>
              <span className={`text-xs ${remainingChars < 100 ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400`}>
                {remainingChars} caractères restants
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image (optionnelle)
            </label>
            
            {!imagePreview ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragOver 
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <Image size={48} className="text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Cliquez pour ajouter une photo
                    <br />
                    ou faites glisser l'image ici
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    PNG, JPG, WebP jusqu'à 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Supprimer l'image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (optionnels) - {tags.length}/10
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-full px-3 py-1 flex items-center text-sm"
                >
                  <span>#{tag}</span>
                  <button
                    className="ml-2 text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100"
                    onClick={() => removeTag(index)}
                    title="Supprimer ce tag"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {isAddingTag ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    onBlur={() => {
                      if (newTag.trim()) addTag();
                      else setIsAddingTag(false);
                    }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Ajouter un tag"
                    maxLength="30"
                    autoFocus
                  />
                  <button
                    onClick={addTag}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Ajouter le tag"
                  >
                    <PlusCircle size={18} />
                  </button>
                </div>
              ) : (
                tags.length < 10 && (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center text-sm"
                  >
                    <PlusCircle size={18} className="mr-1" /> Ajouter un tag
                  </button>
                )
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Les tags aident à catégoriser votre publication (ex: realisme, blackwork, traditionnel...)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          Aperçu de la Publication
        </h2>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
              T
            </div>
            <div className="ml-3">
              <p className="font-medium dark:text-white">Votre nom</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">À l'instant</p>
            </div>
          </div>
          
          {contenu && (
            <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap">
              {contenu}
            </p>
          )}
          
          {imagePreview && (
            <div className="mb-3">
              <img
                src={imagePreview}
                alt="Aperçu publication"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400 text-sm">
            <button className="hover:text-red-500 transition-colors">
              👤 0 J'aime
            </button>
            <button className="hover:text-red-500 transition-colors">
              💬 0 Commentaires
            </button>
            <button className="hover:text-red-500 transition-colors">
              📤 Partager
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleSaveDraft}
          disabled={contenu.trim() === "" && tags.length === 0}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer brouillon
        </button>
        <button
          onClick={handleSubmit}
          disabled={contenu.trim() === "" || isSubmitting || loading}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {(isSubmitting || loading) ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              Publication...
            </>
          ) : (
            "Publier"
          )}
        </button>
      </div>
    </div>
  );
}