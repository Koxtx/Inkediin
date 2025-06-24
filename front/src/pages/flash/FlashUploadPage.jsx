import React, { useState, useContext } from "react";
import {
  X,
  Image,
  Zap,
  Euro,
  Clock,
  CheckCircle,
  Tag,
  MapPin,
  Palette,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FlashContext } from "../../context/FlashContext";

export default function FlashUploadPage() {
  const { addFlash } = useContext(FlashContext);
  const navigate = useNavigate();

  // ✅ États du formulaire selon l'API
  const [formData, setFormData] = useState({
    prix: "",
    description: "",
    title: "",
    
    style: "autre",
    styleCustom: "", // ✅ Nouveau champ pour le style personnalisé
    taille: "moyen",
    emplacement: [],
    tags: [],
    disponible: true,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  // ✅ Options pour les selects - CORRIGÉES pour correspondre au backend
  const styleOptions = [
    { value: "traditionnel", label: "Traditionnel" },
    { value: "realisme", label: "Réalisme" }, // ✅ Corrigé: realisme au lieu de realiste
    { value: "geometrique", label: "Géométrique" },
    { value: "blackwork", label: "Blackwork" },
    { value: "dotwork", label: "Dotwork" },
    { value: "watercolor", label: "Watercolor" },
    { value: "tribal", label: "Tribal" },
    { value: "japonais", label: "Japonais" },
    { value: "autre", label: "Autre" },
  ];

  const tailleOptions = [
    { value: "petit", label: "Petit (< 5cm)" },
    { value: "moyen", label: "Moyen (5-15cm)" },
    { value: "grand", label: "Grand (> 15cm)" },
    { value: "tres-grand", label: "Très grand (> 20cm)" }, // ✅ Ajouté
  ];

  // ✅ CORRECTION MAJEURE: Emplacements correspondant EXACTEMENT au backend
  const emplacementOptions = [
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

  // ✅ Gestion des champs du formulaire
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Nettoyer les erreurs quand l'utilisateur modifie
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // ✅ Gestion du changement de style avec réinitialisation du style personnalisé
  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      style: newStyle,
      styleCustom: newStyle === "autre" ? prev.styleCustom : "", // Garder le style custom seulement si "autre" est sélectionné
    }));

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // ✅ Gestion du prix avec validation
  const handlePrixChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+([.,]\d{0,2})?$/.test(value)) {
      handleInputChange("prix", value);
    }
  };

  // ✅ Gestion des tags
  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tags = value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag);
    handleInputChange("tags", tags);
  };

  // ✅ Gestion des emplacements - CORRIGÉE
  const toggleEmplacement = (emplacementValue) => {
    const currentEmplacements = formData.emplacement;
    if (currentEmplacements.includes(emplacementValue)) {
      handleInputChange(
        "emplacement",
        currentEmplacements.filter((e) => e !== emplacementValue)
      );
    } else {
      handleInputChange("emplacement", [
        ...currentEmplacements,
        emplacementValue,
      ]);
    }
  };

  // ✅ Gestion de l'image
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setErrors(["Format d'image non supporté. Utilisez JPG, PNG ou WebP."]);
        return;
      }

      if (file.size > maxSize) {
        setErrors(["L'image est trop volumineuse. Maximum 10MB."]);
        return;
      }

      setErrors([]);
      setSelectedImage(file);

      console.log("📷 Flash Upload - Image sélectionnée:", {
        name: file.name,
        size: file.size,
        type: file.type,
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

  // ✅ Validation du formulaire
  const validateForm = () => {
    const validationErrors = [];

    if (!selectedImage) {
      validationErrors.push("Une image est obligatoire pour un Flash");
    }

    if (!formData.prix || parseFloat(formData.prix.replace(",", ".")) <= 0) {
      validationErrors.push("Le prix doit être supérieur à 0€");
    }

    if (parseFloat(formData.prix.replace(",", ".")) > 10000) {
      validationErrors.push("Le prix ne peut pas dépasser 10 000€");
    }

    // ✅ Validation du style personnalisé
    if (formData.style === "autre" && !formData.styleCustom.trim()) {
      validationErrors.push("Veuillez préciser le style personnalisé");
    }

    if (formData.styleCustom && formData.styleCustom.length > 50) {
      validationErrors.push("Le style personnalisé ne peut pas dépasser 50 caractères");
    }

    if (formData.description && formData.description.length > 1000) {
      validationErrors.push(
        "La description ne peut pas dépasser 1000 caractères"
      );
    }

    if (formData.title && formData.title.length > 200) {
      validationErrors.push("Le titre ne peut pas dépasser 200 caractères");
    }

    if (formData.artist && formData.artist.length > 100) {
      validationErrors.push(
        "Le nom de l'artiste ne peut pas dépasser 100 caractères"
      );
    }

    return validationErrors;
  };

  // ✅ Fonction pour obtenir le style final à envoyer
  const getFinalStyle = () => {
    if (formData.style === "autre" && formData.styleCustom.trim()) {
      return formData.styleCustom.trim();
    }
    return formData.style;
  };

  // ✅ Fonction pour obtenir le label du style pour l'affichage
  const getStyleDisplayLabel = () => {
    if (formData.style === "autre" && formData.styleCustom.trim()) {
      return formData.styleCustom.trim();
    }
    const option = styleOptions.find((s) => s.value === formData.style);
    return option ? option.label : formData.style;
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      console.log("📤 Flash Upload - Début soumission");

      const flashData = {
        image: selectedImage, // File object obligatoire
        prix: parseFloat(formData.prix.replace(",", ".")), // Convertir en nombre
        description: formData.description.trim() || undefined,
        title: formData.title.trim() || undefined,
        style: formData.style, // ✅ Toujours envoyer le style sélectionné
        styleCustom: formData.style === "autre" && formData.styleCustom && formData.styleCustom.trim() 
          ? formData.styleCustom.trim() 
          : undefined, // ✅ Condition plus robuste
        taille: formData.taille,
        emplacement:
          formData.emplacement.length > 0 ? formData.emplacement : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        disponible: formData.disponible,
      };

      console.log("📤 Flash Upload - Données à envoyer:", {
        ...flashData,
        image: `File: ${selectedImage?.name}`, // Pour éviter d'afficher l'objet File complet
      });

      // ✅ DEBUG spécifique pour styleCustom
      console.log("🔍 DEBUG avant envoi:", {
        "formData.style": formData.style,
        "formData.styleCustom": formData.styleCustom,
        "flashData.style": flashData.style,
        "flashData.styleCustom": flashData.styleCustom,
        "condition": formData.style === "autre" && formData.styleCustom,
      });

      const newFlash = await addFlash(flashData);

      console.log("✅ Flash Upload - Flash créé:", newFlash);

      // Nettoyer le brouillon
      localStorage.removeItem("flash_draft");

      // Rediriger vers les Flash avec message de succès
      navigate("/", {
        state: {
          message: "Flash créé avec succès !",
          newFlashId: newFlash._id || newFlash.id,
        },
      });
    } catch (error) {
      console.error("❌ Flash Upload - Erreur lors de la création:", error);
      setErrors([
        error.message ||
          "Erreur lors de la création du Flash. Veuillez réessayer.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Sauvegarde en brouillon
  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      imagePreview,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("flash_draft", JSON.stringify(draftData));
    alert("Brouillon Flash sauvegardé !");
  };

  // ✅ Charger le brouillon au montage
  React.useEffect(() => {
    const savedDraft = localStorage.getItem("flash_draft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        if (
          window.confirm(
            "Un brouillon Flash a été trouvé. Voulez-vous le charger ?"
          )
        ) {
          setFormData({
            prix: draftData.prix || "",
            description: draftData.description || "",
            title: draftData.title || "",
            artist: draftData.artist || "",
            style: draftData.style || "autre",
            styleCustom: draftData.styleCustom || "", // ✅ Restaurer le style personnalisé
            taille: draftData.taille || "moyen",
            emplacement: draftData.emplacement || [],
            tags: draftData.tags || [],
            disponible: draftData.disponible ?? true,
          });
          if (draftData.imagePreview) {
            setImagePreview(draftData.imagePreview);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du brouillon Flash:", error);
      }
    }
  }, []);

  const remainingChars = 1000 - (formData.description?.length || 0);
  const formattedPrix = formData.prix
    ? parseFloat(formData.prix.replace(",", ".")).toFixed(2)
    : "0.00";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nouveau Flash</h1>
        </div>
        <button
          onClick={() => navigate("/feed")}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ✅ Colonne gauche - Formulaire */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <Zap size={20} className="text-red-500" />
              Informations du Flash
            </h2>

            <div className="space-y-4">
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
                    <label
                      htmlFor="flash-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
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
                    {selectedImage && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        📷 {selectedImage.name} (
                        {Math.round(selectedImage.size / 1024)} KB)
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ✅ Prix obligatoire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix du Flash * <Euro className="inline w-4 h-4" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.prix}
                    onChange={handlePrixChange}
                    className="w-full px-4 py-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white text-lg font-medium"
                    placeholder="150.00"
                  />
                  <span className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 font-medium">
                    €
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Prix de vente de votre design Flash
                  </p>
                  {formData.prix && (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formattedPrix}€
                    </span>
                  )}
                </div>
              </div>

              {/* ✅ Titre  */}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre du Flash
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Dragon tribal"
                    maxLength="200"
                  />
                </div>
              </div>

              {/* ✅ Style et taille avec style personnalisé */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Palette className="inline w-4 h-4 mr-1" />
                    Style
                  </label>
                  <select
                    value={formData.style}
                    onChange={handleStyleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                  >
                    {styleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* ✅ Champ de style personnalisé affiché uniquement si "autre" est sélectionné */}
                  {formData.style === "autre" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={formData.styleCustom}
                        onChange={(e) => handleInputChange("styleCustom", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                        placeholder="Précisez le style (ex: Neo-traditionnel, Biomécanique...)"
                        maxLength="50"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Décrivez votre style personnalisé (max 50 caractères)
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Taille
                  </label>
                  <select
                    value={formData.taille}
                    onChange={(e) =>
                      handleInputChange("taille", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                  >
                    {tailleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ✅ Emplacements CORRIGÉS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Emplacements recommandés
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {emplacementOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleEmplacement(option.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        formData.emplacement.includes(option.value)
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-red-100 dark:hover:bg-red-900"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sélectionnez les zones du corps recommandées pour ce Flash
                </p>
              </div>

              {/* ✅ Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={handleTagsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                  placeholder="dragon, tribal, noir, bras"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ajoutez des mots-clés pour faciliter la recherche
                </p>
              </div>

              {/* ✅ Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                  placeholder="Décrivez votre Flash: style, signification, recommandations..."
                  rows="4"
                  maxLength="1000"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Donnez des détails sur votre design
                  </p>
                  <span
                    className={`text-xs ${
                      remainingChars < 100 ? "text-red-500" : "text-gray-500"
                    } dark:text-gray-400`}
                  >
                    {remainingChars} caractères restants
                  </span>
                </div>
              </div>

              {/* ✅ Disponibilité */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Disponibilité
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.disponible}
                    onChange={(e) =>
                      handleInputChange("disponible", e.target.checked)
                    }
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <CheckCircle
                      size={16}
                      className={
                        formData.disponible ? "text-green-500" : "text-gray-400"
                      }
                    />
                    Flash disponible à la réservation
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Colonne droite - Aperçu */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
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
                    <p className="font-medium dark:text-white">
                      {formData.artist || "Votre nom"}
                    </p>
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      FLASH
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    À l'instant
                  </p>
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

              <div className="space-y-2 mb-3">
                {formData.title && (
                  <h3 className="font-semibold text-lg dark:text-white">
                    {formData.title}
                  </h3>
                )}

                <div className="flex items-center justify-between">
                  {formData.prix && (
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formattedPrix}€
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                      {getStyleDisplayLabel()}
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                      {
                        tailleOptions.find((t) => t.value === formData.taille)
                          ?.label
                      }
                    </span>
                  </div>
                </div>

                {formData.emplacement.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.emplacement.map((emp) => {
                      const option = emplacementOptions.find(
                        (o) => o.value === emp
                      );
                      return (
                        <span
                          key={emp}
                          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {option?.label || emp}
                        </span>
                      );
                    })}
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {formData.description && (
                  <p className="text-gray-800 dark:text-gray-200 text-sm">
                    {formData.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
                <div className="flex items-center space-x-4">
                  <span>👁️ 0 vues</span>
                  <span>❤️ 0 likes</span>
                  <span>⭐ 0 favoris</span>
                </div>
                <div className="flex gap-2">
                  {formData.disponible && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                      Disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Boutons d'action */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleSaveDraft}
          disabled={!selectedImage && !formData.description && !formData.prix}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer brouillon
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedImage || !formData.prix || isSubmitting}
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