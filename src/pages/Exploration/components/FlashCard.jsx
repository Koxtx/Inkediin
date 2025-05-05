import { Heart } from 'lucide-react';
import React, { useState } from 'react'

export default function FlashCard({ flash }) {
    const [isLiked, setIsLiked] = useState(false);
  
    return (
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-105">
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">{flash.artist}</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">{flash.price}€</span>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="text-white hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}
