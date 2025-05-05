import React from "react";

export default function ProfilTatoueur() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* En-tête du profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-red-400 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4">
          TA
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">TattooArtist</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Tatoueur Réaliste & Old School
        </p>
        <p className="flex items-center text-gray-500 dark:text-gray-400">
          <span className="mr-1">📍</span> Paris, France
        </p>
      </div>

      {/* Statistiques */}
      <div className="flex justify-center gap-6 sm:gap-12 mb-8">
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">128</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Réalisations
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">45</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Flashs</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold">1.2k</div>
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
          Tatoueur professionnel depuis 5 ans, spécialisé dans le réalisme et
          l'old school. Je travaille au studio Ink Vibes à Paris. Passionné par
          l'art du tatouage et toujours à la recherche de nouveaux défis
          créatifs.
        </p>
      </div>

      {/* Styles */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Styles</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-red-400 text-white text-sm rounded-full">
            Réaliste
          </span>
          <span className="px-3 py-1 bg-red-400 text-white text-sm rounded-full">
            Old School
          </span>
          <span className="px-3 py-1 bg-red-400 text-white text-sm rounded-full">
            Blackwork
          </span>
          <span className="px-3 py-1 bg-red-400 text-white text-sm rounded-full">
            Géométrique
          </span>
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
