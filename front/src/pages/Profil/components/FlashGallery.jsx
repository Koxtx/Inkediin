import React from "react";
import { Plus, Edit, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FlashGallery({ 
  displayUser, 
  isOwnProfile, 
  flashs = [],
  onAddFlash, 
  onEditFlash, 
  onDeleteFlash, 
  onLikeFlash,
  onViewAll
}) {
  const navigate = useNavigate();

  // Données factices pour les flashs si pas de données
  const defaultFlashs = [
    { id: 1, title: "Rose traditionnelle", style: "Old School", price: 150, available: true },
    { id: 2, title: "Crâne géométrique", style: "Géométrique", price: 200, available: true },
    { id: 3, title: "Dragon japonais", style: "Japonais", price: 300, available: false },
    { id: 4, title: "Mandala", style: "Géométrique", price: 180, available: true }
  ];

  const flashsToDisplay = flashs.length > 0 ? flashs : defaultFlashs;
  const displayedFlashs = flashsToDisplay.slice(0, isOwnProfile ? 3 : 4);

  const handleAddFlash = () => {
    navigate("/flashupload"); // Utilise votre page existante
  };

  const handleViewAll = () => {
    navigate("/flashs");
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">
          {isOwnProfile ? 'Mes flashs disponibles' : 'Flashs disponibles'}
        </h2>
        {isOwnProfile ? (
          <div className="flex gap-2">
            <button 
              onClick={handleAddFlash}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
            <button
              onClick={handleViewAll}
              className="text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              Gérer tout
            </button>
          </div>
        ) : (
          <button
            onClick={onViewAll}
            className="text-red-500 hover:text-red-600 transition-colors text-sm"
          >
            Voir tout
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {displayedFlashs.map((flash) => (
          <div
            key={flash.id}
            className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            {/* Image placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-300 text-xs text-center p-2">
                {flash.title}
              </span>
            </div>

            {/* Overlay avec informations */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="font-medium text-sm mb-1">{flash.title}</div>
                <div className="text-xs text-gray-300 mb-1">{flash.style}</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">{flash.price}€</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    flash.available 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {flash.available ? 'Disponible' : 'Réservé'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions pour le propriétaire */}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => navigate(`/flashedit/${flash.id}`)}
                  className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => onDeleteFlash && onDeleteFlash(flash.id)}
                  className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100 transition-all"
                >
                  ×
                </button>
              </div>
            )}

            {/* Badge de statut */}
            <div className="absolute top-2 left-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                flash.available 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {flash.available ? 'Dispo' : 'Réservé'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques des flashs pour le propriétaire */}
      {isOwnProfile && flashsToDisplay.length > 0 && (
        <div className="mt-4 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-2 flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total: <span className="font-medium text-gray-900 dark:text-gray-100">{flashsToDisplay.length}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Disponibles: <span className="font-medium text-green-600">{flashsToDisplay.filter(f => f.available).length}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Réservés: <span className="font-medium text-red-600">{flashsToDisplay.filter(f => !f.available).length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
