import React, { useState } from "react";
import { CheckIcon, PlusIcon } from "lucide-react";

export default function Tag() {
  const [activeTab, setActiveTab] = useState("styles");
  
  // État initial pour les tags sélectionnés
  const [selectedTags, setSelectedTags] = useState({
    styles: ["Old School", "Réaliste", "Géométrique"],
    thematiques: ["Nature", "Portrait"],
    emplacements: ["Bras", "Poitrine"]
  });
  
  // État pour les toggles de préférences
  const [preferences, setPreferences] = useState({
    showAsSpecialties: true,
    suggestToClients: true,
    acceptOutsideStyles: false
  });

  // Fonction pour changer d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Fonction pour toggler un tag
  const toggleTag = (category, tagName) => {
    setSelectedTags(prev => {
      const updatedCategory = [...prev[category]];
      
      if (updatedCategory.includes(tagName)) {
        return {
          ...prev,
          [category]: updatedCategory.filter(tag => tag !== tagName)
        };
      } else {
        return {
          ...prev,
          [category]: [...updatedCategory, tagName]
        };
      }
    });
  };

  // Fonction pour changer une préférence
  const togglePreference = (prefName) => {
    setPreferences(prev => ({
      ...prev,
      [prefName]: !prev[prefName]
    }));
  };

  // Données pour les différentes catégories de tags
  const tagCategories = {
    styles: ["Old School", "Réaliste", "Tribal", "Japonais", "Géométrique", "Minimaliste", "Neo-traditionnelle"],
    thematiques: ["Nature", "Animaux", "Symbolique", "Portrait", "Abstrait"],
    emplacements: ["Bras", "Jambe", "Dos", "Poitrine", "Main"]
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Gestion des styles</h2>

      {/* Tabs */}
      <div className="flex mb-5 border-b dark:border-gray-700">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "styles"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-500 dark:text-gray-400 hover:text-red-500"
          }`}
          onClick={() => handleTabChange("styles")}
        >
          Mes styles
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "preferences"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-500 dark:text-gray-400 hover:text-red-500"
          }`}
          onClick={() => handleTabChange("preferences")}
        >
          Préférences
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {activeTab === "styles" && (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sélectionnez les styles qui vous représentent ou que vous recherchez
            </p>

            {/* Styles populaires */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Styles populaires</h3>
              <div className="flex flex-wrap gap-2">
                {tagCategories.styles.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag("styles", tag)}
                    className={`flex items-center rounded-full px-3 py-1 text-sm ${
                      selectedTags.styles.includes(tag)
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span>{tag}</span>
                    <span className="ml-1">
                      {selectedTags.styles.includes(tag) ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Thématiques */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Thématiques</h3>
              <div className="flex flex-wrap gap-2">
                {tagCategories.thematiques.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag("thematiques", tag)}
                    className={`flex items-center rounded-full px-3 py-1 text-sm ${
                      selectedTags.thematiques.includes(tag)
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span>{tag}</span>
                    <span className="ml-1">
                      {selectedTags.thematiques.includes(tag) ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Emplacements */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Emplacements</h3>
              <div className="flex flex-wrap gap-2">
                {tagCategories.emplacements.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag("emplacements", tag)}
                    className={`flex items-center rounded-full px-3 py-1 text-sm ${
                      selectedTags.emplacements.includes(tag)
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span>{tag}</span>
                    <span className="ml-1">
                      {selectedTags.emplacements.includes(tag) ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ajouter un style personnalisé */}
            <button className="flex items-center text-red-500 hover:text-red-600 font-medium mb-8">
              <PlusIcon className="h-5 w-5 mr-1" />
              <span>Ajouter un style personnalisé</span>
            </button>
          </>
        )}

        {activeTab === "preferences" || activeTab === "styles" ? (
          <div className={`${activeTab === "styles" ? "pt-4 border-t dark:border-gray-700" : ""}`}>
            {activeTab === "preferences" && (
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Gérez vos préférences pour les styles et catégories de tatouages
              </p>
            )}
            
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
              Préférences pour les tatoueurs
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Afficher mes styles en tant que spécialités
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.showAsSpecialties}
                    onChange={() => togglePreference("showAsSpecialties")}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Suggérer aux clients ayant des styles similaires
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.suggestToClients}
                    onChange={() => togglePreference("suggestToClients")}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Accepter les demandes hors de mes styles
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.acceptOutsideStyles}
                    onChange={() => togglePreference("acceptOutsideStyles")}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}