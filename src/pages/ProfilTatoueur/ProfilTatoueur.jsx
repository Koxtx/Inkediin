import React from "react";
import { ProfilContext } from "../../context/ProfilContext";
import { useContext } from "react";

export default function ProfilTatoueur() {
  const { userProfile, stats } = useContext(ProfilContext);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* En-tête du profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-red-400 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4">
          {userProfile?.avatar || "TA"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          {userProfile?.username || "TattooArtist"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          {userProfile?.specialty || "Tatoueur"}
        </p>
        <p className="flex items-center text-gray-500 dark:text-gray-400">
          <span className="mr-1">📍</span>{" "}
          {userProfile?.location || "Non spécifié"}
        </p>
      </div>

      {/* Statistiques */}
      <div className="flex justify-center gap-6 sm:gap-12 mb-8">
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">
            {stats?.realizations || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Réalisations
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">
            {stats?.flashes || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Flashs</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">
            {stats?.followers || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Abonnés
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-center gap-4 mb-8">
        <button className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
          Contacter
        </button>
        <button className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
          Suivre
        </button>
      </div>

      {/* Bio */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Bio</h2>
        <p className="text-gray-700 dark:text-gray-300">
          {userProfile?.bio || "Aucune biographie disponible."}
        </p>
      </div>

      {/* Styles */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Styles</h2>
        <div className="flex flex-wrap gap-2">
          {userProfile?.styles?.map((style, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-red-400 text-white text-sm rounded-full"
            >
              {style}
            </span>
          )) || (
            <span className="text-gray-600 dark:text-gray-400">
              Aucun style spécifié
            </span>
          )}
        </div>
      </div>

      {/* Portfolio */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Portfolio</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            ></div>
          ))}
        </div>
      </div>

      {/* Flashs disponibles */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Flashs disponibles</h2>
          <a
            href="#"
            className="text-red-500 hover:text-red-600 transition-colors text-sm"
          >
            Voir tout
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
