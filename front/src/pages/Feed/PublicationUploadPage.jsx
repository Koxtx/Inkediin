import React, { useState, useContext } from "react";
import { PlusCircle, X, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicationContext } from "../../context/PublicationContext";

export default function PublicationUploadPage() {
  const { addPublication } = useContext(PublicationContext);
  const navigate = useNavigate();
  
  const [contenu, setContenu] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
    if (contenu.trim() === "") return;
    
    setIsSubmitting(true);
    
    try {
      const publicationData = {
        contenu: contenu.trim(),
        image: selectedImage,
        tags: tags,
        username: "Votre nom", // À remplacer par les données utilisateur réelles
        idTatoueur: "current_user" // À remplacer par l'ID utilisateur réel
      };

      const newPublication = addPublication(publicationData);
      
      // Rediriger vers le feed après publication
      navigate("/", { 
        state: { 
          message: "Publication créée avec succès !", 
          newPostId: newPublication.id 
        } 
      });
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      alert("Erreur lors de la publication. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Sauvegarder en local storage ou via une API
    const draftData = {
      contenu,
      tags,
      imagePreview,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem("publication_draft", JSON.stringify(draftData));
    alert("Brouillon sauvegardé !");
  };

  // Charger un brouillon au montage du composant
  React.useEffect(() => {
    const savedDraft = localStorage.getItem("publication_draft");
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      if (window.confirm("Un brouillon a été trouvé. Voulez-vous le charger ?")) {
        setContenu(draftData.contenu || "");
        setTags(draftData.tags || []);
        if (draftData.imagePreview) {
          setImagePreview(draftData.imagePreview);
        }
      }
    }
  }, []);

  const remainingChars = 2000 - contenu.length;

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
              Votre message
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
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
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
                    PNG, JPG jusqu'à 10MB
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
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (optionnels)
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
                    onBlur={addTag}
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
                  <PlusCircle size={18} className="mr-1" /> Ajouter un tag
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Les tags aident à catégoriser votre publication (ex: Réalisme, Blackwork, Neo-traditionnel...)
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
          disabled={contenu.trim() === ""}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer brouillon
        </button>
        <button
          onClick={handleSubmit}
          disabled={contenu.trim() === "" || isSubmitting}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Publication..." : "Publier"}
        </button>
      </div>
    </div>
  );
}