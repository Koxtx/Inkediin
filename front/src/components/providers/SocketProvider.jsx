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

      // Essayer plusieurs noms de cookies possibles
      const token =
        getCookie("token") ||
        getCookie("authToken") ||
        getCookie("jwt") ||
        getCookie("accessToken");

      if (!token) {
        console.error("❌ Token non trouvé pour WebSocket");

        return;
      }

      // Créer la connexion socket avec le token
      const newSocket = io(
        import.meta.env.VITE_SERVER_URL , 
        {
          auth: {
            token: token,
          },
          withCredentials: true,
          transports: ["websocket", "polling"],
          timeout: 10000,
          forceNew: true,
        }
      );

      // Gestion des événements de connexion
      newSocket.on("connect", () => {
        setSocket(newSocket);

        // Rejoindre la room des notifications
        newSocket.emit("joinNotificationRoom");
      });

      newSocket.on("disconnect", (reason) => {
        setSocket(null);
      });

      // Gestion des erreurs de connexion
      newSocket.on("connect_error", (error) => {
        console.error("❌ Erreur connexion WebSocket:", error.message);
      });

      // Écouter les utilisateurs en ligne
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // Nettoyer lors du démontage
      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  // Fonction utilitaire pour tester la connexion WebSocket
  const testConnection = () => {
    if (socket && socket.connected) {
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
