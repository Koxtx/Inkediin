import React from "react";

export default function ClientWishlist({ wishlist, isOwnProfile, onItemClick }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold mb-4">
        {isOwnProfile ? "Ma wishlist" : "Wishlist"} ({wishlist.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="h-40 sm:h-48 bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative cursor-pointer"
          >
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3">
              <div className="font-medium">{item.artistName}</div>
              <div className="text-sm text-gray-300">{item.style}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}