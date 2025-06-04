import React, { useState } from "react";
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
}) {
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsSaved, setLocalIsSaved] = useState(isSaved);
  const [localLikes, setLocalLikes] = useState(likes);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => {
    const wasLiked = localIsLiked;
    setLocalIsLiked(!wasLiked);
    setLocalLikes((prevLikes) => (wasLiked ? prevLikes - 1 : prevLikes + 1));
  };

  const handleSave = () => {
    setLocalIsSaved(!localIsSaved);
  };

  return (
    <article className="mb-6 border-b border-gray-700 bg-gray-900">
      {/* Header */}
      <div className="flex items-center p-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 mr-3 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-white">{username}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Badge Flash */}
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Zap size={8} />
            FLASH
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
      </div>

      {/* Image/Content */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                <Zap size={24} className="text-white" />
              </div>
              <div className="text-gray-400 text-sm">Contenu Flash</div>
            </div>
          </div>
        )}

        {/* Overlay discret */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Stats overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white text-xs">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
            <Eye size={10} />
            {views}
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star size={10} fill="rgb(249 115 22)" color="rgb(249 115 22)" />
            {rating}
          </div>
        </div>
      </div>

      {/* Actions */}
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

      {/* Likes */}
      <div className="px-4 mb-1 text-sm font-bold text-white">
        {localLikes} j'aime
      </div>

      {/* Caption */}
      <div className="px-4 text-sm leading-relaxed text-white mb-2">
        <span className="font-bold">{artist || username}</span>{" "}
        <span className="text-gray-300">
          {title && `🎵 ${title}`}
          {price && ` • ${price}`}
        </span>
      </div>

      {/* Comments preview */}
      <button className="p-4 text-sm text-gray-500 hover:text-gray-300 transition-colors">
        Voir les {comments} commentaires
      </button>

      {/* Action buttons - style plus discret */}
      <div className="flex gap-2 px-4 pb-4">
        <Link
          to="/flashdetail"
          className="flex items-center justify-center bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
        >
          Détails
        </Link>
      </div>
    </article>
  );
}
