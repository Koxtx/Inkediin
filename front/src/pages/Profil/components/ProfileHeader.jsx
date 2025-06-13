import React from "react";
import { Link } from "react-router-dom";
import { Eye, Settings, ArrowLeft } from "lucide-react";

export default function ProfileHeader({ isOwnProfile, currentUser, onGoBack }) {
  if (isOwnProfile) {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <div className="flex gap-2">
          <Link 
            to={`/profil/${currentUser._id}`}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Eye size={20} />
          </Link>
          <Link 
            to="/param"
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button 
        onClick={onGoBack}
        className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Retour
      </button>
    </div>
  );
}