import React, { useContext, useState } from "react";
import { Search, Heart, MessageCircle, Eye, Trash2 } from "lucide-react";
import { FlashContext } from "../../context/FlashContext";
import { PublicationContext } from "../../context/PublicationContext";

export default function Wishlist() {
  const { savedFlashes, toggleSaveFlash } = useContext(FlashContext);
  const { savedPosts, toggleSavePost } = useContext(PublicationContext);
  const [activeTab, setActiveTab] = useState("flashes");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les éléments sauvegardés selon la recherche
  const filteredFlashes = savedFlashes.filter(flash => 
    flash.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flash.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flash.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = savedPosts.filter(post => 
    post.contenu.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFlash = (flash) => {
    if (window.confirm("Retirer ce flash de votre wishlist ?")) {
      toggleSaveFlash(flash);
    }
  };

  const handleRemovePost = (post) => {
    if (window.confirm("Retirer cette publication de vos sauvegardées ?")) {
      toggleSavePost(post);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Ma Wishlist</h1>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans vos sauvegardes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-white placeholder-gray-400"
          />
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab("flashes")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "flashes" 
                ? "bg-red-500 text-white" 
                : "text-gray-300 hover:text-white"
            }`}
          >
            Flashs ({savedFlashes.length})
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "posts" 
                ? "bg-red-500 text-white" 
                : "text-gray-300 hover:text-white"
            }`}
          >
            Publications ({savedPosts.length})
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "flashes" ? (
          <div>
            {filteredFlashes.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto text-gray-600 mb-4" />
                <div className="text-gray-400 text-lg mb-2">
                  {searchQuery ? "Aucun flash trouvé" : "Aucun flash sauvegardé"}
                </div>
                <p className="text-gray-500">
                  {searchQuery ? "Essayez avec d'autres termes de recherche" : "Commencez à explorer des flashs pour les ajouter à votre wishlist"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFlashes.map((flash) => (
                  <div key={flash.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                    <div className="aspect-square bg-gray-700 relative">
                      {/* Placeholder pour l'image du flash */}
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        Image du Flash
                      </div>
                      <button
                        onClick={() => handleRemoveFlash(flash)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{flash.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">par {flash.artist}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-red-400 font-bold">{flash.price}{flash.currency}</span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{flash.category}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                        <div className="flex items-center">
                          <MessageCircle size={14} className="mr-1" />
                          {flash.comments}
                        </div>
                        <div className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          {flash.views}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Sauvegardé le {flash.dateSaved.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto text-gray-600 mb-4" />
                <div className="text-gray-400 text-lg mb-2">
                  {searchQuery ? "Aucune publication trouvée" : "Aucune publication sauvegardée"}
                </div>
                <p className="text-gray-500">
                  {searchQuery ? "Essayez avec d'autres termes de recherche" : "Commencez à explorer le feed pour sauvegarder des publications"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-gray-800 rounded-lg p-6 relative">
                    <button
                      onClick={() => handleRemovePost(post)}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {post.username.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold">{post.username}</div>
                        <div className="text-sm text-gray-400">
                          Publié le {post.datePublication.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.contenu}</p>
                    
                    {post.image && (
                      <div className="mb-4">
                        <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                          Image de la publication
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Sauvegardé le {post.dateSaved.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}