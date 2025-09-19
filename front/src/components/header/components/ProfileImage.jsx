import React from 'react';

const ProfileImage = ({ user, size = 'default' }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("https://res.cloudinary.com")) {
      return imagePath;
    }

    if (imagePath.startsWith("data:image")) {
      return imagePath;
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // const baseUrl = "http://localhost:3000";
    const baseUrl = "https://inkediin.onrender.com";
    const cleanPath = imagePath.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `${baseUrl}${finalPath}`;
  };

  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-10 w-10',
    large: 'h-12 w-12'
  };

  const textSizeClasses = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  };

  const photoPath = user?.photoProfil;
  const imageUrl = photoPath ? getProfileImageUrl(photoPath) : null;

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-red-400 flex items-center justify-center text-white overflow-hidden relative`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Profil"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("❌ Erreur chargement image:", imageUrl);
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      )}
      <span
        className={`${textSizeClasses[size]} font-bold absolute inset-0 flex items-center justify-center`}
        style={{ display: imageUrl ? "none" : "flex" }}
      >
        {getInitials(user?.nom)}
      </span>
    </div>
  );
};

export default ProfileImage;