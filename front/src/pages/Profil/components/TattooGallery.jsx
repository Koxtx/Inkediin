import React from "react";
import { Plus, Edit, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TattooGallery({
  displayUser,
  isOwnProfile,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onLikeItem,
}) {
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/uploadpublication");
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Feed ({displayUser?.gallery?.length || 0})
        </h2>
        {isOwnProfile && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm"
          >
            <Plus size={16} /> Ajouter
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayUser?.gallery?.map((item) => (
          <div
            key={item.id}
            className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-gray-300">{item.style}</div>
              </div>
              {!isOwnProfile && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => onLikeItem && onLikeItem(item.id)}
                    className="p-1 bg-white/20 rounded-full backdrop-blur-sm"
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEditItem && onEditItem(item.id)}
                    className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteItem && onDeleteItem(item.id)}
                    className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )) ||
          Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md"
            ></div>
          ))}
      </div>
    </div>
  );
}