import React from "react";
import { MessagerieContext } from "../../context/MessagerieContext";

export default function MessagerieProvider({ children }) {
  return <MessagerieContext.Provider>{children}</MessagerieContext.Provider>;
}
