import React, { useState } from "react";
import { PlusCircle, X } from "lucide-react";

export default function FlashUploadPage() {
  const [availability, setAvailability] = useState("unlimited");
  const [tags, setTags] = useState(["Old School", "Rose"]);
  const [newTag, setNewTag] = useState("");
  const [limitNumber, setLimitNumber] = useState(3);
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAvailabilityChange = (value) => {
    setAvailability(value);
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Publier un Flash</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 dark:text-white">
          Image du Flash
        </h2>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-6 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
          <div className="text-4xl text-gray-400 dark:text-gray-500 mb-2">
            +
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Cliquez pour ajouter une photo
            <br />
            ou faites glisser l'image ici
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="titre"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Titre du Flash
            </label>
            <input
              type="text"
              id="titre"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Rose traditionnelle"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Prix (€)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                €
              </span>
              <input
                type="number"
                id="price"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                placeholder="150"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
              placeholder="Décrivez votre flash (taille, couleurs, emplacement recommandé, etc.)"
              rows="4"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-white"
            >
              <option value="" disabled selected>
                Sélectionner une taille
              </option>
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-white"
            >
              <option value="" disabled selected>
                Sélectionner un emplacement
              </option>
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
        <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors">
          Enregistrer brouillon
        </button>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors">
          Publier
        </button>
      </div>
    </div>
  );
}
