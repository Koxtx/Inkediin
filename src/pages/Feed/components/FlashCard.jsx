import React, { useState } from 'react';
import { Heart, Calendar, Info } from 'lucide-react';

export default function FlashCard({ title, artist, price }) {
  const [liked, setLiked] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
  };
  
  return (
    <div className="min-w-[150px] md:min-w-[180px] rounded-lg overflow-hidden relative">
      <div className="w-full h-36 bg-gray-700"></div>
      
      <button 
        className="absolute top-2 right-2 bg-gray-900 bg-opacity-60 p-1 rounded-full"
        onClick={handleLike}
      >
        <Heart size={18} fill={liked ? "#ef4444" : "none"} color={liked ? "#ef4444" : "white"} />
      </button>
      
      <div className="p-3">
        <div className="text-sm font-bold mb-1 text-white">{title}</div>
        <div className="text-xs text-red-500">{artist}</div>
        <div className="text-xs text-gray-400 mt-1">{price}</div>
        
        <div className="flex mt-3 justify-between">
          <button className="text-xs bg-red-500 py-1 px-2 rounded text-white">
            Réserver
          </button>
          <button className="text-xs text-gray-300 flex items-center">
            <Info size={12} className="mr-1" />
            Détails
          </button>
        </div>
      </div>
    </div>
  );
}