import React, { useState } from "react";
import { Camera } from "lucide-react";

export default function ProfileAvatar({
  displayUser,
  isOwnProfile,
  onPhotoClick,
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ NOUVELLE FONCTION: Gestion des URLs Cloudinary
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;

    console.log("🖼️ ProfileAvatar - Image path:", imagePath);

    // Si c'est déjà une URL Cloudinary complète
    if (imagePath.startsWith("https://res.cloudinary.com")) {
      console.log("✅ ProfileAvatar - URL Cloudinary détectée");
      return imagePath;
    }

    // Si c'est du base64, retourner tel quel
    if (imagePath.startsWith("data:image")) {
      console.log("✅ ProfileAvatar - Image base64 détectée");
      return imagePath;
    }

    // Si l'image commence par http, c'est déjà une URL complète
    if (imagePath.startsWith("http")) {
      console.log("✅ ProfileAvatar - URL HTTP détectée");
      return imagePath;
    }

    // Fallback pour les anciennes images locales
    console.log("⚠️ ProfileAvatar - Fallback vers serveur local");
    const baseUrl = "http://localhost:3000";
    const cleanPath = imagePath.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    return `${baseUrl}${finalPath}`;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    console.log("✅ ProfileAvatar - Image chargée avec succès");
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    setImageError(true);
    console.error("❌ ProfileAvatar - Erreur chargement image:", e.target.src);
  };

  const getProfileImage = () => {
    const photoPath = displayUser?.photoProfil;

    console.log("🔍 ProfileAvatar - Photo profil:", photoPath);

    // Si on a une photo et pas d'erreur, l'afficher
    if (photoPath && !imageError) {
      const imageUrl = getProfileImageUrl(photoPath);

      if (imageUrl) {
        return (
          <div className="relative w-full h-full">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-400 animate-pulse rounded-full" />
            )}
            <img
              src={imageUrl}
              alt="Profil"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onLoadStart={() => setImageLoading(true)}
            />
          </div>
        );
      }
    }

    // Fallback vers les initiales
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
    </div>
  );
}
