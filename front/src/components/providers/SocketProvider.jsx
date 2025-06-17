import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";




export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      console.log("🔌 Connexion WebSocket pour utilisateur:", user._id);

      // Fonction pour récupérer le token depuis les cookies - améliorée
      const getCookie = (name) => {
        if (typeof document === "undefined") return null;

        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const cookieValue = parts.pop().split(";").shift();
          return decodeURIComponent(cookieValue);
        }
        return null;
      };

      // Fonction de debug pour les cookies
      const debugCookies = () => {
        console.log("🍪 Debug cookies:");
        console.log("- Document cookie:", document.cookie);
        console.log("- Token:", getCookie("token"));
        console.log("- AuthToken:", getCookie("authToken"));
        console.log("- JWT:", getCookie("jwt"));
        console.log("- AccessToken:", getCookie("accessToken"));
      };

      // Debug des cookies
      debugCookies();

      // Essayer plusieurs noms de cookies possibles
      const token =
        getCookie("token") ||
        getCookie("authToken") ||
        getCookie("jwt") ||
        getCookie("accessToken");

      if (!token) {
        console.error("❌ Token non trouvé pour WebSocket");
        console.log("🔍 Vérifiez que le token est bien défini lors de la connexion");
        console.log("📝 Cookies disponibles:", document.cookie);
        return;
      }

      console.log("✅ Token trouvé pour WebSocket:", token.substring(0, 20) + "...");

      // Créer la connexion socket avec le token
      const newSocket = io(
        import.meta.env.VITE_SERVER_URL || "http://localhost:3000", // Changé pour port 3000
        {
          auth: {
            token: token,
          },
          withCredentials: true,
          transports: ["websocket", "polling"], // Permettre plusieurs transports
          timeout: 10000, // Timeout de 10 secondes
          forceNew: true, // Forcer une nouvelle connexion
        }
      );

      // Gestion des événements de connexion
      newSocket.on("connect", () => {
        console.log("✅ WebSocket connecté:", newSocket.id);
        setSocket(newSocket);

        // Rejoindre la room des notifications
        newSocket.emit("joinNotificationRoom");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ WebSocket déconnecté:", reason);
        setSocket(null);
      });

      // Gestion des erreurs de connexion
      newSocket.on("connect_error", (error) => {
        console.error("❌ Erreur connexion WebSocket:", error.message);
        console.log("🔍 Vérifiez:");
        console.log("- Le serveur WebSocket est-il démarré ?");
        console.log("- Le token est-il valide ?");
        console.log("- La configuration CORS côté serveur");
      });

      // Événement d'authentification réussie
      newSocket.on("authenticated", () => {
        console.log("🔐 WebSocket authentifié avec succès");
      });

      // Écouter les utilisateurs en ligne
      newSocket.on("getOnlineUsers", (users) => {
        console.log("👥 Utilisateurs en ligne:", users);
        setOnlineUsers(users);
      });

      // Test de connexion après 2 secondes
      setTimeout(() => {
        if (newSocket.connected) {
          console.log("✅ WebSocket connecté et fonctionnel");
        } else {
          console.warn("⚠️ WebSocket non connecté après 2 secondes");
        }
      }, 2000);

      // Nettoyer lors du démontage
      return () => {
        console.log("🔌 Fermeture connexion WebSocket");
        newSocket.close();
      };
    } else {
      // Si pas d'utilisateur, fermer la connexion
      if (socket) {
        console.log("🔌 Fermeture WebSocket (déconnexion utilisateur)");
        socket.close();
        setSocket(null);
      }
    }
  }, [user]); // Retiré socket des dépendances pour éviter les boucles

  // Fonction utilitaire pour tester la connexion WebSocket
  const testConnection = () => {
    if (socket && socket.connected) {
      console.log("✅ WebSocket connecté");
      socket.emit("test", { message: "Test de connexion" });
      return true;
    } else {
      console.warn("❌ WebSocket non connecté");
      return false;
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, testConnection }}>
      {children}
    </SocketContext.Provider>
  );
};