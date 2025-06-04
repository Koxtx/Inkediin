import React, { useState } from "react";
import { Edit, Plus, Settings, Camera, Eye } from "lucide-react";

export default function ProfilTatoueurProprietaire() {
  // Mock data - remplacez par votre contexte réel
  const [userProfile, setUserProfile] = useState({
    avatar: "TA",
    username: "TattooArtist",
    specialty: "Tatoueur traditionnel",
    location: "Paris, France",
    bio: "Passionné de tatouage traditionnel depuis 15 ans. Spécialisé dans les designs old school et neo-traditionnel.",
    styles: ["Old School", "Neo-traditionnel", "Blackwork"]
  });

  const [stats] = useState({
    realizations: 127,
    flashes: 23,
    followers: 1205
  });

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(userProfile.bio);

  const handleSaveBio = () => {
    setUserProfile({ ...userProfile, bio: tempBio });
    setIsEditingBio(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header avec boutons d'action du propriétaire */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <div className="flex gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <Eye size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* En-tête du profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-red-400 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4">
            {userProfile.avatar}
          </div>
          <button className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {userProfile.username}
          </h1>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Edit size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <p className="text-gray-600 dark:text-gray-300">
            {userProfile.specialty}
          </p>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Edit size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="mr-1">📍</span> {userProfile.location}
          </p>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Edit size={16} />
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="flex justify-center gap-6 sm:gap-12 mb-8">
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">
            {stats.realizations}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Réalisations
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">
            {stats.flashes}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Flashs</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">
            {stats.followers}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Abonnés
          </div>
        </div>
      </div>

      {/* Boutons d'action propriétaire */}
      <div className="flex justify-center gap-4 mb-8">
        <button className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
          Modifier le profil
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
          Paramètres
        </button>
      </div>

      {/* Bio avec édition en ligne */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-bold">Bio</h2>
          {!isEditingBio && (
            <button 
              onClick={() => setIsEditingBio(true)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Edit size={18} />
            </button>
          )}
        </div>
        
        {isEditingBio ? (
          <div className="space-y-3">
            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-800 dark:text-gray-200"
              rows={4}
              placeholder="Parlez-nous de vous..."
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSaveBio}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sauvegarder
              </button>
              <button 
                onClick={() => {
                  setIsEditingBio(false);
                  setTempBio(userProfile.bio);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            {userProfile.bio || "Aucune biographie disponible."}
          </p>
        )}
      </div>

      {/* Styles avec gestion */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-bold">Styles</h2>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Edit size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {userProfile.styles?.map((style, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-red-400 text-white text-sm rounded-full flex items-center gap-1"
            >
              {style}
              <button className="ml-1 text-red-200 hover:text-white">×</button>
            </span>
          )) || (
            <span className="text-gray-600 dark:text-gray-400">
              Aucun style spécifié
            </span>
          )}
          <button className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-red-400 hover:text-red-400 transition-colors flex items-center gap-1">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {/* Portfolio avec gestion */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Portfolio</h2>
          <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm">
            <Plus size={16} /> Ajouter
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30">
                  <Edit size={16} />
                </button>
                <button className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100">
                  ×
                </button>
              </div>
            </div>
          ))}
          <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-red-400 dark:hover:border-red-400 transition-colors cursor-pointer">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Plus size={24} className="mx-auto mb-2" />
              <span className="text-sm">Ajouter une image</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flashs disponibles avec gestion */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Flashs disponibles</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm">
              <Plus size={16} /> Ajouter
            </button>
            <a
              href="#"
              className="text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              Gérer tout
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30">
                  <Edit size={16} />
                </button>
                <button className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100">
                  ×
                </button>
              </div>
            </div>
          ))}
          <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-red-400 dark:hover:border-red-400 transition-colors cursor-pointer">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Plus size={24} className="mx-auto mb-2" />
              <span className="text-sm">Nouveau flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}