import React from "react";
import { useState, useEffect } from "react";
import Post from "./components/Post";
import RecommendationCard from "./components/RecommendationCard";
import FlashCard from "./components/FlashCard";

export default function Feed() {
  const [activeTab, setActiveTab] = useState("publication");
  const [followedContent, setFollowedContent] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);

  // Publications des tatoueurs suivis
  const followedPosts = [
    {
      id: 1,
      username: "TattooArtist1",
      time: "Il y a 2 heures",
      likes: 124,
      caption:
        "Nouvelle création réalisée hier ! Style réaliste avec des touches de couleur. Qu'en pensez-vous ? #tattoo #realism #inkediin",
      comments: 18,
    },
    {
      id: 2,
      username: "InkMaster",
      time: "Il y a 5 heures",
      likes: 89,
      caption:
        "Nouveau design terminé pour un client. Style japonais traditionnel. #irezumi #japonais",
      comments: 7,
    },
  ];

  // Publications recommandées
  const recommendedPosts = [
    {
      id: 3,
      username: "TattooQueen",
      time: "Il y a 1 jour",
      likes: 432,
      caption:
        "Pièce terminée après 3 séances. Un mandala avec des éléments floraux. #mandala #flowertattoo",
      comments: 42,
    },
    {
      id: 4,
      username: "InkDreamer",
      time: "Il y a 8 heures",
      likes: 215,
      caption:
        "Un petit aperçu de mon travail cette semaine. Style minimaliste. #minimalist #finelinetattoo",
      comments: 23,
    },
  ];

  // Flashs des tatoueurs suivis
  const followedFlashes = [
    { id: 1, title: "Rose Old School", artist: "TattooArtist1", price: "90€" },
    { id: 2, title: "Dragon Japonais", artist: "InkMaster", price: "150€" },
  ];

  // Flashs recommandés
  const recommendedFlashes = [
    { id: 3, title: "Géométrique", artist: "ArtistInk", price: "120€" },
    { id: 4, title: "Tribal", artist: "InkCreator", price: "80€" },
    { id: 5, title: "Minimaliste", artist: "TattooQueen", price: "70€" },
    { id: 6, title: "Blackwork", artist: "InkDreamer", price: "110€" },
  ];

  useEffect(() => {
    // Mettre à jour le contenu en fonction de l'onglet actif
    if (activeTab === "publication") {
      setFollowedContent(followedPosts);
      setRecommendedContent(recommendedPosts);
    } else {
      setFollowedContent(followedFlashes);
      setRecommendedContent(recommendedFlashes);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen pb-16  e">
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