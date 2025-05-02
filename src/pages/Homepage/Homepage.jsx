import React, { useState } from "react";

export default function Homepage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  
  const categories = ["Tous", "Flash", "Réaliste", "Old School", "Géométrique"];
  
  const artists = [
    { name: "TattooArtist1", category: "Flash" },
    { name: "TattooArtist2", category: "Réaliste" },
    { name: "TattooArtist3", category: "Old School" },
    { name: "TattooArtist4", category: "Géométrique" },
    { name: "TattooArtist5", category: "Flash" },
    { name: "TattooArtist6", category: "Réaliste" },
    { name: "TattooArtist7", category: "Old School" },
    { name: "TattooArtist8", category: "Géométrique" },
  ];
  
  const filteredArtists = selectedCategory === "Tous" 
    ? artists 
    : artists.filter(artist => artist.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Découvrez les artistes</h2>

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

      {/* Grille d'artistes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filteredArtists.map((artist, index) => (
          <div 
            key={index} 
            className="rounded-lg overflow-hidden flex flex-col shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
          >
            <div className="bg-red-400 p-2 md:p-3 flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white"></div>
              <div className="font-bold text-white truncate">{artist.name}</div>
            </div>
            <div className="h-32 sm:h-40 md:h-48 bg-gray-700 relative">
              <div className="absolute bottom-2 right-2 text-xs bg-black bg-opacity-70 px-2 py-1 rounded-full text-white">
                {artist.category}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun artiste trouvé */}
      {filteredArtists.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun artiste trouvé dans cette catégorie
        </div>
      )}
    </div>
  );
}