import React, { useState, useEffect, useContext } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Post from "./components/Post";
import FlashCard from "./components/FlashCard";
import { FlashContext } from "../../context/FlashContext";
import { PublicationContext } from "../../context/PublicationContext";

export default function Feed() {
  const [activeTab, setActiveTab] = useState("publication");
  const [followedContent, setFollowedContent] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);


  const navigate = useNavigate();
  const location = useLocation();

  // Utilisation des contextes
  const {
    followedFlashes,
    recommendedFlashes,
    toggleLikeFlash,
    toggleSaveFlash
  } = useContext(FlashContext);

  const {
    followedPosts,
    recommendedPosts,
    toggleLikePost,
    toggleSavePost
  } = useContext(PublicationContext);

  // Afficher un message de succès si on vient de créer du contenu
  useEffect(() => {
    if (location.state?.message) {
      const notification = document.createElement("div");
      notification.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      notification.textContent = location.state.message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Mettre à jour le contenu en fonction de l'onglet actif
    if (activeTab === "publication") {
      setFollowedContent(followedPosts);
      setRecommendedContent(recommendedPosts);
    } else {
      setFollowedContent(followedFlashes);
      setRecommendedContent(recommendedFlashes);
    }
  }, [
    activeTab,
    followedPosts,
    recommendedPosts,
    followedFlashes,
    recommendedFlashes
  ]);

  const handleCreateContent = () => {
    if (activeTab === "publication") {
      navigate("/uploadpublication");
    } else {
      navigate("/flashupload");
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-black text-white">
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        {/* Header avec bouton de création */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm z-10 border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">Feed</h1>
            <button
              onClick={handleCreateContent}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              title={activeTab === "publication" ? "Créer une publication" : "Créer un flash"}
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${
                activeTab === "publication"
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab("publication")}
            >
              Publications ({followedPosts.length + recommendedPosts.length})
            </button>
            <button
              className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${
                activeTab === "flash"
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab("flash")}
            >
              Flashs ({followedFlashes.length + recommendedFlashes.length})
            </button>
          </div>
        </div>

        {/* Contenu des tatoueurs suivis */}
        {followedContent.length > 0 && (
          <section>
            <h2 className="p-4 text-lg font-bold">
              {activeTab === "publication"
                ? "Publications récentes"
                : "Flashs récents"}{" "}
              des tatoueurs suivis
            </h2>

            {activeTab === "publication" ? (
              <div className="mt-2">
                {followedContent.map((post) => (
                  <Post 
                    key={post.id} 
                    {...post}
                    caption={post.contenu} // Adapter pour votre composant Post
                    onLike={() => toggleLikePost(post.id)}
                    onSave={() => toggleSavePost(post)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {followedContent.map((flash) => (
                  <FlashCard 
                    key={flash.id} 
                    {...flash}
                    onLike={() => toggleLikeFlash(flash.id)}
                    onSave={() => toggleSaveFlash(flash)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Contenu recommandé */}
        {recommendedContent.length > 0 && (
          <section className="mt-8">
            <h2 className="p-4 text-lg font-bold">
              {activeTab === "publication"
                ? "Publications recommandées"
                : "Flashs recommandés"}
            </h2>

            {activeTab === "publication" ? (
              <div className="mt-2">
                {recommendedContent.map((post) => (
                  <Post 
                    key={post.id} 
                    {...post}
                    caption={post.contenu} // Adapter pour votre composant Post
                    onLike={() => toggleLikePost(post.id)}
                    onSave={() => toggleSavePost(post)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {recommendedContent.map((flash) => (
                  <FlashCard 
                    key={flash.id} 
                    {...flash}
                    onLike={() => toggleLikeFlash(flash.id)}
                    onSave={() => toggleSaveFlash(flash)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* État vide */}
        {followedContent.length === 0 && recommendedContent.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {`Aucun${activeTab === "publication" ? "e publication" : " flash"} disponible`}
            </div>
            <button
              onClick={handleCreateContent}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {activeTab === "publication" 
                ? "Créer votre première publication"
                : "Créer votre premier flash"
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}