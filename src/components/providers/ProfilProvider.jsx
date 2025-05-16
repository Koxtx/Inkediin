import React from "react";
import { ProfilContext } from "../../context/ProfilContext";

export default function ProfilProvider({ children }) {
  return <ProfilContext.Provider>{children}</ProfilContext.Provider>;
}
