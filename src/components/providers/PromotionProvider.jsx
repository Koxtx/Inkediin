import React from "react";
import { PromotionContext } from "../../context/PromotionContext";
export default function PromotionProvider({ children }) {
  return <PromotionContext.Provider>{children}</PromotionContext.Provider>;
}
