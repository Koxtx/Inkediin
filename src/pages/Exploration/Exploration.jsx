import React, { useState } from "react";
import { Search, Circle, MapPin, DollarSign, Star, Calendar, ChevronRight, Heart } from "lucide-react";
import Filter from "./components/Filter";
import ArtistCard from "./components/ArtistCard";
import FlashCard from "./components/FlashCard";

export default function Exploration() {
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedStyle, setSelectedStyle] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResultTab, setActiveResultTab] = useState("artists");
  
  const styles = ["Tous", "Flash", "Réaliste", "Old School", "Géométrique", "Japonais", "Minimaliste", "Aquarelle"];
  
  const artists = [
    { 
      id: 1,
      name: "TattooArtist1", 
      specialty: "Old School",
      location: "Paris",
      distance: "15km",
      portfolio: [1, 2, 3, 4]
    },
    { 
      id: 2,
      name: "TattooArtist2", 
      specialty: "Géométrique",
      location: "Lyon",
      distance: "5km",
      portfolio: [5, 6, 7, 8] 
    },
    { 
      id: 3,
      name: "TattooArtist3", 
      specialty: "Flash",
      location: "Marseille",
      distance: "8km",
      portfolio: [9, 10, 11, 12] 
    },
    { 
      id: 4,
      name: "TattooArtist4", 
      specialty: "Réaliste",
      location: "Bordeaux",
      distance: "12km",
      portfolio: [13, 14, 15, 16] 
    }
  ];
  
  const flashDesigns = [
    { id: 1, artist: "TattooArtist1", price: 150 },
    { id: 2, artist: "TattooArtist3", price: 120 },
    { id: 3, artist: "TattooArtist2", price: 200 },
    { id: 4, artist: "TattooArtist4", price: 180 }
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab("search-results");
    }
  };

  const handleStyleFilter = (style) => {
    setSelectedStyle(style);
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="px-3 py-2">
              <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-3 px-2 outline-none bg-transparent dark:text-white"
              placeholder="Rechercher des tatouages..."
            />
          </div>
        </form>
      </div>
      
      {/* Filter buttons */}
      <div className="mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 pb-2">
          <Filter icon={<Circle className="h-4 w-4" />} label="Style" />
          <Filter icon={<MapPin className="h-4 w-4" />} label="Localisation" />
          <Filter icon={<DollarSign className="h-4 w-4" />} label="Prix" />
          <Filter icon={<Star className="h-4 w-4" />} label="Note" />
          <Filter icon={<Calendar className="h-4 w-4" />} label="Disponibilité" />
        </div>
      </div>
      
      {/* Style quick filters */}
      <div className="mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 pb-2">
          {styles.map((style) => (
            <button
              key={style}
              className={`${
                selectedStyle === style ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
              } transition-colors text-white text-sm md:text-base px-4 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
              onClick={() => handleStyleFilter(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content tabs */}
      {activeTab === "explore" ? (
        <div>
          {/* Featured artists section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Tatoueurs recommandés</h2>
              <button className="text-red-500 flex items-center text-sm font-medium">
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artists.slice(0, 2).map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
          
          {/* Flash designs section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Flashs populaires</h2>
              <button className="text-red-500 flex items-center text-sm font-medium">
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {flashDesigns.map((flash) => (
                <FlashCard key={flash.id} flash={flash} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Search results tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button 
              className={`px-4 py-2 text-sm font-medium ${
                activeResultTab === "artists" 
                ? "text-red-500 border-b-2 border-red-500" 
                : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveResultTab("artists")}
            >
              Tatoueurs (8)
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeResultTab === "designs" 
                ? "text-red-500 border-b-2 border-red-500" 
                : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveResultTab("designs")}
            >
              Flashs (24)
            </button>
          </div>
          
          {/* Search results content */}
          {activeResultTab === "artists" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...flashDesigns, ...flashDesigns].map((flash, index) => (
                <FlashCard key={`${flash.id}-${index}`} flash={flash} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

