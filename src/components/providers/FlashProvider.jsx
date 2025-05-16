import React from "react";
import { FlashContext } from "../../context/FlashContext";

export default function FlashProvider({ children }) {
  return <FlashContext.Provider>{children}</FlashContext.Provider>;
}
