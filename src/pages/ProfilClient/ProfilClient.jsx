import React, { useState } from "react";

export default function ProfilClient() {
  const [activeTab, setActiveTab] = useState("preferences");

  const tabContents = {
    preferences: (
      <>
        <div className="mb-5">
          <h2 className="text-xl font-bold mb-4">
            Mes préférences de tatouage
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="bg-red-400 text-white px-4 py-2 font-medium">
              Styles favoris
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                  Old School
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                  Géométrique
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                  Minimaliste
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                  Japonais
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="bg-red-400 text-white px-4 py-2 font-medium">
              Emplacements préférés
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                  Avant-bras
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                  Épaule
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                  Dos
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-400 text-white px-4 py-2 font-medium">
              Critères importants
            </div>
            <div className="p-4">
              <ul className="divide-y dark:divide-gray-700">
                <li className="py-2 flex justify-between items-center">
                  <span>Hygiène du studio</span>
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                </li>
                <li className="py-2 flex justify-between items-center">
                  <span>Réputation de l'artiste</span>
                  <span className="text-yellow-500">⭐⭐⭐⭐</span>
                </li>
                <li className="py-2 flex justify-between items-center">
                  <span>Prix</span>
                  <span className="text-yellow-500">⭐⭐⭐</span>
                </li>
                <li className="py-2 flex justify-between items-center">
                  <span>Proximité</span>
                  <span className="text-yellow-500">⭐⭐</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
    wishlist: (
      <>
        <div className="mb-5">
          <h2 className="text-xl font-bold mb-4">Ma wishlist (6)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 sm:h-48 bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative"
              >
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3">
                  <div className="font-medium">{`TattooArtist${
                    (index % 4) + 1
                  }`}</div>
                  <div className="text-sm text-gray-300">
                    {index % 4 === 0
                      ? "Old School"
                      : index % 4 === 1
                      ? "Géométrique"
                      : index % 4 === 2
                      ? "Japonais"
                      : "Minimaliste"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    followed: (
      <>
        <div className="mb-5">
          <h2 className="text-xl font-bold mb-4">Tatoueurs suivis (4)</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="divide-y dark:divide-gray-700">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0"></div>
                  <div className="ml-4 flex-grow">
                    <div className="font-medium">{`TattooArtist${
                      index + 1
                    }`}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Spécialité:{" "}
                      {index === 0
                        ? "Old School"
                        : index === 1
                        ? "Géométrique"
                        : index === 2
                        ? "Japonais"
                        : "Minimaliste"}
                    </div>
                  </div>
                  <button className="px-4 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors">
                    Suivi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    ),
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Section profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-400 flex items-center justify-center text-white text-2xl font-bold mb-3">
          C
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1">ClientUser123</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-4">
          Passionné(e) d'art corporel. À la recherche d'inspiration pour mon
          premier tatouage.
        </p>
        <button className="px-4 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors">
          Modifier le profil
        </button>
      </div>

      {/* Onglets */}
      <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto pb-1">
        <button
          className={`px-4 py-2 mr-2 whitespace-nowrap transition-colors ${
            activeTab === "preferences"
              ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
              : "text-gray-600 dark:text-gray-300 hover:text-red-500"
          }`}
          onClick={() => setActiveTab("preferences")}
        >
          Préférences
        </button>
        <button
          className={`px-4 py-2 mr-2 whitespace-nowrap transition-colors ${
            activeTab === "wishlist"
              ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
              : "text-gray-600 dark:text-gray-300 hover:text-red-500"
          }`}
          onClick={() => setActiveTab("wishlist")}
        >
          Wishlist
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap transition-colors ${
            activeTab === "followed"
              ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
              : "text-gray-600 dark:text-gray-300 hover:text-red-500"
          }`}
          onClick={() => setActiveTab("followed")}
        >
          Tatoueurs suivis
        </button>
      </div>

      {/* Contenu des onglets */}
      {tabContents[activeTab]}
    </div>
  );
}
