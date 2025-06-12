import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Edit, 
  Plus, 
  Settings, 
  Camera, 
  Eye,
  Check,
  ArrowLeft 
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profil() {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  
  // Déterminer si on regarde son propre profil ou celui d'un autre
  const isOwnProfile = !userId || userId === currentUser?._id;
  
  const [activeTab, setActiveTab] = useState("gallery");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [otherUserData, setOtherUserData] = useState(null);

  // Données factices pour les préférences client
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

  // Charger les données de l'autre utilisateur si ce n'est pas son propre profil
  useEffect(() => {
    if (!isOwnProfile && userId) {
      // Simuler un appel API pour récupérer les données de l'autre utilisateur
      setTimeout(() => {
        setOtherUserData({
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
            tattoos: 156
          },
          gallery: [
            { id: 1, imageUrl: "", style: "Réalisme", title: "Portrait réaliste" },
            { id: 2, imageUrl: "", style: "Black & Grey", title: "Lion majestueux" },
            { id: 3, imageUrl: "", style: "Réalisme", title: "Rose détaillée" },
            { id: 4, imageUrl: "", style: "Portrait", title: "Visage femme" },
            { id: 5, imageUrl: "", style: "Animal", title: "Loup sauvage" },
            { id: 6, imageUrl: "", style: "Réalisme", title: "Œil humain" }
          ],
          about: {
            experience: "10 ans",
            specialties: ["Réalisme", "Portraits", "Black & Grey"],
            studio: "Ink Masters Studio",
            certifications: ["Hygiène et sécurité", "Formation continue 2024"]
          }
        });
        setLoading(false);
      }, 1000);
    } else {
      setTempBio(currentUser?.bio || "");
    }
  }, [userId, isOwnProfile, currentUser]);

  // Données utilisateur à afficher
  const displayUser = isOwnProfile ? currentUser : otherUserData;

  // Initialiser l'onglet selon le type d'utilisateur
  useEffect(() => {
    if (displayUser) {
      if (displayUser.userType === "client" && isOwnProfile) {
        setActiveTab("preferences");
      } else {
        setActiveTab("gallery");
      }
    }
  }, [displayUser, isOwnProfile]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Vous ne suivez plus cet utilisateur" : "Vous suivez maintenant cet utilisateur");
  };

  const handleSaveBio = () => {
    // Ici vous feriez un appel API pour sauvegarder la bio
    toast.success("Biographie mise à jour !");
    setIsEditingBio(false);
  };

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

  // Contenu des onglets selon le type d'utilisateur
  const getTabContent = () => {
    switch (activeTab) {
      case "gallery":
        if (displayUser?.userType === "tatoueur") {
          return (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Portfolio ({displayUser?.gallery?.length || 0})
                </h2>
                {isOwnProfile && (
                  <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm">
                    <Plus size={16} /> Ajouter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayUser?.gallery?.map((item) => (
                  <div
                    key={item.id}
                    className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-300">{item.style}</div>
                      </div>
                      {!isOwnProfile && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
                            <Heart className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                      {isOwnProfile && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100">
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )) || Array.from({length: 6}, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md"
                  ></div>
                ))}
                {isOwnProfile && (
                  <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-red-400 dark:hover:border-red-400 transition-colors cursor-pointer">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Plus size={24} className="mx-auto mb-2" />
                      <span className="text-sm">Ajouter une image</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        } else {
          // Client - Wishlist
          return (
            <div className="mb-5">
              <h2 className="text-xl font-bold mb-4">
                {isOwnProfile ? "Ma wishlist" : "Wishlist"} ({wishlist.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="h-40 sm:h-48 bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative"
                  >
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3">
                      <div className="font-medium">{item.artistName}</div>
                      <div className="text-sm text-gray-300">{item.style}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

      case "preferences":
        return (
          <div className="mb-5 space-y-4">
            <h2 className="text-xl font-bold mb-4">Mes préférences de tatouage</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-400 text-white px-4 py-2 font-medium">
                Styles favoris
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {clientPreferences.favoriteStyles.map((style, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-400 text-white px-4 py-2 font-medium">
                Emplacements préférés
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {clientPreferences.preferredLocations.map((location, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-400 text-white px-4 py-2 font-medium">
                Critères importants
              </div>
              <div className="p-4">
                <ul className="divide-y dark:divide-gray-700">
                  {Object.entries(clientPreferences.criteria).map(
                    ([criterion, rating], index) => (
                      <li
                        key={index}
                        className="py-2 flex justify-between items-center"
                      >
                        <span>{criterion}</span>
                        <span className="text-yellow-500">
                          {"⭐".repeat(rating)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        );

      case "followed":
        return (
          <div className="mb-5">
            <h2 className="text-xl font-bold mb-4">
              Tatoueurs suivis ({followedArtists.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="divide-y dark:divide-gray-700">
                {followedArtists.map((artist) => (
                  <div key={artist.id} className="p-4 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                      {artist.name.charAt(0)}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="font-medium">{artist.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Spécialité: {artist.specialty}
                      </div>
                    </div>
                    <button className="px-4 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors">
                      Suivi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="mb-5 space-y-4">
            <h2 className="text-xl font-bold mb-4">À propos</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-400 text-white px-4 py-2 font-medium">
                Informations professionnelles
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expérience</span>
                  <span className="font-medium">{displayUser?.about?.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Studio</span>
                  <span className="font-medium">{displayUser?.about?.studio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Localisation</span>
                  <span className="font-medium">{displayUser?.localisation}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-400 text-white px-4 py-2 font-medium">
                Spécialités
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {displayUser?.about?.specialties?.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-400 text-white px-4 py-2 font-medium">
                Certifications
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {displayUser?.about?.certifications?.map((cert, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case "reviews":
        return (
          <div className="mb-5">
            <h2 className="text-xl font-bold mb-4">Avis clients</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((review) => (
                <div key={review} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        <span className="font-medium mr-2">Client_{review}</span>
                        <div className="text-yellow-500">{"⭐".repeat(5)}</div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Excellent travail ! Très professionnel et à l'écoute. Je recommande vivement.
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Il y a {review} semaine{review > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Obtenir les onglets disponibles selon le type d'utilisateur et si c'est son propre profil
  const getAvailableTabs = () => {
    if (displayUser?.userType === "tatoueur") {
      const tabs = [
        { id: "gallery", label: "Galerie" }
      ];
      
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
          { id: "followed", label: "Tatoueurs suivis" }
        ];
      } else {
        return [
          { id: "gallery", label: "Wishlist" }
        ];
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Utilisateur introuvable</h2>
          <Link to="/" className="text-red-500 hover:text-red-600">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header avec boutons d'action pour son propre profil */}
      {isOwnProfile && (
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
      )}

      {/* Bouton retour pour profil d'un autre utilisateur */}
      {!isOwnProfile && (
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour
          </button>
        </div>
      )}

      {/* Section profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-400 flex items-center justify-center text-white mb-3 overflow-hidden">
            {getProfileImage()}
          </div>
          {isOwnProfile && (
            <button className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold">
            {displayUser.nom || "Utilisateur"}
          </h1>
          {isOwnProfile && (
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Edit size={18} />
            </button>
          )}
        </div>
        
        {displayUser.userType === 'tatoueur' && !isOwnProfile && (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm mb-2">
            Tatoueur vérifié
          </span>
        )}
        
        {/* Bio */}
        <div className="text-center max-w-md mb-4">
          {isOwnProfile && isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-800 dark:text-gray-200"
                rows={3}
                placeholder="Parlez-nous de vous..."
              />
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={handleSaveBio}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sauvegarder
                </button>
                <button 
                  onClick={() => {
                    setIsEditingBio(false);
                    setTempBio(displayUser.bio || "");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-600 dark:text-gray-300">
                {displayUser.bio || "Aucune biographie"}
              </p>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditingBio(true)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📍 {displayUser.localisation || "Non spécifié"}
        </div>

        {/* Statistiques pour les tatoueurs */}
        {displayUser.userType === 'tatoueur' && displayUser.stats && (
          <div className="flex space-x-6 mb-6">
            <div className="text-center">
              <div className="font-bold text-lg">{displayUser.stats.tattoos || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tatouages</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{displayUser.stats.followers || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Abonnés</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{displayUser.stats.following || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Abonnements</div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex space-x-3">
          {isOwnProfile ? (
            <>
              <Link 
                to="/param"
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
            </>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  isFollowing
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {isFollowing ? "Suivi" : "Suivre"}
              </button>
              
              <button className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30 transition-colors flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </button>
              
              <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Styles pour les tatoueurs */}
      {displayUser.userType === 'tatoueur' && displayUser.styles && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <h2 className="text-lg font-semibold">Spécialités</h2>
            {isOwnProfile && (
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Edit size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {displayUser.styles.split(',').map((style, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-400 text-white text-sm rounded-full"
              >
                {style.trim()}
              </span>
            ))}
            {isOwnProfile && (
              <button className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-red-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <Plus size={14} /> Ajouter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto pb-1">
        {getAvailableTabs().map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 mr-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-red-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {getTabContent()}

      {/* Flashs disponibles pour les tatoueurs (affiché en bas) */}
      {displayUser?.userType === 'tatoueur' && activeTab === 'gallery' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">
              {isOwnProfile ? 'Mes flashs disponibles' : 'Flashs disponibles'}
            </h2>
            {isOwnProfile ? (
              <div className="flex gap-2">
                <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors text-sm">
                  <Plus size={16} /> Ajouter
                </button>
                <Link
                  to="/flashs"
                  className="text-red-500 hover:text-red-600 transition-colors text-sm"
                >
                  Gérer tout
                </Link>
              </div>
            ) : (
              <Link
                to={`/flashs/${displayUser._id}`}
                className="text-red-500 hover:text-red-600 transition-colors text-sm"
              >
                Voir tout
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="relative group aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100">
                      ×
                    </button>
                  </div>
                )}
                {!isOwnProfile && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
                      <Heart className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isOwnProfile && (
              <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-red-400 dark:hover:border-red-400 transition-colors cursor-pointer">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Plus size={24} className="mx-auto mb-2" />
                  <span className="text-sm">Nouveau flash</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section avis/témoignages pour les clients */}
      {displayUser?.userType === 'client' && !isOwnProfile && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Avis laissés</h2>
          <div className="space-y-4">
            {[1, 2].map((review) => (
              <div key={review} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                    TA
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Tatoueur_{review}</span>
                      <div className="text-yellow-500">{"⭐".repeat(5)}</div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Client très sympa et à l'écoute ! Très satisfait du rendu final.
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Il y a {review} mois
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section statistiques détaillées pour son propre profil tatoueur */}
      {isOwnProfile && displayUser?.userType === 'tatoueur' && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Mes statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-3">Vues du profil</h3>
              <div className="text-2xl font-bold text-red-500 mb-2">1,248</div>
              <div className="text-sm text-green-600">+15% ce mois</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-3">Demandes de contact</h3>
              <div className="text-2xl font-bold text-red-500 mb-2">73</div>
              <div className="text-sm text-green-600">+23% ce mois</div>
            </div>
          </div>
        </div>
      )}

      {/* Section recommandations pour les clients */}
      {displayUser?.userType === 'client' && isOwnProfile && activeTab === 'followed' && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recommandés pour vous</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((artist) => (
              <div key={artist} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                    TA{artist}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">TattooArtist{artist}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Réalisme</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">125 abonnés</span>
                  <button className="px-3 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors">
                    Suivre
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}