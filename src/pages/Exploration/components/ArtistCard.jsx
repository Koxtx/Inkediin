import { MapPin } from 'lucide-react'
import React from 'react'

export default function ArtistCard({ artist }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-102">
    <div className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div>
            <h3 className="font-bold dark:text-white">{artist.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Spécialité: {artist.specialty}</p>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <MapPin className="h-3 w-3" />
              <span>{artist.location}, {artist.distance}</span>
            </div>
          </div>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full transition-colors">
          Suivre
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {artist.portfolio.map((item, index) => (
          <div 
            key={index} 
            className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden"
          ></div>
        ))}
      </div>
    </div>
  </div>

  )
}
