import React from "react";
import { useState } from "react";
import Post from "./components/Post";
import RecommendationCard from "./components/RecommendationCard";

export default function Feed() {
  const [activeTab, setActiveTab] = useState("forYou");
  const recommendations = [
    { title: "Rose Old School", artist: "TattooArtist1", price: "90€" },
    { title: "Dragon Japonais", artist: "InkMaster", price: "150€" },
    { title: "Géométrique", artist: "ArtistInk", price: "120€" },
    { title: "Tribal", artist: "InkCreator", price: "80€" },
  ];
  const posts = [
    {
      username: "TattooArtist1",
      time: "Il y a 2 heures",
      likes: 124,
      caption:
        "Nouvelle création réalisée hier ! Style réaliste avec des touches de couleur. Qu'en pensez-vous ? #tattoo #realism #inkediin",
      comments: 18,
    },
    {
      username: "InkMaster",
      time: "Il y a 5 heures",
      likes: 89,
      caption:
        "Flash disponible ! Style japonais traditionnel. Prenez RDV en MP. Disponible dès la semaine prochaine. #flash #irezumi #japonais",
      comments: 7,
    },
  ];

  return (
    <div className="  min-h-screen pb-16">
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 text-center py-4 ${
              activeTab === "forYou"
                ? "text-red-500 border-b-2 border-red-500"
                : ""
            }`}
            onClick={() => setActiveTab("forYou")}
          >
            Pour vous
          </button>
          <button
            className={`flex-1 text-center py-4 ${
              activeTab === "following"
                ? "text-red-500 border-b-2 border-red-500"
                : ""
            }`}
            onClick={() => setActiveTab("following")}
          >
            Suivis
          </button>
        </div>
        <section>
          <h2 className="p-4 text-lg font-bold">Flashs recommandés</h2>
          <div className="px-4 pb-4 flex overflow-x-auto gap-4">
            {recommendations.map((item, index) => (
              <RecommendationCard key={index} {...item} />
            ))}
          </div>
        </section>
        <div className="mt-2">
          {posts.map((post, index) => (
            <Post key={index} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
