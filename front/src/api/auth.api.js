import { BASE_URL } from "../utils/url";

// ✅ FONCTION AMÉLIORÉE: Normaliser les données utilisateur avec debug
export function normalizeUserData(userData) {
  if (!userData) {
    console.warn("⚠️ normalizeUserData - userData est null/undefined");
    return null;
  }

  console.group("🔄 normalizeUserData - Processing");
  console.log("Input data:", userData);
  console.log("Input keys:", Object.keys(userData));

  // ✅ AMÉLIORATION: Chercher la photo de profil dans tous les champs possibles
  const photoProfil =
    userData.photoProfil ||
    userData.avatar ||
    userData.profilePicture ||
    userData.profileImage ||
    userData.photo ||
    userData.image ||
    userData.picture ||
    null;

  console.log("📷 Photos trouvées:", {
    photoProfil: userData.photoProfil,
    avatar: userData.avatar,
    profilePicture: userData.profilePicture,
    profileImage: userData.profileImage,
    photo: userData.photo,
    image: userData.image,
    picture: userData.picture,
    final: photoProfil,
  });

  const normalized = {
    ...userData,
    // Conserver l'ID original
    _id: userData._id || userData.id,
    id: userData._id || userData.id,

    // ✅ AMÉLIORATION: Photo de profil avec fallback multiple
    photoProfil: photoProfil,

    // Normaliser le nom avec fallback multiple
    nom:
      userData.nom ||
      userData.name ||
      userData.username ||
      userData.displayName ||
      userData.firstName ||
      userData.prenom ||
      "Utilisateur",

    // Autres champs normalisés
    email: userData.email || "",
    userType: userData.userType || userData.type || userData.role || "tatoueur",
    localisation:
      userData.localisation || userData.location || userData.address || "",
    bio: userData.bio || userData.description || userData.about || "",
    styles: userData.styles || userData.specialties || userData.tags || "",

    // Champs additionnels utiles
    phone: userData.phone || userData.telephone || userData.tel || "",
    website: userData.website || userData.site || "",
    instagram: userData.instagram || userData.insta || "",
    createdAt: userData.createdAt || userData.dateCreation || new Date(),
    followers: userData.followers || userData.followersCount || 0,
  };

  console.log("✅ Normalized output:", normalized);
  console.log("📷 Final photo:", normalized.photoProfil);
  console.groupEnd();

  return normalized;
}

// ✅ FONCTION AMÉLIORÉE: Gestion des erreurs d'API avec plus de détails
const handleApiError = (error) => {
  console.error("API Error Details:", {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  throw new Error(error.message || "Erreur lors de la requête");
};

// Fonction pour déterminer l'expérience (existante)
const determineExperience = (createdAt) => {
  if (!createdAt) return "Non spécifié";

  const now = new Date();
  const created = new Date(createdAt);
  const years = (now - created) / (1000 * 60 * 60 * 24 * 365);

  if (years < 1) return "Junior (0-3 ans)";
  if (years < 3) return "Intermédiaire (3-7 ans)";
  return "Expert (7+ ans)";
};

const generateRandomPrice = () => {
  return Math.floor(Math.random() * 400) + 80;
};

const generateRandomRating = () => {
  return Math.round((Math.random() * 2 + 3) * 10) / 10;
};

const getCoordinatesFromLocation = (location) => {
  if (!location) return { lat: 48.8566, lng: 2.3522 };

  const coordinates = {
    Paris: { lat: 48.8566, lng: 2.3522 },
    Lyon: { lat: 45.7578, lng: 4.832 },
    Marseille: { lat: 43.2965, lng: 5.3698 },
    Bordeaux: { lat: 44.8378, lng: -0.5792 },
    Lille: { lat: 50.6292, lng: 3.0573 },
    Toulouse: { lat: 43.6047, lng: 1.4442 },
    Strasbourg: { lat: 48.5734, lng: 7.7521 },
    Nantes: { lat: 47.2184, lng: -1.5536 },
    Montpellier: { lat: 43.611, lng: 3.8767 },
    Nice: { lat: 43.7102, lng: 7.262 },
    Rennes: { lat: 49.7439, lng: -1.6806 },
    Dijon: { lat: 47.322, lng: 5.0415 },
    Angers: { lat: 47.4784, lng: -0.5632 },
    "Saint-Étienne": { lat: 45.4397, lng: 4.3872 },
    "Le Havre": { lat: 49.4944, lng: 0.1079 },
    Grenoble: { lat: 45.1885, lng: 5.7245 },
    Toulon: { lat: 43.1242, lng: 5.928 },
    Annecy: { lat: 45.8992, lng: 6.1294 },
    Metz: { lat: 49.1193, lng: 6.1757 },
    Besançon: { lat: 47.238, lng: 6.0243 },
  };

  if (coordinates[location]) {
    return coordinates[location];
  }

  const locationLower = location.toLowerCase();
  for (const [city, coords] of Object.entries(coordinates)) {
    if (
      city.toLowerCase().includes(locationLower) ||
      locationLower.includes(city.toLowerCase())
    ) {
      return coords;
    }
  }

  return { lat: 48.8566, lng: 2.3522 };
};

// ===== AUTHENTICATION FUNCTIONS =====

// Dans auth.api.js - Fonction signup corrigée
export async function signup(values) {
  try {
    console.log("📤 Signup API call with:", values);

    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
    });

    const data = await response.json();
    console.log("📥 Signup response:", data);

    // Vérifier le statut HTTP
    if (response.ok) {
      // Succès (200-299)
      return {
        success: true,
        message: data.message || "Inscription réussie",
        ...data,
      };
    } else {
      // Erreur HTTP (400-599)
      return {
        success: false,
        message: data.message || "Erreur lors de l'inscription",
      };
    }
  } catch (error) {
    console.error("Erreur réseau lors de l'inscription:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// ✅ CORRECTION: Fonction signin avec normalisation des données améliorée
export async function signin(values) {
  try {
    console.log("📤 Signin API call with:", values);

    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Signin response:", data);

    if (response.ok) {
      // ✅ AMÉLIORATION: Normaliser les données utilisateur avec debug
      const rawUser = data.user || data;
      console.log("👤 Raw user data:", rawUser);

      const normalizedUser = normalizeUserData(rawUser);
      console.log("✅ Normalized user data:", normalizedUser);

      return {
        success: true,
        user: normalizedUser,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la connexion",
      };
    }
  } catch (error) {
    console.error("Erreur réseau lors de la connexion:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// ✅ NOUVEAU: Fonction completeProfile avec support Cloudinary amélioré
export async function completeProfile(profileData) {
  try {
    console.log("📤 API - Envoi completeProfile:", profileData);

    // Créer FormData pour supporter l'upload de fichier
    const formData = new FormData();

    // Ajouter les champs texte
    Object.keys(profileData).forEach((key) => {
      if (
        key !== "photoProfil" &&
        profileData[key] !== null &&
        profileData[key] !== undefined
      ) {
        formData.append(key, profileData[key]);
      }
    });

    // Ajouter le fichier image s'il existe
    if (profileData.photoProfil && profileData.photoProfil instanceof File) {
      formData.append("photoProfil", profileData.photoProfil);
      console.log(
        "📷 API - Fichier photo ajouté:",
        profileData.photoProfil.name
      );
    }

    console.log("📤 API - FormData créée");

    const response = await fetch(`${BASE_URL}/users/completeProfile`, {
      method: "POST",
      body: formData, // ✅ CHANGEMENT: FormData au lieu de JSON
      // ✅ SUPPRESSION: Pas de Content-Type header avec FormData
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 CompleteProfile response:", data);

    if (response.ok) {
      const normalizedUser = normalizeUserData(data);
      return {
        success: true,
        user: normalizedUser,
        message: data.message || "Profil complété avec succès",
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la complétion du profil",
      };
    }
  } catch (error) {
    console.error("Erreur lors de la complétion du profil:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// ✅ AMÉLIORATION: Fonction update avec support Cloudinary et debug
export async function update(values, photoFile = null) {
  try {
    console.log("📤 API - Mise à jour profil:", values);
    console.log("📷 API - Fichier photo:", photoFile);

    // Créer FormData pour supporter l'upload de fichier
    const formData = new FormData();

    // Ajouter les champs utilisateur
    const userFields = [
      "nom",
      "email",
      "localisation",
      "bio",
      "styles",
      "userType",
      "phone",
      "website",
      "instagram",
    ];
    userFields.forEach((field) => {
      if (values[field] !== undefined && values[field] !== null) {
        formData.append(field, values[field]);
      }
    });

    // Ajouter le fichier image s'il existe
    if (photoFile instanceof File) {
      formData.append("photoProfil", photoFile);
      console.log("📷 API - Fichier photo ajouté pour update:", {
        name: photoFile.name,
        size: photoFile.size,
        type: photoFile.type,
      });
    }

    const response = await fetch(`${BASE_URL}/users`, {
      method: "PUT",
      body: formData, // ✅ CHANGEMENT: FormData au lieu de JSON
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const updatedUser = await response.json();
    console.log("📥 Update response:", updatedUser);

    const normalizedUser = normalizeUserData(updatedUser);

    console.log("✅ API - Utilisateur mis à jour:", normalizedUser);
    return normalizedUser;
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    handleApiError(error);
  }
}

// ✅ AMÉLIORATION: Fonction updateAvatar avec support Cloudinary et debug
export async function updateAvatar(photoFile) {
  try {
    console.log("📷 API - Mise à jour avatar:", {
      file: photoFile,
      name: photoFile?.name,
      size: photoFile?.size,
      type: photoFile?.type,
    });

    if (!photoFile || !(photoFile instanceof File)) {
      throw new Error("Fichier image requis");
    }

    // Créer FormData pour l'upload
    const formData = new FormData();
    formData.append("photoProfil", photoFile);

    console.log("📤 API - Upload avatar vers Cloudinary...");

    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const updatedUser = await response.json();
    console.log("📥 UpdateAvatar response:", updatedUser);

    const normalizedUser = normalizeUserData(updatedUser);

    console.log("✅ API - Avatar mis à jour:", normalizedUser.photoProfil);
    return normalizedUser;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    handleApiError(error);
  }
}

// ✅ CORRECTION: getCurrentUser avec normalisation des données améliorée
export async function getCurrentUser() {
  try {
    // Vérifier si on est sur une page publique
    const publicPaths = [
      "/signin",
      "/signup",
      "/forgotpassword",
      "/resetpassword",
    ];
    const isPublicPath = publicPaths.some((path) =>
      window.location.pathname.startsWith(path)
    );

    // Si on est sur une page publique, ne pas faire la requête
    if (isPublicPath) {
      console.log("🚫 getCurrentUser - Page publique, pas de requête");
      return null;
    }

    console.log("📤 getCurrentUser - Récupération utilisateur actuel...");

    const response = await fetch(`${BASE_URL}/users/currentUser`, {
      method: "GET",
      credentials: "include",
    });

    console.log("📡 getCurrentUser - Response status:", response.status);

    if (response.status === 401) {
      // Session expirée ou pas connecté
      console.log("🚫 getCurrentUser - Non authentifié (401)");
      return null;
    }

    if (response.ok) {
      const userData = await response.json();
      console.log("📥 getCurrentUser - Raw data:", userData);

      // ✅ AMÉLIORATION: Normaliser les données utilisateur récupérées
      const normalizedUser = normalizeUserData(userData);
      console.log("✅ getCurrentUser - Normalized data:", normalizedUser);

      return normalizedUser;
    } else {
      console.log(
        `❌ getCurrentUser - Erreur ${response.status}: ${response.statusText}`
      );
      return null;
    }
  } catch (error) {
    console.log("❌ getCurrentUser - Erreur réseau:", error);
    return null;
  }
}

export async function signOut() {
  try {
    console.log("📤 SignOut - Déconnexion...");

    await fetch(`${BASE_URL}/users/deleteToken`, {
      method: "DELETE",
      credentials: "include",
    });

    console.log("✅ SignOut - Déconnexion réussie");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
}

export async function forgotPassword(values) {
  try {
    console.log("📧 Envoi requête forgot password:", values);

    const response = await fetch(`${BASE_URL}/users/forgotPassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    console.log("📡 Status de la réponse:", response.status);

    // Vérifier si la réponse est en JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Réponse non-JSON reçue:", contentType);
      return {
        success: false,
        message: "Erreur serveur: réponse invalide",
      };
    }

    const data = await response.json();
    console.log("📨 Données reçues:", data);

    // Le serveur renvoie toujours un message de succès (même si l'email n'existe pas)
    // pour des raisons de sécurité
    return {
      success: true,
      message:
        data.message || "Si un compte est associé, vous recevrez un mail",
    };
  } catch (error) {
    console.error("💥 Erreur réseau lors de forgot password:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

export async function resetPassword(values) {
  try {
    console.log("🔐 Envoi requête reset password:", values);

    // Adapter les données pour correspondre à ce que le serveur attend
    const requestData = {
      token: values.token,
      password: values.password,
      // Ne pas envoyer confirmPassword au serveur car il ne l'utilise pas
    };

    const response = await fetch(`${BASE_URL}/users/resetPassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("📡 Status de la réponse:", response.status);
    console.log("📡 Response OK:", response.ok);

    // Vérifier si la réponse est en JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Réponse non-JSON reçue:", contentType);
      return {
        success: false,
        message: "Erreur serveur: réponse invalide",
      };
    }

    const data = await response.json();
    console.log("📨 Données reçues:", data);

    if (response.ok) {
      return {
        success: true,
        message:
          data.messageOk ||
          data.message ||
          "Mot de passe réinitialisé avec succès",
        ...data,
      };
    } else {
      return {
        success: false,
        message:
          data.message || "Erreur lors de la réinitialisation du mot de passe",
      };
    }
  } catch (error) {
    console.error("💥 Erreur réseau lors de la réinitialisation:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

export async function changePassword(values) {
  try {
    console.log("📤 ChangePassword API call");

    const response = await fetch(`${BASE_URL}/users/changePassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          errorData.message || "Erreur lors du changement de mot de passe",
      };
    }

    const data = await response.json();
    console.log("📥 ChangePassword response:", data);

    return {
      success: true,
      message: data.message || "Mot de passe modifié avec succès",
      ...data,
    };
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// ===== USER DATA FUNCTIONS =====

export async function getTattooers() {
  try {
    console.log("📤 getTattooers - Récupération des tatoueurs...");

    const response = await fetch(`${BASE_URL}/users/tattooers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📥 getTattooers - Données reçues du backend:", data);

    const transformedArtists = data.map((user) => {
      console.log("🔄 Transformation tatoueur:", {
        id: user._id,
        nom: user.nom,
        photoProfil: user.photoProfil,
        avatar: user.avatar,
      });

      const coordinates = getCoordinatesFromLocation(user.localisation);

      return {
        _id: user._id,
        name: user.nom || "Nom non renseigné",
        category: user.styles
          ? user.styles.split(",")[0].trim()
          : "Non spécifié",
        location: user.localisation || "Non renseigné",
        experience: determineExperience(user.createdAt),
        price: generateRandomPrice(),
        rating: generateRandomRating(),
        availability: Math.random() > 0.3 ? "Disponible" : "Complet",
        avatar:
          user.photoProfil ||
          user.avatar ||
          user.profilePicture ||
          "/api/placeholder/150/150", // ✅ AMÉLIORATION: Fallback multiple
        portfolio: user.portfolio?.[0] || "/api/placeholder/400/300",
        bio: user.bio || "",
        styles: user.styles || "",
        followers: user.followers || 0,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        distance: 0,
        createdAt: user.createdAt,
        email: user.email,
      };
    });

    console.log("✅ getTattooers - Artistes transformés:", transformedArtists);

    return {
      success: true,
      data: transformedArtists,
      count: transformedArtists.length,
    };
  } catch (error) {
    console.error(
      "❌ getTattooers - Erreur lors de la récupération des artistes:",
      error
    );
    return {
      success: false,
      message:
        error.message ||
        "Impossible de charger les artistes. Veuillez réessayer.",
      data: [],
    };
  }
}

export async function getTattooerById(id) {
  try {
    console.log("🔍 API - Récupération utilisateur ID:", id);

    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("📡 API Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const user = await response.json();
    console.log("📥 API - Données brutes reçues:", user);

    const transformedUser = normalizeUserData({
      ...user,
      nom: user.nom || user.name || user.username || "Utilisateur",
      email: user.email,
      userType: user.userType || user.type || "tatoueur",
      photoProfil:
        user.photoProfil || user.avatar || user.profilePicture || null,
      bio: user.bio || user.description || "",
      localisation: user.localisation || user.location || user.address || "",
      styles: user.styles || user.specialties || "",
      portfolio: user.portfolio || user.images || [],
      followers: user.followers || 0,
      following: user.following || 0,
      phone: user.phone || user.telephone || "",
      website: user.website || "",
      instagram: user.instagram || "",
      experience: user.experience || "",
      studio: user.studio || "",
    });

    console.log("✅ API - Données transformées:", transformedUser);

    return {
      success: true,
      data: transformedUser,
      message: "Utilisateur récupéré avec succès",
    };
  } catch (error) {
    console.error(
      "❌ API - Erreur lors de la récupération du tatoueur:",
      error
    );
    return {
      success: false,
      message: error.message || "Impossible de charger le tatoueur.",
      data: null,
    };
  }
}

export async function getUserById(id) {
  try {
    console.log("🔍 API - Récupération utilisateur (générique) ID:", id);

    const response = await fetch(`${BASE_URL}/users/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const user = await response.json();
    console.log("📥 API - Données utilisateur reçues:", user);

    return {
      success: true,
      data: normalizeUserData(user),
      message: "Utilisateur récupéré avec succès",
    };
  } catch (error) {
    console.error(
      "❌ API - Erreur lors de la récupération de l'utilisateur:",
      error
    );
    return {
      success: false,
      message: error.message || "Impossible de charger l'utilisateur.",
      data: null,
    };
  }
}

export async function searchTattooers(filters = {}) {
  try {
    console.log("📤 searchTattooers - Recherche avec filtres:", filters);

    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.append("search", filters.search);
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.styles) queryParams.append("styles", filters.styles);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

    const url = `${BASE_URL}/users/tattooers/search?${queryParams.toString()}`;
    console.log("🔗 searchTattooers - URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📥 searchTattooers - Résultats:", data);

    const transformedArtists = data.map((user) => {
      const coordinates = getCoordinatesFromLocation(user.localisation);

      return {
        _id: user._id,
        name: user.nom || "Nom non renseigné",
        category: user.styles
          ? user.styles.split(",")[0].trim()
          : "Non spécifié",
        location: user.localisation || "Non renseigné",
        experience: determineExperience(user.createdAt),
        price: generateRandomPrice(),
        rating: generateRandomRating(),
        availability: Math.random() > 0.3 ? "Disponible" : "Complet",
        avatar:
          user.photoProfil ||
          user.avatar ||
          user.profilePicture ||
          "/api/placeholder/150/150", // ✅ AMÉLIORATION
        portfolio: user.portfolio?.[0] || "/api/placeholder/400/300",
        bio: user.bio || "",
        styles: user.styles || "",
        followers: user.followers || 0,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        distance: 0,
        createdAt: user.createdAt,
        email: user.email,
      };
    });

    return {
      success: true,
      data: transformedArtists,
      count: transformedArtists.length,
    };
  } catch (error) {
    console.error("❌ searchTattooers - Erreur lors de la recherche:", error);
    return {
      success: false,
      message: error.message || "Erreur lors de la recherche.",
      data: [],
    };
  }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// ===== FOLLOW SYSTEM FUNCTIONS =====

// ✅ FONCTION UNIQUE: Suivre un utilisateur
export async function followUser(userId) {
  try {
    console.log("📤 API - Suivi utilisateur:", userId);

    const response = await fetch(`${BASE_URL}/users/${userId}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Follow response:", data);

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Utilisateur suivi avec succès",
        isFollowing: true,
        followersCount: data.followersCount
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors du suivi",
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors du suivi:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// Ne plus suivre un utilisateur
export async function unfollowUser(userId) {
  try {
    console.log("📤 API - Arrêt du suivi utilisateur:", userId);

    const response = await fetch(`${BASE_URL}/users/${userId}/unfollow`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Unfollow response:", data);

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Vous ne suivez plus cet utilisateur",
        isFollowing: false,
        followersCount: data.followersCount
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de l'arrêt du suivi",
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt du suivi:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// Vérifier si on suit un utilisateur
export async function checkIfFollowing(userId) {
  try {
    console.log("📤 API - Vérification suivi utilisateur:", userId);

    const response = await fetch(`${BASE_URL}/users/${userId}/is-following`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Check following response:", data);

    if (response.ok) {
      return {
        success: true,
        isFollowing: data.isFollowing,
        followersCount: data.followersCount
      };
    } else {
      return {
        success: false,
        isFollowing: false,
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du suivi:", error);
    return {
      success: false,
      isFollowing: false,
    };
  }
}

// Obtenir la liste des utilisateurs suivis
export async function getFollowedUsers() {
  try {
    console.log("📤 API - Récupération des utilisateurs suivis");

    const response = await fetch(`${BASE_URL}/users/following`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Following list response:", data);

    if (response.ok) {
      // Normaliser les données des utilisateurs suivis
      const normalizedFollowing = data.following?.map(user => normalizeUserData(user)) || [];
      
      return {
        success: true,
        data: normalizedFollowing,
        count: data.count || normalizedFollowing.length
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la récupération",
        data: []
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des suivis:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
      data: []
    };
  }
}

// Obtenir la liste des followers
export async function getFollowers(userId = null) {
  try {
    const url = userId 
      ? `${BASE_URL}/users/${userId}/followers`
      : `${BASE_URL}/users/followers`;
    
    console.log("📤 API - Récupération des followers:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Followers list response:", data);

    if (response.ok) {
      // Normaliser les données des followers
      const normalizedFollowers = data.followers?.map(user => normalizeUserData(user)) || [];
      
      return {
        success: true,
        data: normalizedFollowers,
        count: data.count || normalizedFollowers.length
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la récupération",
        data: []
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des followers:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
      data: []
    };
  }
}

// Obtenir des suggestions de tatoueurs (utilise votre endpoint existant)
export async function getSuggestedTattooers(filters = {}) {
  try {
    console.log("📤 API - Récupération suggestions tatoueurs:", filters);

    const queryParams = new URLSearchParams();
    
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.styles) queryParams.append("styles", filters.styles);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const url = `${BASE_URL}/users/suggestions/tattooers?${queryParams.toString()}`;
    console.log("🔗 Suggestions URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Suggestions response:", data);

    if (response.ok) {
      // Transformer les données pour correspondre au format attendu
      const transformedSuggestions = data.suggestions?.map((artist) => {
        return {
          id: artist._id,
          _id: artist._id,
          name: artist.nom || "Nom non renseigné",
          specialty: artist.styles ? artist.styles.split(",")[0].trim() : "Non spécifié",
          location: artist.localisation || "Non renseigné",
          rating: artist.rating || (4.0 + Math.random() * 1.0), // Rating simulé si pas présent
          followersCount: artist.followersCount || 0,
          distance: artist.distance || "Non calculé",
          profileImage: artist.photoProfil || artist.avatar,
          recentWork: artist.recentWork || "Travail récent",
          matchReason: artist.matchReason || "Recommandé pour vous",
          verified: artist.verified || Math.random() > 0.5,
          bio: artist.bio || "",
          styles: artist.styles || "",
          experience: determineExperience(artist.createdAt),
          photoProfil: artist.photoProfil,
          localisation: artist.localisation,
        };
      }) || [];

      return {
        success: true,
        data: transformedSuggestions,
        count: data.count || transformedSuggestions.length,
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la récupération des suggestions",
        data: [],
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des suggestions:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
      data: [],
    };
  }
}

// ===== WISHLIST SYSTEM FUNCTIONS =====
export async function getSavedContent(filters = {}) {
  try {
    const { type = 'all', page = 1, limit = 10 } = filters;
    
    console.log('📤 API - Récupération contenu sauvegardé:', { type, page, limit });

    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${BASE_URL}/users/saved-content?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 Contenu sauvegardé response:', data);

    if (response.ok) {
      return {
        success: true,
        data: data.content || [],
        count: data.count || 0,
        totalSaved: data.totalSaved || 0,
        stats: data.stats || {},
        pagination: {
          page: data.page,
          limit: data.limit,
          hasMore: data.hasMore
        }
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur lors de la récupération',
        data: []
      };
    }
  } catch (error) {
    console.error('❌ Erreur getSavedContent:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur',
      data: []
    };
  }
}

// Récupérer uniquement les posts sauvegardés
export async function getSavedPosts(page = 1, limit = 10) {
  try {
    console.log('📤 API - Récupération posts sauvegardés:', { page, limit });

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${BASE_URL}/users/saved-posts?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 Posts sauvegardés response:', data);

    if (response.ok) {
      return {
        success: true,
        data: data.savedPosts || [],
        count: data.count || 0,
        totalSaved: data.totalSaved || 0,
        pagination: {
          page: data.page,
          limit: data.limit,
          hasMore: data.hasMore
        }
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur lors de la récupération des posts',
        data: []
      };
    }
  } catch (error) {
    console.error('❌ Erreur getSavedPosts:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur',
      data: []
    };
  }
}

// Récupérer uniquement les flashs sauvegardés
export async function getSavedFlashs(page = 1, limit = 12) {
  try {
    console.log('📤 API - Récupération flashs sauvegardés:', { page, limit });

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${BASE_URL}/users/saved-flashs?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 Flashs sauvegardés response:', data);

    if (response.ok) {
      return {
        success: true,
        data: data.savedFlashs || [],
        count: data.count || 0,
        totalSaved: data.totalSaved || 0,
        pagination: {
          page: data.page,
          limit: data.limit,
          hasMore: data.hasMore
        }
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur lors de la récupération des flashs',
        data: []
      };
    }
  } catch (error) {
    console.error('❌ Erreur getSavedFlashs:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur',
      data: []
    };
  }
}

// Sauvegarder/désauvegarder un post
export async function toggleSavePost(postId) {
  try {
    console.log('📤 API - Toggle save post:', postId);

    const response = await fetch(`${BASE_URL}/users/posts/${postId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 Toggle save post response:', data);

    if (response.ok) {
      return {
        success: true,
        saved: data.saved,
        action: data.action,
        message: data.message,
        totalSaved: data.totalSaved
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur lors de la sauvegarde du post'
      };
    }
  } catch (error) {
    console.error('❌ Erreur toggleSavePost:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur'
    };
  }
}

// Sauvegarder/désauvegarder un flash
export async function toggleSaveFlash(flashId) {
  try {
    console.log('📤 API - Toggle save flash:', flashId);

    const response = await fetch(`${BASE_URL}/users/flashs/${flashId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 Toggle save flash response:', data);

    if (response.ok) {
      return {
        success: true,
        saved: data.saved,
        action: data.action,
        message: data.message,
        totalSaved: data.totalSaved
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur lors de la sauvegarde du flash'
      };
    }
  } catch (error) {
    console.error('❌ Erreur toggleSaveFlash:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur'
    };
  }
}

// Vérifier si un post est sauvegardé
export async function checkPostSaved(postId) {
  try {
    console.log('📤 API - Vérification post sauvegardé:', postId);

    const response = await fetch(`${BASE_URL}/users/posts/${postId}/saved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 Check post saved response:', data);

    if (response.ok) {
      return {
        success: true,
        saved: data.saved,
        postId: data.postId
      };
    } else {
      return {
        success: false,
        saved: false
      };
    }
  } catch (error) {
    console.error('❌ Erreur checkPostSaved:', error);
    return {
      success: false,
      saved: false
    };
  }
}

// Vérifier si un flash est sauvegardé
export async function checkFlashSaved(flashId) {
  try {
    console.log('📤 API - Vérification flash sauvegardé:', flashId);

    const response = await fetch(`${BASE_URL}/users/flashs/${flashId}/saved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 Check flash saved response:', data);

    if (response.ok) {
      return {
        success: true,
        saved: data.saved,
        flashId: data.flashId
      };
    } else {
      return {
        success: false,
        saved: false
      };
    }
  } catch (error) {
    console.error('❌ Erreur checkFlashSaved:', error);
    return {
      success: false,
      saved: false
    };
  }
}

// Récupérer le contenu sauvegardé d'un autre utilisateur (si public)
export async function getUserSavedContent(userId, filters = {}) {
  try {
    const { type = 'all', page = 1, limit = 10 } = filters;
    
    console.log('📤 API - Récupération contenu sauvegardé utilisateur:', userId);

    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${BASE_URL}/users/${userId}/saved-content?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📥 User saved content response:', data);

    if (response.ok) {
      return {
        success: true,
        data: data.content || [],
        count: data.count || 0,
        totalSaved: data.totalSaved || 0,
        isOwnContent: data.isOwnContent || false,
        stats: data.stats || {},
        pagination: {
          page: data.page,
          limit: data.limit,
          hasMore: data.hasMore
        }
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur lors de la récupération',
        data: []
      };
    }
  } catch (error) {
    console.error('❌ Erreur getUserSavedContent:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur',
      data: []
    };
  }
}

// ===== PREFERENCES SYSTEM FUNCTIONS =====

// Obtenir les préférences de l'utilisateur
export async function getUserPreferences() {
  try {
    console.log("📤 API - Récupération des préférences utilisateur");

    const response = await fetch(`${BASE_URL}/users/preferences`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 GetPreferences response:", data);

    if (response.ok) {
      return {
        success: true,
        data: data.preferences || data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la récupération des préférences",
        data: null,
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des préférences:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
      data: null,
    };
  }
}

// Enregistrer les préférences de l'utilisateur
export async function updateUserPreferences(preferences) {
  try {
    console.log("📤 API - Mise à jour des préférences:", preferences);

    const response = await fetch(`${BASE_URL}/users/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 UpdatePreferences response:", data);

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Préférences mises à jour",
        data: data.preferences || data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la mise à jour des préférences",
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des préférences:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// ===== RECOMMENDATION SYSTEM FUNCTIONS =====

// Obtenir des recommandations d'artistes pour un client
export async function getArtistRecommendations(filters = {}) {
  // Utilise la même fonction que getSuggestedTattooers mais avec des filtres plus spécifiques
  return await getSuggestedTattooers({
    ...filters,
    limit: filters.limit || 8
  });
}

// Marquer une interaction avec une recommandation
export async function markRecommendationInteraction(artistId, interactionType) {
  try {
    console.log("📤 API - Interaction recommandation:", artistId, interactionType);

    const response = await fetch(`${BASE_URL}/users/recommendations/interaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artistId,
        interactionType, // 'view', 'like', 'follow', 'contact'
      }),
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 RecommendationInteraction response:", data);

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Interaction enregistrée",
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de l'enregistrement de l'interaction",
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'interaction recommandation:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}

// ===== SEARCH & DISCOVERY FUNCTIONS =====

// Recherche avancée d'artistes avec filtres
export async function searchArtistsAdvanced(searchParams) {
  try {
    console.log("📤 API - Recherche avancée d'artistes:", searchParams);

    const queryParams = new URLSearchParams();
    
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        queryParams.append(key, searchParams[key]);
      }
    });

    const url = `${BASE_URL}/users/artists/search-advanced?${queryParams.toString()}`;
    console.log("🔗 Advanced search URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Advanced search response:", data);

    if (response.ok) {
      const transformedArtists = data.map((user) => {
        const coordinates = getCoordinatesFromLocation(user.localisation);

        return {
          _id: user._id,
          name: user.nom || "Nom non renseigné",
          category: user.styles ? user.styles.split(",")[0].trim() : "Non spécifié",
          location: user.localisation || "Non renseigné",
          experience: determineExperience(user.createdAt),
          price: generateRandomPrice(),
          rating: generateRandomRating(),
          availability: Math.random() > 0.3 ? "Disponible" : "Complet",
          avatar: user.photoProfil || user.avatar || user.profilePicture || "/api/placeholder/150/150",
          portfolio: user.portfolio?.[0] || "/api/placeholder/400/300",
          bio: user.bio || "",
          styles: user.styles || "",
          followers: user.followers || 0,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          distance: user.distance || 0,
          createdAt: user.createdAt,
          email: user.email,
        };
      });

      return {
        success: true,
        data: transformedArtists,
        count: transformedArtists.length,
        filters: data.appliedFilters || {},
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la recherche",
        data: [],
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la recherche avancée:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
      data: [],
    };
  }
}

// Obtenir les artistes populaires/tendances
export async function getTrendingArtists(limit = 10) {
  try {
    console.log("📤 API - Récupération artistes tendances");

    const response = await fetch(`${BASE_URL}/users/artists/trending?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("📥 Trending artists response:", data);

    if (response.ok) {
      const transformedArtists = data.map((user) => {
        const coordinates = getCoordinatesFromLocation(user.localisation);

        return {
          _id: user._id,
          name: user.nom || "Nom non renseigné",
          category: user.styles ? user.styles.split(",")[0].trim() : "Non spécifié",
          location: user.localisation || "Non renseigné",
          experience: determineExperience(user.createdAt),
          price: generateRandomPrice(),
          rating: generateRandomRating(),
          availability: Math.random() > 0.3 ? "Disponible" : "Complet",
          avatar: user.photoProfil || user.avatar || "/api/placeholder/150/150",
          portfolio: user.portfolio?.[0] || "/api/placeholder/400/300",
          bio: user.bio || "",
          styles: user.styles || "",
          followers: user.followers || 0,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          distance: 0,
          createdAt: user.createdAt,
          email: user.email,
          trendingScore: user.trendingScore || Math.random() * 100,
        };
      });

      return {
        success: true,
        data: transformedArtists,
        count: transformedArtists.length,
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de la récupération des artistes tendances",
        data: [],
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des artistes tendances:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
      data: [],
    };
  }
}