// src/components/promotion/PromotionTabs.js
import React, { useContext } from "react";
import { PromotionContext } from "../../../context/PromotionContext";

export default function PromotionTabs() {
  const { activeTab, handleTabChange } = useContext(PromotionContext);

  return (
    <div className="flex mb-5 border-b dark:border-gray-700">
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === "creation"
            ? "text-red-500 border-b-2 border-red-500"
            : "text-gray-500 dark:text-gray-400 hover:text-red-500"
        }`}
        onClick={() => handleTabChange("creation")}
      >
        Création
      </button>
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === "historique"
            ? "text-red-500 border-b-2 border-red-500"
            : "text-gray-500 dark:text-gray-400 hover:text-red-500"
        }`}
        onClick={() => handleTabChange("historique")}
      >
        Historique
      </button>
    </div>
  );
}
