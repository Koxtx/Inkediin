import React, { useState } from "react";
import { Eye, Heart, MessageCircle, Edit, EyeOff, Menu, Search, Grid, Home, User, PlusCircle, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function PortfolioManagement() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  
  const categories = ["Tous", "Flash", "Réaliste", "Old School", "Géométrique", "Tribal"];
  
  const portfolioItems = [
    {
      id: 1,
      name: "Tattoo #1",
      stats: {
        views: 245,
        likes: 67,
        requests: 12
      }
    },
    {
      id: 2,
      name: "Tattoo #2",
      stats: {
        views: 183,
        likes: 42,
        requests: 7
      }
    },
    {
      id: 3,
      name: "Tattoo #3",
      stats: {
        views: 315,
        likes: 98,
        requests: 23
      }
    },
    {
      id: 4,
      name: "Tattoo #4",
      stats: {
        views: 127,
        likes: 31,
        requests: 4
      }
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white pb-16">
      {/* Titre de la page */}
      <h1 className="text-xl sm:text-2xl font-bold px-4 py-4">Gestion du Portfolio</h1>
      
      {/* Catégories - version mobile (tablette/desktop) */}
      <div className="flex overflow-x-auto gap-2 md:gap-3 mb-4 px-4 pb-2">
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
      
      {/* Titre de section */}
      <h2 className="text-lg font-semibold px-4 py-2">Organisation des réalisations</h2>
      
      {/* Grille du portfolio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {portfolioItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md relative transition-transform duration-300 hover:transform hover:scale-105"
          >
            {/* Poignée de glisser-déposer */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center cursor-move">
              <Menu size={18} className="text-white" />
            </div>
            
            {/* Image du tatouage */}
            <div className="h-40 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              {item.name}
            </div>
            
            {/* Statistiques */}
            <div className="p-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between items-center mb-1">
                <span className="flex items-center"><Eye size={16} className="mr-1" /> Vues:</span>
                <span>{item.stats.views}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="flex items-center"><Heart size={16} className="mr-1" /> Likes:</span>
                <span>{item.stats.likes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center"><MessageCircle size={16} className="mr-1" /> Demandes:</span>
                <span>{item.stats.requests}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between p-3 border-t border-gray-200 dark:border-gray-700">
              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors">
                <Edit size={14} className="mr-1" /> Modifier
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors">
                <EyeOff size={14} className="mr-1" /> Masquer
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Barre de recherche flottante - version mobile */}
      <div className="fixed top-4 right-4 sm:hidden">
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-2">
          <Search size={18} className="text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none focus:outline-none ml-2 text-sm w-24"
          />
        </div>
      </div>
      
      {/* Footer - navigation mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 md:hidden">
        <Link to="/" className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="p-1 rounded-md">
            <Home size={20} />
          </div>
          <span>Accueil</span>
        </Link>
        <Link to="/explore" className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="p-1 rounded-md">
            <Grid size={20} />
          </div>
          <span>Explorer</span>
        </Link>
        <Link to="/add" className="flex flex-col items-center text-xs text-red-500">
          <div className="p-1 rounded-md">
            <PlusCircle size={24} />
          </div>
          <span>Ajouter</span>
        </Link>
        <Link to="/notifications" className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="p-1 rounded-md">
            <Bell size={20} />
          </div>
          <span>Alertes</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="p-1 rounded-md">
            <User size={20} />
          </div>
          <span>Profil</span>
        </Link>
      </div>
    </div>
  );
}