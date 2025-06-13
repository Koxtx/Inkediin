import React from "react";
import { Edit, Plus } from "lucide-react";

export default function ProfileSpecialties({ 
  displayUser, 
  isOwnProfile, 
  onEditClick, 
  onAddClick 
}) {
  if (!displayUser?.styles) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 justify-center">
        <h2 className="text-lg font-semibold">Spécialités</h2>
      
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {displayUser.styles.split(',').map((style, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-red-400 text-white text-sm rounded-full"
          >
            {style.trim()}
          </span>
        ))}
        
      </div>
    </div>
  );
}