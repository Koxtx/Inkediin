import React, { useContext } from "react";
import PromotionTabs from "./components/PromotionTabs";
import PromotionForm from "./components/PromotionForm";
import PromotionHistory from "./components/PromotionHistory";
import { PromotionContext } from "../../context/PromotionContext";

export default function Promotion() {
  const { activeTab } = useContext(PromotionContext);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">
        Promotions temporaires
      </h2>

      {/* Tabs */}
      <PromotionTabs />

      {/* Content */}
      {activeTab === "creation" ? <PromotionForm /> : <PromotionHistory />}

      {/* Bottom spacing */}
      <div className="h-16"></div>
    </div>
  );
}
