import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Heart, Filter, Search, Grid, List } from "lucide-react";

export default function FlashManagement({ 
  flashs = [], 
  onAddFlash, 
  onEditFlash, 
  onDeleteFlash, 
  onToggleAvailability 
}) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "list"
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "available", "reserved"
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent", "popular", "price"

  // Données factices pour la démonstration
  const defaultFlashs = [
    { 
      id: 1, 
      title: "Rose traditionnelle", 
      style: "Old School", 
      price: 150, 
      available: true,
      likes: 24,
      views: 156,
      createdAt: "2024-01-15",
      description: "Rose classique style old school avec épines détaillées"
    },
    { 
      id: 2, 
      title: "Crâne géométrique", 
      style: "Géométrique", 
      price: 200, 
      available: true,
      likes: 31,
      views: 203,
      createdAt: "2024-01-10",
      description: "Design géométrique moderne avec crâne stylisé"
    },
    { 
      id: 3, 
      title: "Dragon japonais", 
      style: "Japonais", 
      price: 300, 
      available: false,
      likes: 45,
      views: 289,
      createdAt: "2024-01-05",
      description: "Dragon traditionnel japonais avec nuages et vagues"
    },
    { 
      id: 4, 
      title: "Mandala floral", 
      style: "Géométrique", 
      price: 180, 
      available: true,
      likes: 18,
      views: 134,
      createdAt: "2024-01-20",
      description: "Mandala complexe avec motifs floraux intégrés"
    },
    { 
      id: 5, 
      title: "Loup réaliste", 
      style: "Réalisme", 
      price: 250, 
      available: true,
      likes: 38,
      views: 178,
      createdAt: "2024-01-12",
      description: "Portrait réaliste de loup avec détails de fourrure"
    }
  ];

  const flashsData = flashs.length > 0 ? flashs : defaultFlashs;

  // Filtrage et tri
  const filteredFlashs = flashsData
    .filter(flash => {
      const matchesSearch = flash.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flash.style.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "available" && flash.available) ||
                           (filterStatus === "reserved" && !flash.available);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.likes - a.likes;
        case "price":
          return a.price - b.price;
        case "recent":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFlashs.map((flash) => (
        <div key={flash.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {/* Image placeholder */}
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 relative group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-300 text-sm text-center p-4">
                {flash.title}
              </span>
            </div>
            
            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={() => onEditFlash(flash.id)}
                className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDeleteFlash(flash.id)}
                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Badge de statut */}
            <div className="absolute top-2 left-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                flash.available 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {flash.available ? 'Disponible' : 'Réservé'}
              </span>
            </div>
          </div>

          {/* Informations du flash */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{flash.title}</h3>
              <span className="text-lg font-bold text-red-500">{flash.price}€</span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{flash.style}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">{flash.description}</p>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {flash.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} />
                  {flash.likes}
                </span>
              </div>
              <button
                onClick={() => onToggleAvailability(flash.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  flash.available
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                }`}
              >
                {flash.available ? 'Marquer réservé' : 'Marquer disponible'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Flash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Style
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredFlashs.map((flash) => (
              <tr key={flash.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex-shrink-0 mr-4 flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">IMG</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{flash.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-48">{flash.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                    {flash.style}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-red-500">{flash.price}€</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    flash.available 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {flash.available ? 'Disponible' : 'Réservé'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {flash.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {flash.likes}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEditFlash(flash.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteFlash(flash.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => onToggleAvailability(flash.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        flash.available
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                      }`}
                    >
                      {flash.available ? 'Réserver' : 'Libérer'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Flashs</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos designs disponibles et leurs statuts</p>
        </div>
        <button
          onClick={onAddFlash}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus size={20} />
          Nouveau Flash
        </button>
      </div>

      {/* Barre de contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un flash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Filtre par statut */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="all">Tous les statuts</option>
                <option value="available">Disponibles</option>
                <option value="reserved">Réservés</option>
              </select>
            </div>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="recent">Plus récents</option>
              <option value="popular">Plus populaires</option>
              <option value="price">Prix croissant</option>
            </select>

            {/* Mode d'affichage */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total: </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{flashsData.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Disponibles: </span>
            <span className="font-medium text-green-600">{flashsData.filter(f => f.available).length}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Réservés: </span>
            <span className="font-medium text-red-600">{flashsData.filter(f => !f.available).length}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Résultats: </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{filteredFlashs.length}</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {filteredFlashs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "Aucun flash ne correspond à vos critères de recherche." 
              : "Vous n'avez pas encore de flashs."
            }
          </div>
          {(!searchTerm && filterStatus === "all") && (
            <button
              onClick={onAddFlash}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Créer votre premier flash
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? <GridView /> : <ListView />}
        </>
      )}
    </div>
  );
}