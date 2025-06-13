import React from "react";

export default function ClientPreferences({ preferences }) {
  return (
    <div className="mb-5 space-y-4">
      <h2 className="text-xl font-bold mb-4">Mes préférences de tatouage</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-400 text-white px-4 py-2 font-medium">
          Styles favoris
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {preferences.favoriteStyles.map((style, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-400 text-white px-4 py-2 font-medium">
          Emplacements préférés
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {preferences.preferredLocations.map((location, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-400 text-white px-4 py-2 font-medium">
          Critères importants
        </div>
        <div className="p-4">
          <ul className="divide-y dark:divide-gray-700">
            {Object.entries(preferences.criteria).map(
              ([criterion, rating], index) => (
                <li
                  key={index}
                  className="py-2 flex justify-between items-center"
                >
                  <span>{criterion}</span>
                  <span className="text-yellow-500">
                    {"⭐".repeat(rating)}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}