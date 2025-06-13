import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Share2 } from "lucide-react";

export default function ProfileActions({
  isOwnProfile,
  isFollowing,
  onFollowClick,
  onMessageClick,
  onShareClick,
}) {
  if (isOwnProfile) {
    return (
      <div className="flex space-x-3">
        <Link
          to="/modifierprofil"
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          Modifier le profil
        </Link>
        <Link
          to="/param"
          className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Paramètres
        </Link>
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={onFollowClick}
        className={`px-6 py-2 rounded-full font-medium transition-colors ${
          isFollowing
            ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
      >
        {isFollowing ? "Suivi" : "Suivre"}
      </button>

      <button
        onClick={onMessageClick}
        className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors flex items-center"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Message
      </button>

      <button
        onClick={onShareClick}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}
