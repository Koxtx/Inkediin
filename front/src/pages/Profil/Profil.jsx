// Mise à jour du composant Profil principal avec les nouvelles intégrations API

import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getTattooerById } from "../../api/auth.api";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";

// Import des composants mis à jour
import ProfileHeader from "./components/ProfileHeader";
import ProfileAvatar from "./components/ProfileAvatar";
import ProfileBio from "./components/ProfileBio";
import ProfileActions from "./components/ProfileActions";
import ProfileStats from "./components/ProfileStats";
import ProfileSpecialties from "./components/ProfileSpecialties";
import ProfileTabs from "./components/ProfileTabs";
import TattooGallery from "./components/TattooGallery";
import FlashGallery from "./components/FlashGallery";
import ClientSavedContent from "./components/ClientSavedContent"; // ✅ CHANGEMENT: ClientSavedContent au lieu de ClientWishlist
import FollowedArtists from "./components/FollowedArtists";
import ArtistRecommendations from "./components/ArtistRecommendations";

export default function Profil() {
  const { id: userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // États principaux
  const [activeTab, setActiveTab] = useState("publications");
  const [loading, setLoading] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [otherUserData, setOtherUserData] = useState(null);

  // Logique pour déterminer si c'est son propre profil
  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : otherUserData;

  useEffect(() => {
    console.log("📍 Profil - userId depuis URL:", userId);
    console.log("👤 Profil - currentUser._id:", currentUser?._id);
    console.log("🏠 Profil - isOwnProfile:", isOwnProfile);
  }, [userId, currentUser, isOwnProfile]);

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
            setOtherUserData({
              ...result.data,
              stats: {
                followers: Math.floor(Math.random() * 2000) + 100,
                following: Math.floor(Math.random() * 500) + 10,
                tattoos: Math.floor(Math.random() * 200) + 20,
              },
              gallery: generateGallery(result.data),
              about: generateAboutSection(result.data),
            });
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
      } else {
        setTempBio(currentUser?.bio || "");
      }
    };

    fetchUserData();
  }, [userId, isOwnProfile, currentUser]);

  // ✅ CHANGEMENT: Initialisation de l'onglet selon le type d'utilisateur
  useEffect(() => {
    if (displayUser) {
      if (displayUser.userType === "client" && isOwnProfile) {
        setActiveTab("saved"); // ✅ CHANGEMENT: "saved" au lieu de "wishlist"
      } else {
        setActiveTab("publications");
      }
    }
  }, [displayUser, isOwnProfile]);

  // Fonctions utilitaires pour générer les données (inchangées)
  const generateGallery = (userData) => {
    return [
      {
        id: 1,
        imageUrl: userData.portfolio?.[0] || "/api/placeholder/400/300",
        style: "Réalisme",
        title: "Portfolio 1",
      },
      {
        id: 2,
        imageUrl: userData.portfolio?.[1] || "/api/placeholder/400/300",
        style: "Black & Grey",
        title: "Portfolio 2",
      },
      {
        id: 3,
        imageUrl: userData.portfolio?.[2] || "/api/placeholder/400/300",
        style: "Réalisme",
        title: "Portfolio 3",
      },
      {
        id: 4,
        imageUrl: "/api/placeholder/400/300",
        style: "Portrait",
        title: "Visage femme",
      },
      {
        id: 5,
        imageUrl: "/api/placeholder/400/300",
        style: "Animal",
        title: "Loup sauvage",
      },
      {
        id: 6,
        imageUrl: "/api/placeholder/400/300",
        style: "Réalisme",
        title: "Œil humain",
      },
    ];
  };

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
      stats: {
        followers: 1234,
        following: 89,
        tattoos: 156,
      },
      gallery: [
        {
          id: 1,
          imageUrl: "/api/placeholder/400/300",
          style: "Réalisme",
          title: "Portrait réaliste",
        },
        {
          id: 2,
          imageUrl: "/api/placeholder/400/300",
          style: "Black & Grey",
          title: "Lion majestueux",
        },
        {
          id: 3,
          imageUrl: "/api/placeholder/400/300",
          style: "Réalisme",
          title: "Rose détaillée",
        },
      ],
      about: {
        experience: "10 ans",
        specialties: ["Réalisme", "Portraits", "Black & Grey"],
        studio: "Ink Masters Studio",
        certifications: ["Hygiène et sécurité", "Formation continue 2024"],
      },
    };
  };

  // Handlers pour les actions (la plupart inchangés)
  const handleSaveBio = () => {
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
    // Cette fonction sera gérée par le composant ProfileActions
    // qui utilise maintenant le hook useMessagerie
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

  // Handlers pour la galerie (publications)
  const handleAddToGallery = () => {
    toast.info("Ajout d'image à la galerie à implémenter");
  };

  const handleEditGalleryItem = (itemId) => {
    toast.info(`Édition de l'élément ${itemId} à implémenter`);
  };

  const handleDeleteGalleryItem = (itemId) => {
    toast.info(`Suppression de l'élément ${itemId} à implémenter`);
  };

  const handleLikeGalleryItem = (itemId) => {
    toast.info(`Like de l'élément ${itemId} à implémenter`);
  };

  // ✅ CHANGEMENT: Handler pour contenu sauvegardé au lieu de wishlist
  const handleSavedContentClick = (item) => {
    // Navigation vers le contenu complet (post ou flash)
    if (item.contentType === 'flash') {
      navigate(`/flash/${item._id || item.id}`);
    } else {
      navigate(`/post/${item._id || item.id}`);
    }
  };

  // Handlers pour les artistes suivis (maintenant gérés par le composant FollowedArtists)
  const handleUnfollowArtist = (artistId) => {
    // Le composant FollowedArtists gère maintenant cette logique
    console.log('Artist unfollowed:', artistId);
  };

  const handleArtistClick = (artist) => {
    // Navigation vers le profil de l'artiste
    navigate(`/profil/${artist._id || artist.id}`);
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

  // Handlers pour les recommendations (maintenant gérés par le composant ArtistRecommendations)
  const handleFollowRecommendedArtist = (artistId) => {
    // Le composant ArtistRecommendations gère maintenant cette logique
    console.log('Recommended artist followed:', artistId);
  };

  const handleViewRecommendedArtist = (artistId) => {
    // Navigation vers le profil de l'artiste recommandé
    navigate(`/profil/${artistId}`);
  };

  // ✅ CHANGEMENT: Configuration des onglets selon le type d'utilisateur
  const getAvailableTabs = () => {
    if (displayUser?.userType === "tatoueur") {
      const tabs = [
        { id: "publications", label: "Publications" },
        { id: "flash", label: "Flash" }
      ];
      return tabs;
    } else {
      // Client
      if (isOwnProfile) {
        return [
          { id: "saved", label: "Contenus sauvegardés" }, // ✅ CHANGEMENT: "saved" au lieu de "wishlist"
          { id: "followed", label: "Tatoueurs suivis" },
        ];
      } else {
        return [{ id: "saved", label: "Contenus sauvegardés" }]; // ✅ CHANGEMENT
      }
    }
  };

  // ✅ CHANGEMENT: Rendu du contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case "publications":
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

      case "flash":
        return (
          <FlashGallery
            displayUser={displayUser}
            isOwnProfile={isOwnProfile}
            onAddFlash={handleAddFlash}
            onEditFlash={handleEditFlash}
            onDeleteFlash={handleDeleteFlash}
            onLikeFlash={handleLikeFlash}
            onViewAll={handleViewAllFlashs}
          />
        );

      case "saved": // ✅ CHANGEMENT: "saved" au lieu de "wishlist"
        return (
          <ClientSavedContent // ✅ CHANGEMENT: ClientSavedContent au lieu de ClientWishlist
            isOwnProfile={isOwnProfile}
            onItemClick={handleSavedContentClick} // ✅ CHANGEMENT: handler renommé
          />
        );

      case "followed":
        return (
          <FollowedArtists
            onArtistClick={handleArtistClick}
            onMessageClick={handleMessageClick}
          />
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
          <ProfileStats stats={displayUser.stats} />
        )}

        <ProfileActions
          isOwnProfile={isOwnProfile}
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