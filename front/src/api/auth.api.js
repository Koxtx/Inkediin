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

// ✅ FONCTIONS TATOUEURS AMÉLIORÉES avec meilleure gestion des avatars
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

    const response = await fetch(`${BASE_URL}/users/${id}`, {
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
