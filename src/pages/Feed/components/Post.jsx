import React, { useContext } from "react";
import { Bookmark, Heart, MessageCircle, Share } from "lucide-react";
import { FlashContext } from "../../../context/FlashContext";

export default function Post({ id, username, time, likes, caption, comments, isLiked, isSaved }) {
  const { toggleLikePost } = useContext(FlashContext);
  
  const handleLike = () => {
    toggleLikePost(id);
  };
  
  return (
    <article className="mb-6 border-b border-gray-700">
      <div className="flex items-center p-4">
        <div className="w-10 h-10 rounded-full bg-gray-600 mr-3"></div>
        <div className="flex-1">
          <div className="font-bold">{username}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <div className="text-xl text-gray-500">⋮</div>
      </div>

      <div className="w-full aspect-square bg-gray-700"></div>

      <div className="flex items-center p-4">
        <button className="mr-4 text-xl" onClick={handleLike}>
          <Heart fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "currentColor"} />
        </button>
        <button className="mr-4 text-xl">
          <MessageCircle />
        </button>
        <button className="ml-auto text-xl">
          <Bookmark fill={isSaved ? "#ef4444" : "none"} color={isSaved ? "#ef4444" : "currentColor"} />
        </button>
      </div>

      <div className="px-4 mb-1 text-sm font-bold">{likes} j'aime</div>

      <div className="px-4 text-sm leading-relaxed">
        <span className="font-bold">{username}</span> {caption}
      </div>

      <div className="p-4 text-sm text-gray-500">
        Voir les {comments} commentaires
      </div>
    </article>
  );
}