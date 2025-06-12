import React, { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { update, updateAvatar } from "../../../api/auth.api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Camera,
  User,
  MapPin,
  MessageSquare,
  Palette,
  Link,
  Users,
} from "lucide-react";

export default function ModifierProfil({ onBack }) {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    localisation: "",
    bio: "",
    styles: "",

    followers: "0",
    photoProfil: "",
  });

  // Initialiser le formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        email: user.email || "",
        localisation: user.localisation || "",
        bio: user.bio || "",
        styles: user.styles || "",

        followers: user.followers || "0",
        photoProfil: user.photoProfil || "",
      });
    }
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setLoading(true);
        const imageUrl = URL.createObjectURL(file);

        const response = await updateAvatar({
          _id: user._id,
          photoProfil: imageUrl,
        });

        if (response) {
          setFormData((prev) => ({
            ...prev,
            photoProfil: imageUrl,
          }));
          toast.success("Photo de profil mise à jour !");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'avatar:", error);
        toast.error("Erreur lors de la mise à jour de la photo");
      } finally {
        setLoading(false);
      }
    },
    [user._id]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        const updateData = {
          _id: user._id,
          ...formData,
        };

        const response = await update(updateData);

        if (response && response._id) {
          setUser(response);
          toast.success("Profil mis à jour avec succès !");
          if (onBack) onBack();
        } else {
          toast.error("Erreur lors de la mise à jour du profil");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error("Erreur lors de la mise à jour du profil");
      } finally {
        setLoading(false);
      }
    },
    [formData, user._id, setUser, onBack]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Modifier le profil
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                {formData.photoProfil ? (
                  <img
                    src={formData.photoProfil}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Cliquez sur l'icône pour changer votre photo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Votre nom"
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              {formData.nom && (
                <p className="text-sm text-gray-500 mt-1">
                  {formData.nom.length}/50
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Localisation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Localisation
              </label>
              <input
                type="text"
                name="localisation"
                value={formData.localisation}
                onChange={handleInputChange}
                placeholder="Ville, Pays"
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              {formData.localisation && (
                <p className="text-sm text-gray-500 mt-1">
                  {formData.localisation.length}/100
                </p>
              )}
            </div>

            {user?.userType === "tatoueur" && (
              <>
                {/* Bio */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Parlez-nous de vous..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                  />
                  {formData.bio && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.bio.length}/500
                    </p>
                  )}
                </div>

                {/* Styles */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Styles de tatouage
                  </label>
                  <input
                    type="text"
                    name="styles"
                    value={formData.styles}
                    onChange={handleInputChange}
                    placeholder="Réalisme, Traditionnel, Minimaliste..."
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                  {formData.styles && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.styles.length}/200
                    </p>
                  )}
                </div>

                {/* Followers */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Nombre de followers
                  </label>
                  <input
                    type="number"
                    name="followers"
                    value={formData.followers}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
