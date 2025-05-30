import React, { useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const connectedUser = localStorage.getItem("user");
    return connectedUser ? JSON.parse(connectedUser) : null;
  });
  const login = (credentials) => {
    setUser(credentials);
    localStorage.setItem("user", JSON.stringify(credentials));
  };
  const registerUser = (data) => {
    console.log("Register values:", data);
    saveSession(data);
    setConnectedUser(true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
}
