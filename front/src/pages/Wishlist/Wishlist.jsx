import React, { useContext, useState } from "react";
import { FlashContext } from "../../context/FlashContext";

export default function Wishlist() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { savedFlashes } = useContext(FlashContext);
  
  const categories = ["Tous", "Flash", "Réaliste", "Old School", "Géométrique"];
  
  const filteredFlashes = selectedCategory === "Tous" 
    ? savedFlashes 
    : savedFlashes.filter(flash => flash.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Flashs sauvegardés</h2>

      {/* Catégories - version mobile (dropdown) */}
      <div className="block sm:hidden mb-5">
        <select 
          className="w-full bg-red-400 text-white px-4 py-2 rounded-lg"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Catégories - version tablette/desktop */}
      <div className="hidden sm:flex overflow-x-auto gap-2 md:gap-3 mb-5 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`${
              selectedCategory === category ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
            } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* En-tête de section avec nombre et tri */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Flashs sauvegardés ({filteredFlashes.length})</h3>
        <button className="flex items-center px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          Trier <span className="ml-1">▼</span>
        </button>
      </div>

      {/* Grille de favoris */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filteredFlashes.map((flash) => (
          <div 
            key={flash.id} 
            className="rounded-lg overflow-hidden flex flex-col shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
          >
            {/* Image de preview */}
            <div className="h-40 sm:h-48 bg-gray-700 relative">
              <button className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white bg-opacity-70 rounded-full text-red-500 hover:bg-opacity-100 transition-all">
                ❤️
              </button>
            </div>
            
            {/* Détails du flash */}
            <div className="p-3 bg-white dark:bg-gray-800">
              {/* Info artiste */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-red-400"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{flash.artist}</span>
              </div>
              
              {/* Titre et catégorie */}
              <h3 className="font-bold mb-1">{flash.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{flash.category}</p>
              
              {/* Barre d'actions */}
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
                <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
                  💬 <span>{flash.comments}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
                  👁️ <span>{flash.views}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun flash trouvé */}
      {filteredFlashes.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun flash sauvegardé dans cette catégorie
        </div>
      )}
    </div>
  );
}