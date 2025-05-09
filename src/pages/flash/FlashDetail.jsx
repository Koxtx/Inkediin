import React, { useState } from "react";
import { Heart, MessageCircle, Eye, Star, MapPin, Circle } from "lucide-react";
import { Link } from "react-router-dom";

export default function FlashDetail() {
  const [commentText, setCommentText] = useState("");

  const comments = [
    {
      id: 1,
      username: "ArtLover84",
      avatar: "",
      content:
        "J'adore les couleurs ! Est-ce que ce serait possible de l'adapter un peu pour l'épaule ?",
      time: "il y a 2 jours",
    },
    {
      id: 2,
      username: "TattooArtist",
      avatar: "TA",
      isArtist: true,
      content:
        "@ArtLover84 Bien sûr ! On peut l'adapter pour l'épaule sans problème. Contacte-moi en MP pour en discuter.",
      time: "il y a 1 jour",
    },
    {
      id: 3,
      username: "InkFan22",
      avatar: "",
      content:
        "Superbe design ! Les roses old school sont mes préférées. Quel est ton délai d'attente pour une réservation ?",
      time: "il y a 10 heures",
    },
  ];

  const handleSubmitComment = (e) => {
    e.preventDefault();
    // Logique pour ajouter un commentaire
    setCommentText("");
  };

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 dark:text-white pb-20">
      {/* Image du flash */}
      <div className="relative w-full h-80 sm:h-96 md:h-[450px]">
        <img
          src="/api/placeholder/400/400"
          alt="Flash de tatouage"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center shadow-md">
          <Star size={16} className="mr-1 fill-white" />
          <span className="text-sm font-medium">Flash exclusif</span>
        </div>
      </div>

      {/* Barre d'artiste */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-400 flex items-center justify-center text-white font-bold">
            TA
          </div>
          <div className="ml-3">
            <div className="font-bold">TattooArtist</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>Paris, France</span>
            </div>
          </div>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
          Suivre
        </button>
      </div>

      {/* Détails du flash */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl sm:text-2xl font-bold">Rose Old School</h2>
          <div className="text-lg sm:text-xl font-bold text-red-500">150 €</div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Une rose traditionnelle old school aux couleurs vives. Design original
          parfait pour l'avant-bras ou le mollet. Je peux adapter légèrement la
          taille selon vos besoins. Session de tatouage estimée à 2-3 heures.
        </p>

        {/* Grille d'informations */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Taille
            </div>
            <div className="font-medium">Moyen (10-15cm)</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Emplacement
            </div>
            <div className="font-medium">Avant-bras</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Couleurs
            </div>
            <div className="font-medium">Polychrome</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Durée estimée
            </div>
            <div className="font-medium">2-3 heures</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["Old School", "Rose", "Traditionnel", "Floral"].map(
            (tag, index) => (
              <div
                key={index}
                className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>

      {/* Section disponibilité */}
      <div className="bg-white dark:bg-gray-800 p-4 mb-4">
        <h3 className="font-bold mb-3">Disponibilité</h3>
        <div className="flex items-center mb-2">
          <Circle size={16} className="text-green-500 fill-green-500 mr-2" />
          <span className="font-medium">Disponible</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            (Pièce unique)
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Ce flash est un design exclusif qui ne sera tatoué qu'une seule fois.
          Une fois réservé, il ne sera plus disponible pour d'autres clients.
        </p>
      </div>

      {/* Barre d'engagement */}
      <div className="flex justify-around py-4 bg-white dark:bg-gray-800 mb-4">
        <div className="flex items-center">
          <Heart size={20} className="text-gray-500 mr-1" />
          <span className="font-medium">124</span>
        </div>
        <div className="flex items-center">
          <MessageCircle size={20} className="text-gray-500 mr-1" />
          <span className="font-medium">18</span>
        </div>
        <div className="flex items-center">
          <Eye size={20} className="text-gray-500 mr-1" />
          <span className="font-medium">753</span>
        </div>
      </div>

      {/* Section commentaires */}
      <div className="bg-white dark:bg-gray-800 p-4 mb-16">
        <h3 className="font-bold mb-4">Commentaires (18)</h3>

        {comments.map((comment) => (
          <div key={comment.id} className="flex mb-4">
            <div
              className={`w-10 h-10 rounded-full ${
                comment.isArtist ? "bg-red-400" : "bg-gray-300 dark:bg-gray-600"
              } flex items-center justify-center text-white shrink-0`}
            >
              {comment.avatar || comment.username.charAt(0)}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{comment.username}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.time}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm my-1">
                {comment.content}
              </p>
              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <button className="hover:text-gray-700 dark:hover:text-gray-200">
                  J'aime
                </button>
                <button className="hover:text-gray-700 dark:hover:text-gray-200">
                  Répondre
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Ajouter un commentaire */}
        <form onSubmit={handleSubmitComment} className="flex mt-6">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-r-lg font-medium transition-colors"
          >
            Publier
          </button>
        </form>
      </div>

      {/* Bouton de réservation fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
        <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors w-full max-w-md">
          Réserver ce flash
        </button>
      </div>
    </div>
  );
}
