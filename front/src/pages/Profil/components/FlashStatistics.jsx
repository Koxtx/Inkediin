import React from "react";
import { TrendingUp, Eye, Heart, ShoppingCart } from "lucide-react";

export default function FlashStatistics({ 
  isOwnProfile, 
  displayUser,
  flashStats = null 
}) {
  // Ne s'affiche que pour le propriétaire du profil tatoueur
  if (!isOwnProfile || displayUser?.userType !== 'tatoueur') {
    return null;
  }

  // Données factices pour les statistiques
  const defaultStats = {
    totalFlashs: 24,
    availableFlashs: 18,
    reservedFlashs: 6,
    totalViews: 2847,
    totalLikes: 456,
    monthlyRevenue: 1850,
    popularStyles: [
      { style: "Old School", count: 8 },
      { style: "Géométrique", count: 6 },
      { style: "Japonais", count: 4 },
      { style: "Minimaliste", count: 6 }
    ]
  };

  const stats = flashStats || defaultStats;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Statistiques de mes flashs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total des flashs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total flashs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalFlashs}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+3</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">ce mois</span>
          </div>
        </div>

        {/* Vues totales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vues totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">vs mois dernier</span>
          </div>
        </div>

        {/* Likes totaux */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Likes totaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalLikes}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">ce mois</span>
          </div>
        </div>

        {/* Revenus mensuels */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus ce mois</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.monthlyRevenue}€</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+15%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">vs mois dernier</span>
          </div>
        </div>
      </div>

      {/* Répartition par disponibilité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Statut des flashs</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">Disponibles</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 dark:text-gray-100">{stats.availableFlashs}</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({Math.round((stats.availableFlashs / stats.totalFlashs) * 100)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">Réservés</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 dark:text-gray-100">{stats.reservedFlashs}</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({Math.round((stats.reservedFlashs / stats.totalFlashs) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Styles populaires */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Styles populaires</h3>
          <div className="space-y-3">
            {stats.popularStyles.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{item.style}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.count / Math.max(...stats.popularStyles.map(s => s.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100 min-w-[20px]">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}