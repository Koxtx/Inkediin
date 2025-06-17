import React from "react";
import { MapPin } from "lucide-react";

const ArtistCard = ({ artist, isNearbyMode, onContact, onViewProfile }) => {
  const formatPrice = (price) => `${price} €`;

  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col shadow-lg transition-transform duration-300 hover:transform hover:scale-105 cursor-pointer"
      onClick={() => onViewProfile(artist._id)}
    >
      <div className="bg-red-400 p-3 flex items-center gap-3">
        <img
          src={artist.avatar}
          alt={artist.name}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.src = "/api/placeholder/150/150";
          }}
        />
        <div className="flex-1">
          <div className="font-bold truncate text-white">{artist.name}</div>
          <div className="text-xs text-white flex items-center">
            <MapPin size={12} className="mr-1" />
            {artist.location}
          </div>
        </div>
        <div
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            artist.availability === "Disponible"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {artist.availability}
        </div>
      </div>

      <div className="h-48 bg-gray-200 relative">
        <img
          src={artist.portfolio}
          alt={`Portfolio de ${artist.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/api/placeholder/400/300";
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex justify-between items-center">
            <div className="text-white text-sm font-medium">
              {artist.category}
            </div>
            <div className="text-white text-sm font-bold">
              {formatPrice(artist.price)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${
                      i < Math.floor(artist.rating)
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-white text-xs ml-1">{artist.rating}</span>
            </div>
            {isNearbyMode && artist.distance !== undefined && (
              <div className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">
                {artist.distance.toFixed(1)} km
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-2">
        <button
          className="w-full py-2 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-md text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onContact(artist);
          }}
        >
          Prendre contact
        </button>
      </div> 
    </div>
  );
};

export default ArtistCard;
