import React, { useState, useEffect, useContext } from "react";
import Post from "./components/Post";
import FlashCard from "./components/FlashCard";
import { FlashContext } from "../../context/FlashContext";

export default function Feed() {
  const [activeTab, setActiveTab] = useState("publication");
  const [followedContent, setFollowedContent] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);

  // Utilisation du contexte
  const { followedPosts, recommendedPosts, followedFlashes, recommendedFlashes } = useContext(FlashContext);

  useEffect(() => {
    // Mettre à jour le contenu en fonction de l'onglet actif
    if (activeTab === "publication") {
      setFollowedContent(followedPosts);
      setRecommendedContent(recommendedPosts);
    } else {
      setFollowedContent(followedFlashes);
      setRecommendedContent(recommendedFlashes);
    }
  }, [activeTab, followedPosts, recommendedPosts, followedFlashes, recommendedFlashes]);

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        {/* Navigation tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 text-center py-4 ${
              activeTab === "publication"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-300"
            }`}
            onClick={() => setActiveTab("publication")}
          >
            Publication
          </button>
          <button
            className={`flex-1 text-center py-4 ${
              activeTab === "flash"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-300"
            }`}
            onClick={() => setActiveTab("flash")}
          >
            Flash
          </button>
        </div>

        {/* Contenu des tatoueurs suivis */}
        <section>
          <h2 className="p-4 text-lg font-bold">
            {activeTab === "publication" ? "Publications récentes" : "Flashs récents"} des tatoueurs suivis
          </h2>
          
          {activeTab === "publication" ? (
            // Publications des tatoueurs suivis
            <div className="mt-2">
              {followedContent.map((post) => (
                <Post key={post.id} {...post} />
              ))}
            </div>
          ) : (
            // Flashs des tatoueurs suivis
            <div className="px-4 pb-4 flex overflow-x-auto gap-4">
              {followedContent.map((flash) => (
                <FlashCard key={flash.id} {...flash} />
              ))}
            </div>
          )}
        </section>

        {/* Contenu recommandé */}
        <section className="mt-8">
          <h2 className="p-4 text-lg font-bold">
            {activeTab === "publication" ? "Publications recommandées" : "Flashs recommandés"}
          </h2>
          
          {activeTab === "publication" ? (
            // Publications recommandées
            <div className="mt-2">
              {recommendedContent.map((post) => (
                <Post key={post.id} {...post} />
              ))}
            </div>
          ) : (
            // Flashs recommandés
            <div className="px-4 pb-4 flex overflow-x-auto gap-4">
              {recommendedContent.map((flash) => (
                <FlashCard key={flash.id} {...flash} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}