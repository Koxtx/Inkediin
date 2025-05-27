// src/components/promotion/PromotionForm.js
import React, { useContext } from "react";
import { PromotionContext } from "../../../context/PromotionContext";

export default function PromotionForm() {
  const { 
    newPromotion, 
    updatePromotionField, 
    createPromotion, 
    availableCategories,
    handleCategoryToggle, 
    addNewCategory 
  } = useContext(PromotionContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    createPromotion();
  };

  const handleAddNewCategory = () => {
    const category = prompt("Entrez le nom de la nouvelle catégorie:");
    if (category) {
      addNewCategory(category);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Créer une nouvelle promotion</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la promotion
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              placeholder="ex: -20% sur les tatouages flash"
              value={newPromotion.title}
              onChange={(e) => updatePromotionField("title", e.target.value)}
              required
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
              value={newPromotion.description}
              onChange={(e) => updatePromotionField("description", e.target.value)}
              required
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
              value={newPromotion.discount}
              onChange={(e) => updatePromotionField("discount", e.target.value)}
              required
              min="1"
              max="100"
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
                value={newPromotion.startDate}
                onChange={(e) => updatePromotionField("startDate", e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                value={newPromotion.endDate}
                onChange={(e) => updatePromotionField("endDate", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégories de tatouages concernées
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <span
                  key={category}
                  className={`${
                    newPromotion.categories.includes(category) 
                      ? "bg-red-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  } px-3 py-1 rounded-full text-sm flex items-center cursor-pointer`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                  {newPromotion.categories.includes(category) && <span className="ml-1">×</span>}
                </span>
              ))}
              <span
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={handleAddNewCategory}
              >
                + Ajouter
              </span>
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Publier la promotion
          </button>
        </form>
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
  );
}