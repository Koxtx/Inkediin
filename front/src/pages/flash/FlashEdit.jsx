import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X, Save, ArrowLeft, Camera, Euro, Tag, MapPin, Palette, Ruler } from "lucide-react";
import { FlashContext } from "../../context/FlashContext";
import toast from "react-hot-toast";

const STYLES_OPTIONS = [
  { value: "traditionnel", label: "Traditionnel" },
  { value: "realisme", label: "Réalisme" },
  { value: "blackwork", label: "Blackwork" },
  { value: "dotwork", label: "Dotwork" },
  { value: "geometrique", label: "Géométrique" },
  { value: "watercolor", label: "Watercolor" },
  { value: "tribal", label: "Tribal" },
  { value: "japonais", label: "Japonais" },
  { value: "autre", label: "Autre (personnalisé)" },
];

const TAILLES_OPTIONS = [
  { value: "petit", label: "Petit (5-10cm)" },
  { value: "moyen", label: "Moyen (10-15cm)" },
  { value: "grand", label: "Grand (15-25cm)" },
  { value: "tres-grand", label: "Très grand (25cm+)" },
];

const EMPLACEMENT_OPTIONS = [
  { value: "bras", label: "Bras" },
  { value: "jambe", label: "Jambe" },
  { value: "dos", label: "Dos" },
  { value: "torse", label: "Torse" },
  { value: "main", label: "Main" },
  { value: "pied", label: "Pied" },
  { value: "cou", label: "Cou" },
  { value: "visage", label: "Visage" },
  { value: "autre", label: "Autre" },
];

export default function EditFlash() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFlashById, updateFlashInCache } = useContext(FlashContext);

  // États du formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prix: "",
    style: "",
    styleCustom: "",
    taille: "moyen",
    emplacement: [],
    tags: [],
    disponible: true,
  });

  // États pour l'image
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // États de contrôle
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");

  // Charger les données du flash
  useEffect(() => {
    const loadFlash = async () => {
      try {
        setLoading(true);
        setError("");
        
       
        const flash = await getFlashById(id);
        
        if (!flash) {
          throw new Error("Flash non trouvé");
        }

        

        // Remplir le formulaire avec les données existantes
        setFormData({
          title: flash.title || "",
          description: flash.description || "",
          prix: flash.prix?.toString() || "",
          style: flash.style || "",
          styleCustom: flash.styleCustom || "",
          taille: flash.taille || "moyen",
          emplacement: Array.isArray(flash.emplacement) ? flash.emplacement : [],
          tags: Array.isArray(flash.tags) ? flash.tags : [],
          disponible: flash.disponible !== false,
        });

        setCurrentImage(flash.image || "");
        setImagePreview(flash.image || "");
        
      } catch (err) {
        console.error("❌ EditFlash - Erreur chargement:", err);
        setError(err.message || "Erreur lors du chargement du flash");
        toast.error("Erreur lors du chargement du flash");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFlash();
    }
  }, [id, getFlashById]);

  // Gestion du changement des champs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Gestion des emplacements (checkboxes multiples)
  const handleEmplacementChange = (emplacement) => {
    setFormData(prev => ({
      ...prev,
      emplacement: prev.emplacement.includes(emplacement)
        ? prev.emplacement.filter(e => e !== emplacement)
        : [...prev.emplacement, emplacement]
    }));
  };

  // Gestion des tags
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Gestion de l'upload d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image valide");
      return;
    }

    // Vérification de la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10MB");
      return;
    }

    setNewImage(file);

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
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
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    setNewImage(null);
    setImagePreview(currentImage);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];

    if (!formData.prix || isNaN(formData.prix) || parseFloat(formData.prix) <= 0) {
      errors.push("Le prix doit être un nombre positif");
    }

    if (parseFloat(formData.prix) > 10000) {
      errors.push("Le prix ne peut pas dépasser 10 000€");
    }

    if (formData.description && formData.description.length > 1000) {
      errors.push("La description ne peut pas dépasser 1000 caractères");
    }

    if (formData.title && formData.title.length > 200) {
      errors.push("Le titre ne peut pas dépasser 200 caractères");
    }

    if (formData.style === "autre" && (!formData.styleCustom || !formData.styleCustom.trim())) {
      errors.push("Le style personnalisé est requis quand 'Autre' est sélectionné");
    }

    if (formData.styleCustom && formData.styleCustom.length > 50) {
      errors.push("Le style personnalisé ne peut pas dépasser 50 caractères");
    }

    return errors;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    try {
      setSaving(true);
      setError("");

    

      // Préparer les données à envoyer
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        prix: parseFloat(formData.prix),
        style: formData.style,
        styleCustom: formData.style === "autre" ? formData.styleCustom.trim() : "",
        taille: formData.taille,
        emplacement: formData.emplacement,
        tags: formData.tags,
        disponible: formData.disponible,
      };

      // Ajouter l'image si elle a été modifiée
      if (newImage) {
        updateData.image = newImage;
      }

      // Utiliser l'API directement (vous devrez l'implémenter dans votre FlashContext)
      const response = await fetch(`/api/flashs/${id}`, {
        method: "PUT",
        headers: newImage ? {} : { "Content-Type": "application/json" },
        credentials: "include",
        body: newImage ? (() => {
          const formData = new FormData();
          Object.keys(updateData).forEach(key => {
            if (key === "emplacement" || key === "tags") {
              formData.append(key, JSON.stringify(updateData[key]));
            } else {
              formData.append(key, updateData[key]);
            }
          });
          return formData;
        })() : JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      const updatedFlash = await response.json();
      
      // Mettre à jour le cache
      updateFlashInCache(id, updatedFlash);

     
      toast.success("Flash mis à jour avec succès !");
      
      // Rediriger vers le détail du flash
      navigate(`/flashdetail/${id}`);
      
    } catch (err) {
      console.error("❌ EditFlash - Erreur mise à jour:", err);
      setError(err.message || "Erreur lors de la mise à jour");
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  // États de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du flash...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Erreur</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Modifier le Flash
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Modifiez les informations de votre flash tattoo
          </p>
        </div>

        {/* Formulaire */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Image */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  <Camera size={16} className="inline mr-2" />
                  Image du Flash
                </label>< label size={16} className="inline mr-2" >
                  Image du Flash
                </label>
                
                {/* Zone d'upload */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-red-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      {newImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <div className="mt-4">
                        <label className="cursor-pointer bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <Upload size={16} className="inline mr-2" />
                          Changer l'image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12">
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Glissez votre image ici ou cliquez pour sélectionner
                      </p>
                      <label className="cursor-pointer bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
                        Sélectionner une image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite - Informations */}
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre du Flash
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Donnez un titre à votre flash..."
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.title.length}/200 caractères
                </p>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Euro size={16} className="inline mr-2" />
                  Prix (€) *
                </label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  placeholder="Prix en euros"
                  min="1"
                  max="10000"
                  step="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors"
                />
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette size={16} className="inline mr-2" />
                  Style
                </label>
                <select
                  name="style"
                  value={formData.style}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors"
                >
                  <option value="">Sélectionner un style</option>
                  {STYLES_OPTIONS.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
                
                {/* Style personnalisé */}
                {formData.style === "autre" && (
                  <input
                    type="text"
                    name="styleCustom"
                    value={formData.styleCustom}
                    onChange={handleInputChange}
                    placeholder="Précisez votre style..."
                    maxLength={50}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors"
                  />
                )}
              </div>

              {/* Taille */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Ruler size={16} className="inline mr-2" />
                  Taille
                </label>
                <select
                  name="taille"
                  value={formData.taille}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors"
                >
                  {TAILLES_OPTIONS.map((taille) => (
                    <option key={taille.value} value={taille.value}>
                      {taille.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Disponibilité */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Flash disponible
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez votre flash, sa signification, les détails techniques..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors resize-vertical"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/1000 caractères
            </p>
          </div>

          {/* Emplacements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <MapPin size={16} className="inline mr-2" />
              Emplacements suggérés
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EMPLACEMENT_OPTIONS.map((emplacement) => (
                <label
                  key={emplacement.value}
                  className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.emplacement.includes(emplacement.value)}
                    onChange={() => handleEmplacementChange(emplacement.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {emplacement.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={16} className="inline mr-2" />
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ajouter un tag..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Sauvegarder les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}