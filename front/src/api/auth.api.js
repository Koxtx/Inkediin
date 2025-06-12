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
