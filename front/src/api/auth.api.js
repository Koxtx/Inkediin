import { BASE_URL } from "../utils/url";

// Dans auth.api.js - Fonction signup corrigée
export async function signup(values) {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
    });

    const data = await response.json();

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

// Fonction signin également corrigée pour cohérence
export async function signin(values) {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      // Succès de la connexion
      return {
        success: true,
        user: data.user || data,
        message: data.message,
      };
    } else {
      // Erreur de connexion
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

export async function completeProfile(profileData) {
  try {
    const response = await fetch(`${BASE_URL}/users/completeProfile`, {
      method: "POST",
      body: JSON.stringify(profileData),
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include", // Important pour envoyer les cookies
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        user: data,
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

// CORRECTION IMPORTANTE : Ajouter credentials: "include"
export async function update(values) {
  const user = {
    _id: values._id,
    email: values.email,
    nom: values.nom,
    userType: values.userType,
    localisation: values.localisation,
    bio: values.bio,
    styles: values.styles,
    portfolio: values.portfolio,
    followers: values.followers,
  };
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "PUT",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include", // AJOUT IMPORTANT
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    throw error; // Relancer l'erreur pour la gestion dans le composant
  }
}

export async function updateAvatar(values) {
  try {
    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include", // AJOUT IMPORTANT
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedUserAvatar = await response.json();
    return updatedUserAvatar;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    throw error;
  }
}

// Dans auth.api.js - Fonction getCurrentUser optimisée
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
      return null;
    }

    const response = await fetch(`${BASE_URL}/users/currentUser`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      // Session expirée ou pas connecté
      return null;
    }

    if (response.ok) {
      return await response.json();
    } else {
      console.log(`Erreur ${response.status}: ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.log("Erreur réseau:", error);
    return null;
  }
}

export async function signOut() {
  try {
    await fetch(`${BASE_URL}/users/deleteToken`, {
      method: "DELETE",
      credentials: "include",
    });
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
    const response = await fetch(`${BASE_URL}/users/changePassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      credentials: "include", // AJOUT IMPORTANT
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

const determineExperience = (createdAt) => {
  if (!createdAt) return "Non spécifié";
  
  const now = new Date();
  const created = new Date(createdAt);
  const years = (now - created) / (1000 * 60 * 60 * 24 * 365);
  
  if (years < 1) return "Junior (0-3 ans)";
  if (years < 3) return "Intermédiaire (3-7 ans)";
  return "Expert (7+ ans)";
};

// Fonction pour générer un prix aléatoire (temporaire)
const generateRandomPrice = () => {
  return Math.floor(Math.random() * 400) + 80; // Entre 80 et 480€
};

// Fonction pour générer une note aléatoire (temporaire)
const generateRandomRating = () => {
  return Math.round((Math.random() * 2 + 3) * 10) / 10; // Entre 3.0 et 5.0
};

// Fonction pour obtenir les coordonnées approximatives d'une ville
const getCoordinatesFromLocation = (location) => {
  if (!location) return { lat: 48.8566, lng: 2.3522 }; // Paris par défaut
  
  const coordinates = {
    "Paris": { lat: 48.8566, lng: 2.3522 },
    "Lyon": { lat: 45.7578, lng: 4.832 },
    "Marseille": { lat: 43.2965, lng: 5.3698 },
    "Bordeaux": { lat: 44.8378, lng: -0.5792 },
    "Lille": { lat: 50.6292, lng: 3.0573 },
    "Toulouse": { lat: 43.6047, lng: 1.4442 },
    "Strasbourg": { lat: 48.5734, lng: 7.7521 },
    "Nantes": { lat: 47.2184, lng: -1.5536 },
    "Montpellier": { lat: 43.6110, lng: 3.8767 },
    "Nice": { lat: 43.7102, lng: 7.2620 },
    "Rennes": { lat: 49.7439, lng: -1.6806 },
    "Dijon": { lat: 47.3220, lng: 5.0415 },
    "Angers": { lat: 47.4784, lng: -0.5632 },
    "Saint-Étienne": { lat: 45.4397, lng: 4.3872 },
    "Le Havre": { lat: 49.4944, lng: 0.1079 },
    "Grenoble": { lat: 45.1885, lng: 5.7245 },
    "Toulon": { lat: 43.1242, lng: 5.9280 },
    "Annecy": { lat: 45.8992, lng: 6.1294 },
    "Metz": { lat: 49.1193, lng: 6.1757 },
    "Besançon": { lat: 47.2380, lng: 6.0243 }
  };
  
  // Recherche exacte d'abord
  if (coordinates[location]) {
    return coordinates[location];
  }
  
  // Recherche approximative (contient)
  const locationLower = location.toLowerCase();
  for (const [city, coords] of Object.entries(coordinates)) {
    if (city.toLowerCase().includes(locationLower) || locationLower.includes(city.toLowerCase())) {
      return coords;
    }
  }
  
  return { lat: 48.8566, lng: 2.3522 }; // Paris par défaut
};

// Fonction principale pour récupérer les tatoueurs
export async function getTattooers() {
  try {
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
    console.log("Données reçues du backend:", data);
    
    // Transformer les données du backend pour correspondre à l'interface
    const transformedArtists = data.map(user => {
      const coordinates = getCoordinatesFromLocation(user.localisation);
      
      return {
        _id: user._id,
        name: user.nom || "Nom non renseigné",
        category: user.styles ? user.styles.split(',')[0].trim() : "Non spécifié",
        location: user.localisation || "Non renseigné",
        experience: determineExperience(user.createdAt),
        price: generateRandomPrice(), // À remplacer par vraies données quand disponibles
        rating: generateRandomRating(), // À remplacer par vraies données quand disponibles
        availability: Math.random() > 0.3 ? "Disponible" : "Complet", // À remplacer par vraies données
        avatar: user.avatar || "/api/placeholder/150/150",
        portfolio: user.portfolio?.[0] || "/api/placeholder/400/300",
        bio: user.bio || "",
        styles: user.styles || "",
        followers: user.followers || 0,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        distance: 0,
        createdAt: user.createdAt,
        email: user.email, // Utile pour le contact
      };
    });

    console.log("Artistes transformés:", transformedArtists);
    
    return {
      success: true,
      data: transformedArtists,
      count: transformedArtists.length
    };
    
  } catch (error) {
    console.error("Erreur lors de la récupération des artistes:", error);
    return {
      success: false,
      message: error.message || "Impossible de charger les artistes. Veuillez réessayer.",
      data: []
    };
  }
}

// Fonction pour récupérer un tatoueur spécifique par ID
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
    
    // Normalisation des données pour assurer la cohérence
    const transformedUser = {
      _id: user._id || user.id,
      nom: user.nom || user.name || user.username || "Utilisateur",
      email: user.email,
      userType: user.userType || user.type || "tatoueur",
      photoProfil: user.photoProfil || user.avatar || user.profilePicture || null,
      bio: user.bio || user.description || "",
      localisation: user.localisation || user.location || user.address || "",
      styles: user.styles || user.specialties || "",
      portfolio: user.portfolio || user.images || [],
      followers: user.followers || 0,
      following: user.following || 0,
      // Ajout de champs supplémentaires s'ils existent
      phone: user.phone || user.telephone || "",
      website: user.website || "",
      instagram: user.instagram || "",
      experience: user.experience || "",
      studio: user.studio || "",
    };

    console.log("✅ API - Données transformées:", transformedUser);

    return {
      success: true,
      data: transformedUser,
      message: "Utilisateur récupéré avec succès"
    };
    
  } catch (error) {
    console.error("❌ API - Erreur lors de la récupération du tatoueur:", error);
    return {
      success: false,
      message: error.message || "Impossible de charger le tatoueur.",
      data: null
    };
  }
}

// Fonction alternative si vous avez besoin de récupérer n'importe quel type d'utilisateur
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
      data: user,
      message: "Utilisateur récupéré avec succès"
    };
    
  } catch (error) {
    console.error("❌ API - Erreur lors de la récupération de l'utilisateur:", error);
    return {
      success: false,
      message: error.message || "Impossible de charger l'utilisateur.",
      data: null
    };
  }
}

// Fonction pour rechercher des tatoueurs avec filtres
export async function searchTattooers(filters = {}) {
  try {
    // Construire les paramètres de requête
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.styles) queryParams.append('styles', filters.styles);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    
    const url = `${BASE_URL}/users/tattooers/search?${queryParams.toString()}`;
    
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
    
    // Transformer les données
    const transformedArtists = data.map(user => {
      const coordinates = getCoordinatesFromLocation(user.localisation);
      
      return {
        _id: user._id,
        name: user.nom || "Nom non renseigné",
        category: user.styles ? user.styles.split(',')[0].trim() : "Non spécifié",
        location: user.localisation || "Non renseigné",
        experience: determineExperience(user.createdAt),
        price: generateRandomPrice(),
        rating: generateRandomRating(),
        availability: Math.random() > 0.3 ? "Disponible" : "Complet",
        avatar: user.avatar || "/api/placeholder/150/150",
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
      count: transformedArtists.length
    };
    
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return {
      success: false,
      message: error.message || "Erreur lors de la recherche.",
      data: []
    };
  }
}

// Fonction utilitaire pour calculer la distance entre deux points GPS
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en km
  return distance;
}