import React from "react";
import { Search, Compass, Filter, Loader } from "lucide-react";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  isNearbyMode,
  isLocating,
  onLocationToggle,
  showFilters,
  setShowFilters,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Rechercher un tatoueur..."
          className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      </div>
      <div className="flex gap-3">
        <button
          className={`flex items-center justify-center px-4 py-2 rounded-lg gap-2 transition-colors ${
            isNearbyMode
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={onLocationToggle}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Localisation...</span>
            </>
          ) : (
            <>
              <Compass size={18} />
              <span>{isNearbyMode ? "Désactiver" : "Autour de moi"}</span>
            </>
          )}
        </button>
        <button
          className="lg:hidden flex items-center justify-center p-3 rounded-lg"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;