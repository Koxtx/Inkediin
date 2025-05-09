import React, { useState } from "react";
import { Search, Heart, MessageCircle, Image } from "lucide-react";

export default function RecommandationPerso() {
  const [activeTab, setActiveTab] = useState("pourVous");
  
  const tabs = [
    { id: "pourVous", label: "Pour vous" },
    { id: "tatoueurs", label: "Tatoueurs" },
    { id: "styles", label: "Styles" },
    { id: "local", label: "Local" }
  ];

  // Données de recommandation
  const recommendedCards = [
    {
      id: 1,
      category: "Réaliste",
      artistName: "InkMaster92",
      location: "Paris, France",
      title: "Portrait réaliste en noir et gris",
      tags: ["Réaliste", "Portrait", "Noir et gris"],
      likes: 842,
      comments: 124
    },
    {
      id: 2,
      category: "Géométrique",
      artistName: "GeoInk",
      location: "Lyon, France",
      title: "Mandala avec éléments géométriques",
      tags: ["Géométrique", "Mandala", "Linework"],
      likes: 756,
      comments: 98
    }
  ];

  const recommendedArtists = [
    { id: 1, name: "OldSchoolTat", style: "Old School, Traditionnel", avatar: "O" },
    { id: 2, name: "MiniArt", style: "Minimaliste, Linework", avatar: "M" },
    { id: 3, name: "BlackworkPro", style: "Blackwork, Dotwork", avatar: "B" },
    { id: 4, name: "AquaInk", style: "Aquarelle, Coloré", avatar: "A" }
  ];

  const trendingStyles = [
    { id: 1, title: "Floral minimaliste", trend: "+28% ce mois-ci" },
    { id: 2, title: "Micro-réalisme", trend: "+23% ce mois-ci" },
    { id: 3, title: "Néo-traditionnel", trend: "+19% ce mois-ci" },
    { id: 4, title: "Blackout", trend: "+15% ce mois-ci" }
  ];

  const similarInspirations = [
    {
      id: 1,
      category: "Japonais",
      artistName: "YukioTattoo",
      location: "Marseille, France",
      title: "Dragon Irezumi traditionnel",
      tags: ["Japonais", "Irezumi", "Dragon", "Couleur"],
      likes: 632,
      comments: 87
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Navigation par onglets */}
      <div className="flex overflow-x-auto space-x-2 pb-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${
              activeTab === tab.id 
                ? "bg-red-500" 
                : "bg-red-400 hover:bg-red-500"
            } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Barre de recherche */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full bg-white dark:bg-gray-800 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
          placeholder="Rechercher des tatouages..."
        />
      </div>
      
      {activeTab === "pourVous" && (
        <div>
          {/* Section "Pour vous" */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Pour vous</h2>
              <button className="text-red-500 hover:text-red-600 font-medium text-sm">
                Voir tout
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Basé sur vos tatouages favoris et vos recherches récentes
            </p>
            
            {/* Cartes de tatouages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {recommendedCards.map((card) => (
                <div 
                  key={card.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
                >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      {card.category}
                    </div>
                  </div>
                  <div className="p-4">
                    {/* Artist info */}
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white font-bold">
                        {card.artistName.charAt(0)}
                      </div>
                      <div className="ml-2">
                        <div className="font-medium">{card.artistName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{card.location}</div>
                      </div>
                    </div>
                    
                    <h3 className="font-bold mb-3">{card.title}</h3>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {card.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-between mt-3">
                      <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500">
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="text-sm">{card.likes}</span>
                      </button>
                      <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">{card.comments}</span>
                      </button>
                      <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <Image className="h-4 w-4 mr-1" />
                        <span className="text-sm">Voir plus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Section Tatoueurs recommandés */}
            <h2 className="text-xl font-bold mb-4">Tatoueurs recommandés pour vous</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {recommendedArtists.map((artist) => (
                <div 
                  key={artist.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="h-24 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="relative px-4 pt-8 pb-4">
                    <div className="absolute -top-6 left-4 w-12 h-12 rounded-full bg-red-400 flex items-center justify-center text-white text-xl font-bold">
                      {artist.avatar}
                    </div>
                    <h3 className="font-bold">{artist.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{artist.style}</p>
                    <button className="w-full bg-red-400 hover:bg-red-500 text-white py-1 rounded-lg transition-colors">
                      Suivre
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Section Tendances */}
            <h2 className="text-xl font-bold mb-4">Tendances populaires</h2>
            <div className="flex overflow-x-auto gap-4 pb-2 mb-8">
              {trendingStyles.map((trend) => (
                <div 
                  key={trend.id}
                  className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-3">
                    <h3 className="font-bold">{trend.title}</h3>
                    <p className="text-sm text-green-500">{trend.trend}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Section Inspirations similaires */}
            <h2 className="text-xl font-bold mb-4">Inspirations similaires à vos favoris</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarInspirations.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
                >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4">
                    {/* Artist info */}
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white font-bold">
                        {item.artistName.charAt(0)}
                      </div>
                      <div className="ml-2">
                        <div className="font-medium">{item.artistName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.location}</div>
                      </div>
                    </div>
                    
                    <h3 className="font-bold mb-3">{item.title}</h3>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-between mt-3">
                      <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500">
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="text-sm">{item.likes}</span>
                      </button>
                      <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">{item.comments}</span>
                      </button>
                      <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <Image className="h-4 w-4 mr-1" />
                        <span className="text-sm">Voir plus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Les autres onglets pourraient être ajoutés ici avec condition */}
      {activeTab !== "pourVous" && (
        <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Contenu de l'onglet {tabs.find(tab => tab.id === activeTab)?.label} à venir
          </p>
        </div>
      )}
    </div>
  );
}