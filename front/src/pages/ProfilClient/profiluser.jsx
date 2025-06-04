import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function ProfilUtilisateur() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("gallery");
  const [isFollowing, setIsFollowing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation de données utilisateur
  useEffect(() => {
    // Simuler un appel API pour récupérer les données de l'utilisateur
    setTimeout(() => {
      setUserProfile({
        id: userId,
        username: "Alexandre_Ink",
        avatar: "A",
        bio: "Tatoueur professionnel spécialisé dans le réalisme et les portraits. 10 ans d'expérience.",
        location: "Paris, France",
        specialty: "Réalisme, Portraits",
        isArtist: true,
        stats: {
          followers: 1234,
          following: 89,
          tattoos: 156
        },
        gallery: [
          { id: 1, imageUrl: "", style: "Réalisme", title: "Portrait réaliste" },
          { id: 2, imageUrl: "", style: "Black & Grey", title: "Lion majestueux" },
          { id: 3, imageUrl: "", style: "Réalisme", title: "Rose détaillée" },
          { id: 4, imageUrl: "", style: "Portrait", title: "Visage femme" },
          { id: 5, imageUrl: "", style: "Animal", title: "Loup sauvage" },
          { id: 6, imageUrl: "", style: "Réalisme", title: "Œil humain" }
        ],
        about: {
          experience: "10 ans",
          specialties: ["Réalisme", "Portraits", "Black & Grey"],
          studio: "Ink Masters Studio",
          certifications: ["Hygiène et sécurité", "Formation continue 2024"]
        }
      });
      setLoading(false);
    }, 1000);
  }, [userId]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const tabContents = {
    gallery: (
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-4">
          Galerie ({userProfile?.gallery?.length || 0})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProfile?.gallery?.map((item) => (
            <div
              key={item.id}
              className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-gray-300">{item.style}</div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    about: (
      <div className="mb-5 space-y-4">
        <h2 className="text-xl font-bold mb-4">À propos</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-400 text-white px-4 py-2 font-medium">
            Informations professionnelles
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Expérience</span>
              <span className="font-medium">{userProfile?.about?.experience}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Studio</span>
              <span className="font-medium">{userProfile?.about?.studio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Localisation</span>
              <span className="font-medium">{userProfile?.location}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-400 text-white px-4 py-2 font-medium">
            Spécialités
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {userProfile?.about?.specialties?.map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-400 text-white px-4 py-2 font-medium">
            Certifications
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {userProfile?.about?.certifications?.map((cert, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),

    reviews: (
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-4">Avis clients</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((review) => (
            <div key={review} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Client_{review}</span>
                    <div className="text-yellow-500">{"⭐".repeat(5)}</div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Excellent travail ! Très professionnel et à l'écoute. Je recommande vivement.
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Il y a {review} semaine{review > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Section profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-400 flex items-center justify-center text-white text-2xl font-bold mb-3">
          {userProfile?.avatar}
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold mb-1">
          {userProfile?.username}
        </h1>
        
        {userProfile?.isArtist && (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm mb-2">
            Tatoueur vérifié
          </span>
        )}
        
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-4">
          {userProfile?.bio}
        </p>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📍 {userProfile?.location}
        </div>

        {/* Statistiques */}
        <div className="flex space-x-6 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg">{userProfile?.stats?.tattoos}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tatouages</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{userProfile?.stats?.followers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Abonnés</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{userProfile?.stats?.following}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Abonnements</div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-3">
          <button
            onClick={handleFollow}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              isFollowing
                ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {isFollowing ? "Suivi" : "Suivre"}
          </button>
          
          <button className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </button>
          
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto pb-1">
        <button
          className={`px-4 py-2 mr-2 whitespace-nowrap transition-colors ${
            activeTab === "gallery"
              ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
              : "text-gray-600 dark:text-gray-300 hover:text-red-500"
          }`}
          onClick={() => setActiveTab("gallery")}
        >
          Galerie
        </button>
        
        {userProfile?.isArtist && (
          <button
            className={`px-4 py-2 mr-2 whitespace-nowrap transition-colors ${
              activeTab === "about"
                ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-red-500"
            }`}
            onClick={() => setActiveTab("about")}
          >
            À propos
          </button>
        )}
        
        {userProfile?.isArtist && (
          <button
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === "reviews"
                ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-red-500"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Avis
          </button>
        )}
      </div>

      {/* Contenu des onglets */}
      {tabContents[activeTab]}
    </div>
  );
}