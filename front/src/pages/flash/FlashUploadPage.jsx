import React, { useState, useContext } from "react";
import { PlusCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FlashContext } from "../../context/FlashContext";

export default function FlashUploadPage() {
  const { addFlash } = useContext(FlashContext);
  const navigate = useNavigate();

  const [availability, setAvailability] = useState("unlimited");
  const [tags, setTags] = useState(["Old School", "Rose"]);
  const [newTag, setNewTag] = useState("");
  const [limitNumber, setLimitNumber] = useState(3);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour les champs du formulaire
  const [titre, setTitre] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [placement, setPlacement] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleAvailabilityChange = (value) => {
    setAvailability(value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const addTag = () => {
    if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
    setIsAddingTag(false);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (!titre.trim() || !price || !description.trim()) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const flashData = {
        title: titre.trim(),
        artist: "Votre nom", // À remplacer par les données utilisateur réelles
        artistId: "current_user", // À remplacer par l'ID utilisateur réel
        price: parseFloat(price),
        currency: "€",
        description: description.trim(),
        image: selectedImage,
        tags: tags,
        availability: availability,
        limitNumber:
          availability === "limited"
            ? limitNumber
            : availability === "exclusive"
            ? 1
            : null,
        size: size,
        placement: placement,
      };

      const newFlash = addFlash(flashData);

      // Rediriger vers la page des flashs après publication
      navigate("/flashdetail", {
        state: {
          message: "Flash créé avec succès !",
          newFlashId: newFlash.id,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création du flash:", error);
      alert("Erreur lors de la création du flash. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      titre,
      price,
      description,
      tags,
      availability,
      limitNumber,
      size,
      placement,
      imagePreview,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("flash_draft", JSON.stringify(draftData));
    alert("Brouillon sauvegardé !");
  };

  // Charger un brouillon au montage du composant
  React.useEffect(() => {
    const savedDraft = localStorage.getItem("flash_draft");
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      if (
        window.confirm("Un brouillon a été trouvé. Voulez-vous le charger ?")
      ) {
        setTitre(draftData.titre || "");
        setPrice(draftData.price || "");
        setDescription(draftData.description || "");
        setTags(draftData.tags || []);
        setAvailability(draftData.availability || "unlimited");
        setLimitNumber(draftData.limitNumber || 3);
        setSize(draftData.size || "");
        setPlacement(draftData.placement || "");
        if (draftData.imagePreview) {
          setImagePreview(draftData.imagePreview);
        }
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Publier un Flash</h1>
        <button
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 dark:text-white">
          Image du Flash
        </h2>

        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-6 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="flash-image-upload"
            />
            <label
              htmlFor="flash-image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-4xl text-gray-400 dark:text-gray-500 mb-2">
                +
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Cliquez pour ajouter une photo
                <br />
                ou faites glisser l'image ici
              </p>
            </label>
          </div>
        ) : (
          <div className="relative inline-block mb-6">
            <img
              src={imagePreview}
              alt="Aperçu du flash"
              className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label
              htmlFor="titre"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Titre du Flash *
            </label>
            <input
              type="text"
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Rose traditionnelle"
              required
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Prix (€) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                €
              </span>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                placeholder="150"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
              placeholder="Décrivez votre flash (taille, couleurs, emplacement recommandé, etc.)"
              rows="4"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-full px-3 py-1 flex items-center text-sm"
                >
                  <span>{tag}</span>
                  <button
                    className="ml-2 text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100"
                    onClick={() => removeTag(index)}
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
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Ajouter un tag"
                    autoFocus
                  />
                  <button
                    onClick={addTag}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <PlusCircle size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingTag(true)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center text-sm"
                >
                  <PlusCircle size={18} className="mr-1" /> Ajouter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 dark:text-white">
          Disponibilité
        </h2>

        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-red-400 transition-colors">
            <div className="flex items-center mb-1">
              <input
                type="radio"
                id="unlimited"
                name="availability"
                className="mr-2 text-red-500 focus:ring-red-400"
                checked={availability === "unlimited"}
                onChange={() => handleAvailabilityChange("unlimited")}
              />
              <label
                htmlFor="unlimited"
                className="font-medium dark:text-white"
              >
                Illimité
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-5">
              Ce flash peut être tatoué plusieurs fois sans limite
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-red-400 transition-colors">
            <div className="flex items-center mb-1">
              <input
                type="radio"
                id="limited"
                name="availability"
                className="mr-2 text-red-500 focus:ring-red-400"
                checked={availability === "limited"}
                onChange={() => handleAvailabilityChange("limited")}
              />
              <label htmlFor="limited" className="font-medium dark:text-white">
                Limité
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-5 mb-2">
              Ce flash ne peut être tatoué qu'un nombre limité de fois
            </p>

            {availability === "limited" && (
              <div className="flex items-center ml-5 mt-3">
                <label
                  htmlFor="limit-number"
                  className="text-sm text-gray-700 dark:text-gray-300 mr-2"
                >
                  Nombre de fois:
                </label>
                <input
                  type="number"
                  id="limit-number"
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                  value={limitNumber}
                  onChange={(e) =>
                    setLimitNumber(parseInt(e.target.value) || 1)
                  }
                  min="1"
                  max="99"
                />
              </div>
            )}
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-red-400 transition-colors">
            <div className="flex items-center mb-1">
              <input
                type="radio"
                id="exclusive"
                name="availability"
                className="mr-2 text-red-500 focus:ring-red-400"
                checked={availability === "exclusive"}
                onChange={() => handleAvailabilityChange("exclusive")}
              />
              <label
                htmlFor="exclusive"
                className="font-medium dark:text-white"
              >
                Exclusif
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-5">
              Ce flash ne sera tatoué qu'une seule fois (pièce unique)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="size"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Taille recommandée
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-white"
            >
              <option value="">Sélectionner une taille</option>
              <option value="xs">Très petit (&lt; 5cm)</option>
              <option value="s">Petit (5-10cm)</option>
              <option value="m">Moyen (10-15cm)</option>
              <option value="l">Grand (15-20cm)</option>
              <option value="xl">Très grand (&gt; 20cm)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="placement"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Emplacement recommandé
            </label>
            <select
              id="placement"
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-white"
            >
              <option value="">Sélectionner un emplacement</option>
              <option value="arm">Bras</option>
              <option value="forearm">Avant-bras</option>
              <option value="leg">Jambe</option>
              <option value="ankle">Cheville</option>
              <option value="back">Dos</option>
              <option value="chest">Poitrine</option>
              <option value="shoulder">Épaule</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleSaveDraft}
          disabled={!titre.trim() && !description.trim()}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer brouillon
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            !titre.trim() || !price || !description.trim() || isSubmitting
          }
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Publication..." : "Publier"}
        </button>
      </div>
    </div>
  );
}
