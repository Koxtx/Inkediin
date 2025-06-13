import React from "react";

export default function FollowedArtists({ followedArtists, onUnfollowArtist, onArtistClick }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold mb-4">
        Tatoueurs suivis ({followedArtists.length})
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="divide-y dark:divide-gray-700">
          {followedArtists.map((artist) => (
            <div key={artist.id} className="p-4 flex items-center">
              <div 
                onClick={() => onArtistClick(artist)}
                className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-red-500 transition-colors"
              >
                {artist.name.charAt(0)}
              </div>
              <div className="ml-4 flex-grow">
                <div 
                  onClick={() => onArtistClick(artist)}
                  className="font-medium cursor-pointer hover:text-red-500 transition-colors"
                >
                  {artist.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Spécialité: {artist.specialty}
                </div>
              </div>
              <button 
                onClick={() => onUnfollowArtist(artist.id)}
                className="px-4 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
              >
                Suivi
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}