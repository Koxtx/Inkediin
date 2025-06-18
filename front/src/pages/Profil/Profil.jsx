import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { PublicationContext } from "../../context/PublicationContext";
import { getTattooerById } from "../../api/auth.api";
import { publicationApi } from "../../api/feed.api";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";

// Import des composants
import ProfileHeader from "./components/ProfileHeader";
import ProfileAvatar from "./components/ProfileAvatar";
import ProfileBio from "./components/ProfileBio";
import ProfileActions from "./components/ProfileActions";
import ProfileStats from "./components/ProfileStats";
import ProfileSpecialties from "./components/ProfileSpecialties";
import ProfileTabs from "./components/ProfileTabs";
import TattooGallery from "./components/TattooGallery";
import FlashGallery from "./components/FlashGallery";
import FlashStatistics from "./components/FlashStatistics";
import ClientPreferences from "./components/ClientPreferences";
import ClientWishlist from "./components/ClientWishlist";
import FollowedArtists from "./components/FollowedArtists";
import ArtistRecommendations from "./components/ArtistRecommendations";

export default function Profil() {
  const { id: userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const {
    followedPosts,
    recommendedPosts,
    toggleLikePost,
    toggleSavePost,
    deletePost: deletePublication,
    refreshData,
  } = useContext(PublicationContext);

  // États principaux
  const [activeTab, setActiveTab] = useState("gallery");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [otherUserData, setOtherUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    followers: 0,
    following: 0,
    publications: 0,
  });

  // Logique pour déterminer si c'est son propre profil
  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : otherUserData;

  useEffect(() => {
    console.log("📍 Profil - userId depuis URL:", userId);
    console.log("👤 Profil - currentUser._id:", currentUser?._id);
    console.log("🏠 Profil - isOwnProfile:", isOwnProfile);
  }, [userId, currentUser, isOwnProfile]);

  // Données factices pour les clients
  const [clientPreferences] = useState({
    favoriteStyles: ["Old School", "Géométrique", "Minimaliste", "Japonais"],
    preferredLocations: ["Avant-bras", "Épaule", "Dos"],
    criteria: {
      "Hygiène du studio": 5,
      "Réputation de l'artiste": 4,
      Prix: 3,
      Proximité: 2,
    },
  });

  const [wishlist] = useState([
    { id: 1, artistName: "TattooArtist1", style: "Old School" },
    { id: 2, artistName: "TattooArtist2", style: "Géométrique" },
    { id: 3, artistName: "TattooArtist3", style: "Japonais" },
    { id: 4, artistName: "TattooArtist4", style: "Minimaliste" },
  ]);

  const [followedArtists] = useState([
    { id: 1, name: "TattooArtist1", specialty: "Old School" },
    { id: 2, name: "TattooArtist2", specialty: "Géométrique" },
    { id: 3, name: "TattooArtist3", specialty: "Japonais" },
  ]);

  // Fonction pour charger les statistiques de l'utilisateur
  const loadUserStats = async (targetUserId) => {
    try {
      let publicationsCount = 0;

      if (isOwnProfile) {
        // Pour son propre profil, compter ses publications depuis le contexte
        publicationsCount = followedPosts.filter(
          (post) => post.idTatoueur === currentUser?._id
        ).length;
      } else {
        // Pour les autres profils, faire un appel API
        const response = await publicationApi.getPublicationsByTattooArtist(
          targetUserId,
          {
            limit: 1,
            page: 1,
          }
        );
        publicationsCount = response.total || 0;
      }

      setUserStats((prev) => ({
        ...prev,
        publications: publicationsCount,
        // Les followers/following pourraient venir d'une autre API
        followers: Math.floor(Math.random() * 2000) + 100,
        following: Math.floor(Math.random() * 500) + 10,
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  // Chargement des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isOwnProfile && userId) {
        setLoading(true);
        try {
          console.log("📡 Chargement des données pour userId:", userId);

          const result = await getTattooerById(userId);

          if (result.success) {
            console.log("✅ Données utilisateur chargées:", result.data);
            const userData = {
              ...result.data,
              about: generateAboutSection(result.data),
            };
            setOtherUserData(userData);

            // Charger les statistiques
            await loadUserStats(result.data._id);
          } else {
            console.error("❌ Erreur lors du chargement:", result.message);
            setOtherUserData(null);
          }
        } catch (error) {
          console.error("💥 Erreur lors du fetch:", error);
          setOtherUserData(generateFallbackUserData(userId));
        } finally {
          setLoading(false);
        }
      } else if (isOwnProfile && currentUser) {
        setTempBio(currentUser?.bio || "");
        // Charger les statistiques pour son propre profil
        await loadUserStats(currentUser._id);
      }
    };

    fetchUserData();
  }, [userId, isOwnProfile, currentUser, followedPosts]);

  // Initialisation de l'onglet selon le type d'utilisateur
  useEffect(() => {
    if (displayUser) {
      if (displayUser.userType === "client" && isOwnProfile) {
        setActiveTab("preferences");
      } else {
        setActiveTab("gallery");
      }
    }
  }, [displayUser, isOwnProfile]);

  // Fonctions utilitaires pour générer les données
  const generateAboutSection = (userData) => {
    return {
      experience: "Professionnel",
      specialties: userData.styles
        ? userData.styles.split(",").map((s) => s.trim())
        : ["Réalisme", "Portraits", "Black & Grey"],
      studio: "Studio professionnel",
      certifications: ["Hygiène et sécurité", "Formation continue 2024"],
    };
  };

  const generateFallbackUserData = (userId) => {
    return {
      _id: userId,
      nom: "Alexandre_Ink",
      userType: "tatoueur",
      photoProfil: null,
      bio: "Tatoueur professionnel spécialisé dans le réalisme et les portraits. 10 ans d'expérience.",
      localisation: "Paris, France",
      styles: "Réalisme, Portraits, Black & Grey",
      about: {
        experience: "10 ans",
        specialties: ["Réalisme", "Portraits", "Black & Grey"],
        studio: "Ink Masters Studio",
        certifications: ["Hygiène et sécurité", "Formation continue 2024"],
      },
    };
  };

  // Handlers pour les actions
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(
      isFollowing
        ? "Vous ne suivez plus cet utilisateur"
        : "Vous suivez maintenant cet utilisateur"
    );
  };

  const handleSaveBio = () => {
    // Ici, vous pourriez appeler une API pour sauvegarder la bio
    toast.success("Biographie mise à jour !");
    setIsEditingBio(false);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handlePhotoClick = () => {
    toast.info("Fonctionnalité de changement de photo à implémenter");
  };

  const handleMessageClick = () => {
    toast.info("Redirection vers la messagerie à implémenter");
  };

  const handleShareClick = () => {
    toast.info("Fonctionnalité de partage à implémenter");
  };

  const handleEditSpecialties = () => {
    toast.info("Édition des spécialités à implémenter");
  };

  const handleAddSpecialty = () => {
    toast.info("Ajout de spécialité à implémenter");
  };

  // Handlers pour la galerie avec intégration API
  const handleAddToGallery = () => {
    // Redirige vers la page de création de publication
    window.location.href = "/uploadpublication";
  };

  const handleEditGalleryItem = async (itemId) => {
    toast.info(`Édition de la publication ${itemId} à implémenter`);
    // TODO: Implémenter l'édition des publications
  };

  const handleDeleteGalleryItem = async (itemId) => {
    try {
      await deletePublication(itemId);
      toast.success("Publication supprimée avec succès");
      // Recharger les statistiques
      await loadUserStats(displayUser._id);
    } catch (error) {
      toast.error("Erreur lors de la suppression de la publication");
    }
  };

  const handleLikeGalleryItem = async (itemId) => {
    try {
      await toggleLikePost(itemId);
      toast.success("Publication likée");
    } catch (error) {
      toast.error("Erreur lors du like");
    }
  };

  // Handlers pour la wishlist et les artistes suivis
  const handleWishlistItemClick = (item) => {
    toast.info(`Clic sur ${item.artistName} - ${item.style}`);
  };

  const handleUnfollowArtist = (artistId) => {
    toast.info(`Désabonnement de l'artiste ${artistId} à implémenter`);
  };

  const handleArtistClick = (artist) => {
    toast.info(`Redirection vers le profil de ${artist.name}`);
  };

  // Handlers pour les flashs
  const handleAddFlash = () => {
    toast.info("Ajout d'un nouveau flash à implémenter");
  };

  const handleEditFlash = (flashId) => {
    toast.info(`Édition du flash ${flashId} à implémenter`);
  };

  const handleDeleteFlash = (flashId) => {
    toast.info(`Suppression du flash ${flashId} à implémenter`);
  };

  const handleLikeFlash = (flashId) => {
    toast.info(`Like du flash ${flashId} à implémenter`);
  };

  const handleViewAllFlashs = () => {
    toast.info(`Redirection vers tous les flashs de ${displayUser?.nom}`);
  };

  // Handlers pour les recommandations d'artistes
  const handleFollowRecommendedArtist = (artistId) => {
    toast.info(`Suivi de l'artiste recommandé ${artistId} à implémenter`);
  };

  const handleViewRecommendedArtist = (artist) => {
    toast.info(`Redirection vers le profil de ${artist.name}`);
  };

  // Handlers pour les avis
  const handleReplyToReview = (reviewId) => {
    toast.info(`Réponse à l'avis ${reviewId} à implémenter`);
  };

  const handleLikeReview = (reviewId) => {
    toast.info(`Like de l'avis ${reviewId} à implémenter`);
  };

  // Configuration des onglets selon le type d'utilisateur
  const getAvailableTabs = () => {
    if (displayUser?.userType === "tatoueur") {
      const tabs = [{ id: "gallery", label: "Publications" }];

      if (!isOwnProfile) {
        tabs.push(
          { id: "about", label: "À propos" },
          { id: "reviews", label: "Avis" }
        );
      }

      return tabs;
    } else {
      // Client
      if (isOwnProfile) {
        return [
          { id: "preferences", label: "Préférences" },
          { id: "gallery", label: "Wishlist" },
          { id: "followed", label: "Tatoueurs suivis" },
        ];
      } else {
        return [{ id: "gallery", label: "Wishlist" }];
      }
    }
  };

  // Rendu du contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case "gallery":
        if (displayUser?.userType === "tatoueur") {
          return (
            <TattooGallery
              displayUser={displayUser}
              isOwnProfile={isOwnProfile}
              onAddClick={handleAddToGallery}
              onEditItem={handleEditGalleryItem}
              onDeleteItem={handleDeleteGalleryItem}
              onLikeItem={handleLikeGalleryItem}
            />
          );
        } else {
          return (
            <ClientWishlist
              wishlist={wishlist}
              isOwnProfile={isOwnProfile}
              onItemClick={handleWishlistItemClick}
            />
          );
        }

      case "preferences":
        return <ClientPreferences preferences={clientPreferences} />;

      case "followed":
        return (
          <FollowedArtists
            followedArtists={followedArtists}
            onUnfollowArtist={handleUnfollowArtist}
            onArtistClick={handleArtistClick}
          />
        );

      case "about":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">À propos</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Expérience
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {displayUser?.about?.experience}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Spécialités
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displayUser?.about?.specialties?.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 px-3 py-1 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Studio
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {displayUser?.about?.studio}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Certifications
                </h4>
                <ul className="text-gray-600 dark:text-gray-400">
                  {displayUser?.about?.certifications?.map((cert, index) => (
                    <li key={index}>• {cert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case "reviews":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Avis clients</h3>
            <div className="text-center py-8 text-gray-500">
              <p>Fonctionnalité d'avis à implémenter</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <span className="ml-3">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Utilisateur introuvable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            L'utilisateur avec l'ID "{userId}" n'existe pas ou n'est plus
            disponible.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleGoBack}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              Retour
            </button>
            <Link
              to="/"
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              Accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mettre à jour les statistiques avec les données réelles
  const displayStats = {
    ...userStats,
    tattoos: userStats.publications, // Adapter selon votre logique
  };

  // Rendu principal
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header avec boutons d'action */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        currentUser={currentUser}
        onGoBack={handleGoBack}
      />

      {/* Section profil */}
      <div className="flex flex-col items-center mb-8">
        <ProfileAvatar
          displayUser={displayUser}
          isOwnProfile={isOwnProfile}
          onPhotoClick={handlePhotoClick}
        />

        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold">
            {displayUser.nom || "Utilisateur"}
          </h1>
        </div>

        <ProfileBio
          displayUser={displayUser}
          isOwnProfile={isOwnProfile}
          isEditingBio={isEditingBio}
          tempBio={tempBio}
          onEditClick={() => setIsEditingBio(true)}
          onBioChange={setTempBio}
          onSaveBio={handleSaveBio}
          onCancelEdit={() => {
            setIsEditingBio(false);
            setTempBio(displayUser.bio || "");
          }}
        />

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📍 {displayUser.localisation || "Non spécifié"}
        </div>

        {/* Statistiques pour les tatoueurs */}
        {displayUser.userType === "tatoueur" && (
          <ProfileStats stats={displayStats} />
        )}

        <ProfileActions
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollowClick={handleFollow}
          onMessageClick={handleMessageClick}
          onShareClick={handleShareClick}
          displayUser={displayUser}
        />
      </div>

      {/* Spécialités pour les tatoueurs */}
      {displayUser.userType === "tatoueur" && (
        <ProfileSpecialties
          displayUser={displayUser}
          isOwnProfile={isOwnProfile}
          onEditClick={handleEditSpecialties}
          onAddClick={handleAddSpecialty}
        />
      )}

      {/* Onglets */}
      <ProfileTabs
        availableTabs={getAvailableTabs()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenu des onglets */}
      {renderTabContent()}

      {/* Flashs disponibles pour les tatoueurs */}
      {displayUser?.userType === "tatoueur" && activeTab === "gallery" && (
        <FlashGallery
          displayUser={displayUser}
          isOwnProfile={isOwnProfile}
          onAddFlash={handleAddFlash}
          onEditFlash={handleEditFlash}
          onDeleteFlash={handleDeleteFlash}
          onLikeFlash={handleLikeFlash}
          onViewAll={handleViewAllFlashs}
        />
      )}

      {/* Statistiques des flashs pour le propriétaire */}
      {isOwnProfile && displayUser?.userType === "tatoueur" && (
        <FlashStatistics
          isOwnProfile={isOwnProfile}
          displayUser={displayUser}
        />
      )}

      {/* Recommandations d'artistes pour les clients */}
      {isOwnProfile &&
        displayUser?.userType === "client" &&
        activeTab === "followed" && (
          <ArtistRecommendations
            isOwnProfile={isOwnProfile}
            displayUser={displayUser}
            onFollowArtist={handleFollowRecommendedArtist}
            onViewArtist={handleViewRecommendedArtist}
          />
        )}
    </div>
  );
}
