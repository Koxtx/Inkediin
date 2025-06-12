import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { completeProfile } from "../../api/auth.api";
import { User, MapPin, FileText, Palette, Camera, Upload, X } from "lucide-react";

export default function SetupProfil() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Empêcher la navigation avec le bouton retour du navigateur
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      toast.error("Vous devez compléter votre profil avant de continuer");
      window.history.pushState(null, null, "/setupprofil");
    };

    // Ajouter un état à l'historique pour capturer le retour
    window.history.pushState(null, null, "/setupprofil");
    window.addEventListener("popstate", handlePopState);

    // Empêcher la fermeture/actualisation de la page
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Votre profil n'est pas encore configuré. Êtes-vous sûr de vouloir quitter ?";
      return event.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const schema = yup.object({
    userType: yup
      .string()
      .required("Vous devez choisir un type de profil")
      .oneOf(["client", "tatoueur"], "Type de profil invalide"),
    nom: yup
      .string()
      .required("Le nom d'utilisateur est obligatoire")
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(30, "Le nom ne peut pas dépasser 30 caractères"),
    localisation: yup
      .string()
      .required("La localisation est obligatoire")
      .max(100, "La localisation ne peut pas dépasser 100 caractères"),
    bio: yup
      .string()
      .max(500, "La biographie ne peut pas dépasser 500 caractères"),
    styles: yup
      .string()
      .max(200, "Les styles ne peuvent pas dépasser 200 caractères"),
  });

  const defaultValues = {
    userType: "",
    nom: "",
    localisation: "",
    bio: "",
    styles: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const bioLength = watch("bio")?.length || 0;
  const watchedUserType = watch("userType");

  // Fonction simple pour valider l'image
  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      return { valid: false, error: 'Aucun fichier sélectionné' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}` 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Le fichier est trop volumineux. Taille maximale: 5MB` 
      };
    }

    return { valid: true };
  };

  // Gestion de l'upload d'image (version simple sans Supabase)
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setUploadingImage(true);
      
      setProfileImage(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      toast.success("Image sélectionnée avec succès !");
      
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      toast.error("Erreur lors du traitement de l'image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const submit = async (values) => {
    setIsSubmitting(true);

    try {
      console.log("🔧 Configuration du profil avec:", values);
      console.log("👤 Utilisateur actuel:", user);

      // Pour l'instant, on stocke l'image en base64
      // Dans un vrai projet, vous uploaderiez vers un service comme Supabase Storage
      const profileData = {
        userType: values.userType,
        nom: values.nom,
        localisation: values.localisation,
        bio: values.bio || "",
        styles: values.styles || "",
        // Stocker l'image en base64 temporairement
        photoProfil: profileImagePreview || "",
      };

      const result = await completeProfile(profileData);
      console.log("📝 Résultat complétion profil:", result);

      if (result.success) {
        // Mettre à jour le contexte utilisateur
        if (result.user) {
          console.log("✅ Mise à jour du contexte avec:", result.user);
          setUser(result.user);
        } else {
          // Si le serveur ne renvoie pas l'utilisateur complet,
          // on met à jour avec les données locales
          const updatedUser = {
            ...user,
            ...profileData,
            isProfileCompleted: true,
            needsProfileCompletion: false,
          };
          console.log("🔄 Mise à jour locale du contexte avec:", updatedUser);
          setUser(updatedUser);
        }

        toast.success("Profil configuré avec succès !");

        // Petit délai pour s'assurer que le contexte est mis à jour
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      } else {
        console.log("❌ Erreur configuration profil:", result.message);
        toast.error(
          result.message || "Erreur lors de la configuration du profil"
        );
      }
    } catch (error) {
      console.error("💥 Erreur lors de la configuration:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Bienvenue sur Inkediin ! 🎨
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Configurez votre profil pour commencer à partager votre art
          </p>
          <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Vous devez compléter votre profil pour accéder à l'application
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-6"
        >
          {/* Photo de profil */}
          <div className="text-center">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3">
              <Camera size={18} className="inline mr-2" />
              Photo de profil
            </label>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-500">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Prévisualisation"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={uploadingImage || isSubmitting}
                  >
                    <X size={16} />
                  </button>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center">
                  <Upload size={16} className="mr-2" />
                  {uploadingImage ? "Traitement..." : "Choisir une photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImage || isSubmitting}
                  />
                </label>
                {profileImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                    disabled={uploadingImage || isSubmitting}
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG jusqu'à 5MB
              </p>
            </div>
          </div>

          {/* Type d'utilisateur */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3">
              <User size={18} className="inline mr-2" />
              Type de profil *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  {...register("userType")}
                  type="radio"
                  value="client"
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div
                  className={`p-4 border-2 rounded-lg transition-all ${
                    watchedUserType === "client"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div className="text-center">
                    <User size={32} className="mx-auto mb-2 text-red-500" />
                    <h3 className="font-semibold">Client</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Je recherche un tatoueur
                    </p>
                  </div>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  {...register("userType")}
                  type="radio"
                  value="tatoueur"
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div
                  className={`p-4 border-2 rounded-lg transition-all ${
                    watchedUserType === "tatoueur"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div className="text-center">
                    <Palette size={32} className="mx-auto mb-2 text-red-500" />
                    <h3 className="font-semibold">Tatoueur</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Je propose mes services
                    </p>
                  </div>
                </div>
              </label>
            </div>
            {errors.userType && (
              <p className="text-red-500 text-sm mt-2">
                {errors.userType.message}
              </p>
            )}
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label
              htmlFor="nom"
              className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
            >
              <User size={18} className="inline mr-2" />
              Nom d'utilisateur *
            </label>
            <input
              {...register("nom")}
              type="text"
              id="nom"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Votre nom d'artiste"
              disabled={isSubmitting}
            />
            {errors.nom && (
              <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
            )}
          </div>

          {/* Localisation */}
          <div>
            <label
              htmlFor="localisation"
              className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
            >
              <MapPin size={18} className="inline mr-2" />
              Localisation *
            </label>
            <input
              {...register("localisation")}
              type="text"
              id="localisation"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Paris, France"
              disabled={isSubmitting}
            />
            {errors.localisation && (
              <p className="text-red-500 text-sm mt-1">
                {errors.localisation.message}
              </p>
            )}
          </div>

          {/* Champs spécifiques aux tatoueurs */}
          {watchedUserType === "tatoueur" && (
            <>
              {/* Biographie */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                >
                  <FileText size={18} className="inline mr-2" />
                  Biographie
                </label>
                <textarea
                  {...register("bio")}
                  id="bio"
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  placeholder="Parlez-nous de votre passion pour l'art du tatouage..."
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-500 text-sm">{errors.bio.message}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {bioLength}/500 caractères
                  </p>
                </div>
              </div>

              {/* Styles */}
              <div>
                <label
                  htmlFor="styles"
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                >
                  <Palette size={18} className="inline mr-2" />
                  Styles de tatouage
                </label>
                <input
                  {...register("styles")}
                  type="text"
                  id="styles"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Traditionnel, Réalisme, Japonais, Géométrique..."
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Séparez les styles par des virgules
                </p>
                {errors.styles && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.styles.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Configuration...
                </>
              ) : (
                "Configurer mon profil"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}