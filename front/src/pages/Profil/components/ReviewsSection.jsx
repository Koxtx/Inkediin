import React, { useState } from "react";
import { Star, ThumbsUp, MessageCircle, Filter, ChevronDown } from "lucide-react";

export default function ReviewsSection({ 
  displayUser, 
  isOwnProfile, 
  userType, // "client" ou "tatoueur"
  onReplyToReview,
  onLikeReview 
}) {
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  // Données factices pour les avis
  const reviewsData = userType === "tatoueur" ? [
    {
      id: 1,
      clientName: "Marie_L",
      clientAvatar: null,
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent travail ! Très professionnel et à l'écoute. Le tatouage a parfaitement cicatrisé et le rendu est magnifique. Je recommande vivement Alexandre pour son talent et sa minutie.",
      tattooStyle: "Réalisme",
      verified: true,
      likes: 12,
      hasPhotos: true,
      artistReply: null
    },
    {
      id: 2,
      clientName: "Thomas_K",
      clientAvatar: null,
      rating: 5,
      date: "2024-01-10",
      comment: "Incroyable ! Le portrait de ma fille est d'un réalisme saisissant. Alexandre a su capturer tous les détails avec une précision remarquable. Studio très propre et ambiance détendue.",
      tattooStyle: "Portrait",
      verified: true,
      likes: 8,
      hasPhotos: true,
      artistReply: {
        date: "2024-01-11",
        comment: "Merci Thomas ! C'était un plaisir de travailler sur ce projet si personnel. Prenez soin de votre tatouage ! 🙏"
      }
    },
    {
      id: 3,
      clientName: "Sophie_R",
      clientAvatar: null,
      rating: 4,
      date: "2024-01-05",
      comment: "Très bon tatoueur, travail de qualité. Juste un peu d'attente mais ça valait le coup. Le résultat est top et les conseils post-tatouage très utiles.",
      tattooStyle: "Black & Grey",
      verified: true,
      likes: 5,
      hasPhotos: false,
      artistReply: null
    },
    {
      id: 4,
      clientName: "Lucas_M",
      clientAvatar: null,
      rating: 5,
      date: "2023-12-28",
      comment: "Mon premier tatouage et je ne pouvais pas rêver mieux ! Alexandre m'a mis en confiance, a pris le temps d'expliquer chaque étape. Le lion sur mon bras est juste parfait !",
      tattooStyle: "Réalisme",
      verified: true,
      likes: 15,
      hasPhotos: true,
      artistReply: {
        date: "2023-12-29",
        comment: "Merci Lucas ! Heureux que ton premier tatouage soit une si belle expérience. À bientôt pour la suite du projet ! 🦁"
      }
    }
  ] : [
    // Avis laissés par le client
    {
      id: 1,
      artistName: "Sarah_Ink",
      artistAvatar: null,
      rating: 5,
      date: "2024-01-20",
      comment: "Tatouage parfait ! Sarah a su comprendre exactement ce que je voulais. Son trait est d'une finesse remarquable et le résultat dépasse mes attentes.",
      tattooStyle: "Minimaliste",
      verified: true,
      likes: 6,
      hasPhotos: true,
      artistReply: {
        date: "2024-01-21",
        comment: "Merci beaucoup ! C'était un plaisir de réaliser votre projet. Prenez bien soin de votre tatouage ! ✨"
      }
    },
    {
      id: 2,
      artistName: "Marco_Tattoo",
      artistAvatar: null,
      rating: 4,
      date: "2024-01-08",
      comment: "Très bon travail sur mon tatouage old school. Marco maîtrise parfaitement son art. Studio propre et ambiance sympa. Je reviendrai !",
      tattooStyle: "Old School",
      verified: true,
      likes: 3,
      hasPhotos: false,
      artistReply: null
    }
  ];

  // Filtrage et tri des avis
  const filteredReviews = reviewsData
    .filter(review => {
      if (filterRating === "all") return true;
      return review.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "oldest":
          return new Date(a.date) - new Date(b.date);
        case "recent":
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  const averageRating = reviewsData.length > 0 
    ? (reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviewsData.filter(review => review.rating === rating).length,
    percentage: reviewsData.length > 0 
      ? (reviewsData.filter(review => review.rating === rating).length / reviewsData.length) * 100 
      : 0
  }));

  const getInitials = (name) => {
    return name.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Il y a 1 jour";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
  };

  if (reviewsData.length === 0) {
    return (
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-4">
          {userType === "tatoueur" ? "Avis clients" : "Mes avis"}
        </h2>
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {userType === "tatoueur" 
              ? "Aucun avis client pour le moment." 
              : "Vous n'avez pas encore laissé d'avis."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2">
            {userType === "tatoueur" ? "Avis clients" : "Mes avis"} ({reviewsData.length})
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="ml-1 text-lg font-bold">{averageRating}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              • {reviewsData.length} avis
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter size={16} />
          Filtres
          <ChevronDown 
            size={16} 
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {/* Statistiques des ratings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-4">Répartition des notes</h3>
        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center min-w-[60px]">
                <span className="text-sm">{rating}</span>
                <Star size={14} className="text-yellow-500 fill-current ml-1" />
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[30px]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrer par note
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                <option value="all">Toutes les notes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles</option>
                <option value="3">3 étoiles</option>
                <option value="2">2 étoiles</option>
                <option value="1">1 étoile</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                <option value="recent">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="rating">Note décroissante</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                {getInitials(userType === "tatoueur" ? review.clientName : review.artistName)}
              </div>
              
              <div className="flex-1">
                {/* Header du review */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {userType === "tatoueur" ? review.clientName : review.artistName}
                      </span>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                          Vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {review.tattooStyle}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getTimeAgo(review.date)}
                  </div>
                </div>

                {/* Commentaire */}
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {review.comment}
                </p>

                {/* Photos si disponibles */}
                {review.hasPhotos && (
                  <div className="flex gap-2 mb-4">
                    {[1, 2].map((photo) => (
                      <div
                        key={photo}
                        className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500"
                      >
                        Photo {photo}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => onLikeReview(review.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    <ThumbsUp size={14} />
                    <span>{review.likes}</span>
                  </button>
                  
                  {isOwnProfile && userType === "tatoueur" && !review.artistReply && (
                    <button
                      onClick={() => onReplyToReview(review.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-sm"
                    >
                      <MessageCircle size={14} />
                      Répondre
                    </button>
                  )}
                </div>

                {/* Réponse de l'artiste */}
                {review.artistReply && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {userType === "tatoueur" ? "Votre réponse" : review.artistName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(review.artistReply.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {review.artistReply.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination si nécessaire */}
      {filteredReviews.length > 5 && (
        <div className="flex justify-center mt-6">
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Voir plus d'avis
          </button>
        </div>
      )}
    </div>
  );
}