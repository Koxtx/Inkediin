import React, { useContext, useState } from "react";
import { FlashContext } from "../../context/FlashContext";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("recent");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { savedFlashes } = useContext(FlashContext);

  const categories = ["Tous", "Flash", "Réaliste", "Old School", "Géométrique"];
  
  const sortOptions = [
    { value: "recent", label: "Plus récents" },
    { value: "oldest", label: "Plus anciens" },
    { value: "title", label: "Titre A-Z" },
    { value: "artist", label: "Artiste A-Z" },
    { value: "views", label: "Plus vus" },
    { value: "comments", label: "Plus commentés" }
  ];

  // Fonction de tri
  const sortFlashes = (flashes, sortType) => {
    const sorted = [...flashes];
    
    switch (sortType) {
      case "recent":
        return sorted.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt || a.id) - new Date(b.createdAt || b.id));
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "artist":
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case "views":
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "comments":
        return sorted.sort((a, b) => (b.comments || 0) - (a.comments || 0));
      default:
        return sorted;
    }
  };

  // Filtrage par catégorie
  const filteredFlashes = selectedCategory === "Tous"
    ? savedFlashes
    : savedFlashes.filter((flash) => flash.category === selectedCategory);

  // Application du tri
  const sortedAndFilteredFlashes = sortFlashes(filteredFlashes, sortBy);

  const getCurrentSortLabel = () => {
    return sortOptions.find(option => option.value === sortBy)?.label || "Trier";
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">
        Flashs sauvegardés
      </h2>

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
              selectedCategory === category
                ? "bg-red-500"
                : "bg-red-400 hover:bg-red-500"
            } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* En-tête de section avec nombre et tri */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          Flashs sauvegardés ({sortedAndFilteredFlashes.length})
        </h3>
        
        {/* Menu de tri avec dropdown */}
        <div className="relative">
          <button 
            className="flex items-center px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            {getCurrentSortLabel()} <span className="ml-1">▼</span>
          </button>
          
          {/* Menu dropdown */}
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-40">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                    sortBy === option.value ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''
                  }`}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortMenu(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grille de favoris */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {sortedAndFilteredFlashes.map((flash) => (
          <Link
            to="/flashdetail"
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
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {flash.artist}
                </span>
              </div>

              {/* Titre et catégorie */}
              <h3 className="font-bold mb-1">{flash.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {flash.category}
              </p>

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
          </Link>
        ))}
      </div>

      {/* Message si aucun flash trouvé */}
      {sortedAndFilteredFlashes.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun flash sauvegardé dans cette catégorie
        </div>
      )}
      
      {/* Overlay pour fermer le menu de tri */}
      {showSortMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
}