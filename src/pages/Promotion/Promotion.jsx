import React, { useState } from "react";
import { EyeIcon, HeartIcon, MessageSquareIcon } from "lucide-react";

export default function Promotion() {
  const [activeTab, setActiveTab] = useState("creation");
  const [selectedCategories, setSelectedCategories] = useState(["Flash", "Réaliste", "Old School"]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const addNewCategory = () => {
    // Ici on pourrait ajouter une logique pour permettre à l'utilisateur d'ajouter une catégorie
    // Par exemple, afficher un modal ou un input
    alert("Fonctionnalité pour ajouter une catégorie");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Promotions temporaires</h2>

      {/* Tabs */}
      <div className="flex mb-5 border-b dark:border-gray-700">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "creation"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-500 dark:text-gray-400 hover:text-red-500"
          }`}
          onClick={() => handleTabChange("creation")}
        >
          Création
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "historique"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-500 dark:text-gray-400 hover:text-red-500"
          }`}
          onClick={() => handleTabChange("historique")}
        >
          Historique
        </button>
      </div>

      {/* Creation Section */}
      {activeTab === "creation" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Créer une nouvelle promotion</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre de la promotion
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                placeholder="ex: -20% sur les tatouages flash"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Décrivez votre offre spéciale..."
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Réduction (%)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                placeholder="ex: 20"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégories de tatouages concernées
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center cursor-pointer"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                    <span className="ml-1">×</span>
                  </span>
                ))}
                <span
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={addNewCategory}
                >
                  + Ajouter
                </span>
              </div>
            </div>
            
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
              Publier la promotion
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Conseils pour les promotions</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>Les promotions courtes (1-2 semaines) génèrent plus d'engagement</li>
              <li>Publiez vos promotions avant les périodes chargées (vacances, etc.)</li>
              <li>Ajoutez des photos de votre travail pour augmenter la visibilité</li>
            </ul>
          </div>
        </div>
      )}

      {/* History Section */}
      {activeTab === "historique" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold dark:text-white">-20% sur les Flash Tattoos</h3>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">Active</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Du 10/04/2025 au 25/04/2025</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Offre spéciale de printemps! 20% de réduction sur tous les modèles flash disponibles en studio.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span>254</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span>42</span>
                </div>
                <div className="flex items-center">
                  <MessageSquareIcon className="h-4 w-4 mr-1" />
                  <span>18</span>
                </div>
              </div>
            </div>
            <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
              <button className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">
                Modifier
              </button>
              <button className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">
                Terminer
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold dark:text-white">Offre découverte: Premier tatouage -15%</h3>
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs">Terminée</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Du 01/03/2025 au 31/03/2025</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Offre pour les nouveaux clients. 15% de réduction sur le premier tatouage en studio.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span>487</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span>98</span>
                </div>
                <div className="flex items-center">
                  <MessageSquareIcon className="h-4 w-4 mr-1" />
                  <span>36</span>
                </div>
              </div>
            </div>
            <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
              <button className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">
                Statistiques
              </button>
              <button className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors">
                Relancer
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold dark:text-white">Offre Saint-Valentin: Tatouages duo</h3>
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs">Terminée</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Du 01/02/2025 au 14/02/2025</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Venez en couple et recevez 25% de réduction sur le deuxième tatouage.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span>312</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span>85</span>
                </div>
                <div className="flex items-center">
                  <MessageSquareIcon className="h-4 w-4 mr-1" />
                  <span>29</span>
                </div>
              </div>
            </div>
            <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
              <button className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">
                Statistiques
              </button>
              <button className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors">
                Relancer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom spacing */}
      <div className="h-16"></div>
    </div>
  );
}