import React, { useState, useEffect } from "react";
import {
  Heart,
  Star,
  Eye,
  MessageCircle,
  Zap,
  MoreVertical,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FlashCard({
  id,
  username = "FlashArtist",
  userAvatar,
  time = "2h",
  title,
  artist,
  price,
  image,
  rating = 4.5,
  views = 142,
  comments = 8,
  likes = 24,
  isLiked = false,
  isSaved = false,
  onLike,
  onSave,
  // ✅ Props pour données brutes (objets)
  rawLikes,
  rawComments,
  rawViews,
  currentUserId
}) {
  // ✅ FONCTION HELPER: Nettoyer les données automatiquement
  const cleanData = () => {
    // ✅ Gérer les likes - TOUJOURS convertir en nombre
    let cleanedLikes = 0;
    let cleanedIsLiked = false;
    
    if (rawLikes !== undefined) {
      if (Array.isArray(rawLikes)) {
        cleanedLikes = rawLikes.length;
        if (currentUserId) {
          cleanedIsLiked = rawLikes.some(like => {
            const likeUserId = like.userId?._id || like.userId?.id || like.userId;
            return likeUserId?.toString() === currentUserId?.toString();
          });
        }
      } else if (typeof rawLikes === 'number') {
        cleanedLikes = rawLikes;
      }
    } else if (likes !== undefined) {
      if (Array.isArray(likes)) {
        cleanedLikes = likes.length;
      } else if (typeof likes === 'number') {
        cleanedLikes = likes;
      }
      cleanedIsLiked = isLiked;
    }
    
    // ✅ Gérer les commentaires - TOUJOURS convertir en nombre
    let cleanedComments = 0;
    if (rawComments !== undefined) {
      if (Array.isArray(rawComments)) {
        cleanedComments = rawComments.length;
      } else if (typeof rawComments === 'number') {
        cleanedComments = rawComments;
      }
    } else if (comments !== undefined) {
      if (Array.isArray(comments)) {
        cleanedComments = comments.length;
      } else if (typeof comments === 'number') {
        cleanedComments = comments;
      }
    }
    
    // ✅ Gérer les vues - TOUJOURS convertir en nombre
    let cleanedViews = 0;
    if (rawViews !== undefined) {
      cleanedViews = typeof rawViews === 'number' ? rawViews : 0;
    } else if (views !== undefined) {
      cleanedViews = typeof views === 'number' ? views : 0;
    }
    
    return {
      likes: cleanedLikes,
      comments: cleanedComments,
      views: cleanedViews,
      isLiked: cleanedIsLiked
    };
  };

  const { likes: finalLikes, comments: finalComments, views: finalViews, isLiked: finalIsLiked } = cleanData();

  // ✅ États locaux avec données nettoyées
  const [localIsLiked, setLocalIsLiked] = useState(finalIsLiked);
  const [localIsSaved, setLocalIsSaved] = useState(isSaved);
  const [localLikes, setLocalLikes] = useState(finalLikes);
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Mettre à jour les états si les props changent
  useEffect(() => {
    const cleaned = cleanData();
    setLocalLikes(cleaned.likes);
    setLocalIsLiked(cleaned.isLiked);
  }, [rawLikes, likes, isLiked, currentUserId]);

  useEffect(() => {
    setLocalIsSaved(isSaved);
  }, [isSaved]);

  // ✅ FONCTION HELPER: Formater le temps (identique à Post)
  const formatTime = (timeValue) => {
    if (!timeValue) return '?';
    
    if (typeof timeValue === 'string' && timeValue.match(/^\d+[hmj]$/)) {
      return timeValue;
    }
    
    try {
      const date = new Date(timeValue);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'À l\'instant';
      if (diffInHours < 24) return `${diffInHours}h`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}j`;
      
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return timeValue || '?';
    }
  };

  // ✅ ProfileImage component (identique à Post)
  const ProfileImage = ({ avatar, username, size = "w-10 h-10" }) => {
    const [imgError, setImgError] = useState(false);

    const getProfileImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("https://res.cloudinary.com")) return imagePath;
      if (imagePath.startsWith("data:image")) return imagePath;
      if (imagePath.startsWith("http")) return imagePath;
      return null;
    };

    const imageUrl = getProfileImageUrl(avatar);

    return (
      <div className={`${size} rounded-full overflow-hidden bg-gray-600 flex-shrink-0`}>
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={`Photo de profil de ${username}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
            {username?.charAt(0)?.toUpperCase() || "F"}
          </div>
        )}
      </div>
    );
  };

  const handleLike = () => {
    const wasLiked = localIsLiked;
    setLocalIsLiked(!wasLiked);
    setLocalLikes((prevLikes) => (wasLiked ? prevLikes - 1 : prevLikes + 1));
    
    if (onLike) {
      onLike();
    }
  };

  const handleSave = () => {
    setLocalIsSaved(!localIsSaved);
    
    if (onSave) {
      onSave();
    }
  };

  return (
    <article className="mb-6 border-b border-gray-700">
      {/* ✅ Header identique à Post */}
      <div className="flex items-center p-4">
        <div className="mr-3">
          <ProfileImage
            avatar={userAvatar}
            username={username}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-bold">{username}</div>
            {/* ✅ Badge Flash discret */}
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap size={8} />
              FLASH
            </span>
          </div>
          <div className="text-xs text-gray-500">{formatTime(time)}</div>
        </div>
        <div className="relative">
          <button
            className="text-xl text-gray-500 hover:text-white transition-colors p-1"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
              <button className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-gray-300">
                Voir le profil
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-700 text-sm text-gray-300">
                Partager
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Zone d'image identique à Post */}
      <div className="w-full aspect-square bg-gray-700 relative overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title || "Flash"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Zap size={24} className="text-white" />
              </div>
              <div className="text-gray-400 text-sm">Design Flash</div>
            </div>
          </div>
        )}

        {/* ✅ Stats overlay discret */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
            <Eye size={10} />
            {finalViews}
          </div>
          {rating && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
              <Star size={10} fill="rgb(249 115 22)" color="rgb(249 115 22)" />
              {rating}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Actions identiques à Post */}
      <div className="flex items-center p-4">
        <button
          className="mr-4 text-xl hover:scale-110 transition-transform"
          onClick={handleLike}
        >
          <Heart
            fill={localIsLiked ? "#ef4444" : "none"}
            color={localIsLiked ? "#ef4444" : "currentColor"}
          />
        </button>
        <button className="mr-4 text-xl hover:scale-110 transition-transform">
          <MessageCircle />
        </button>
        <button
          className="ml-auto text-xl hover:scale-110 transition-transform"
          onClick={handleSave}
        >
          <Bookmark
            fill={localIsSaved ? "#ef4444" : "none"}
            color={localIsSaved ? "#ef4444" : "currentColor"}
          />
        </button>
      </div>

      {/* ✅ Likes identiques à Post */}
      <div className="px-4 mb-1 text-sm font-bold">{localLikes} j'aime</div>

      {/* ✅ Caption avec infos Flash */}
      <div className="px-4 text-sm leading-relaxed">
        <span className="font-bold">{artist || username}</span>{" "}
        {title && `🎵 ${title}`}
        {price && (
          <span className="text-green-400 font-semibold ml-2">{price}€</span>
        )}
      </div>

      {/* ✅ Comments preview identique à Post */}
      <button className="p-4 text-sm text-gray-500 hover:text-gray-300 transition-colors">
        Voir les {finalComments} commentaires
      </button>

      {/* ✅ Bouton Flash spécial mais discret */}
      <div className="px-4 pb-4">
        <Link
          to={`/flashdetail?id=${id}`}
          className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
        >
          <Zap size={14} />
          Voir les détails Flash
        </Link>
      </div>
    </article>
  );
}