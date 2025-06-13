import React from "react";
import { Camera } from "lucide-react";

export default function ProfileAvatar({ displayUser, isOwnProfile, onPhotoClick }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getProfileImage = () => {
    if (displayUser?.photoProfil && displayUser.photoProfil.startsWith('data:image')) {
      return (
        <img 
          src={displayUser.photoProfil} 
          alt="Profil" 
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <span className="text-2xl sm:text-3xl font-bold">
        {getInitials(displayUser?.nom)}
      </span>
    );
  };

  return (
    <div className="relative group">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-400 flex items-center justify-center text-white mb-3 overflow-hidden">
        {getProfileImage()}
      </div>
      {isOwnProfile && (
        <button 
          onClick={onPhotoClick}
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Camera className="text-white" size={24} />
        </button>
      )}
    </div>
  );
}