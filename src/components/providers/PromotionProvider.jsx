import React, { useState } from "react";
import { PromotionContext } from "../../context/PromotionContext";

export const PromotionProvider = ({ children }) => {
  // États pour les promotions
  const [promotions, setPromotions] = useState([
    {
      id: "1",
      title: "-20% sur les Flash Tattoos",
      description: "Offre spéciale de printemps! 20% de réduction sur tous les modèles flash disponibles en studio.",
      discount: 20,
      startDate: "2025-04-10",
      endDate: "2025-04-25",
      categories: ["Flash"],
      status: "active",
      stats: { views: 254, likes: 42, comments: 18 }
    },
    {
      id: "2",
      title: "Offre découverte: Premier tatouage -15%",
      description: "Offre pour les nouveaux clients. 15% de réduction sur le premier tatouage en studio.",
      discount: 15,
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      categories: ["Tous"],
      status: "completed",
      stats: { views: 487, likes: 98, comments: 36 }
    },
    {
      id: "3",
      title: "Offre Saint-Valentin: Tatouages duo",
      description: "Venez en couple et recevez 25% de réduction sur le deuxième tatouage.",
      discount: 25,
      startDate: "2025-02-01",
      endDate: "2025-02-14",
      categories: ["Tous"],
      status: "completed",
      stats: { views: 312, likes: 85, comments: 29 }
    }
  ]);
  
  const [activeTab, setActiveTab] = useState("creation");
  const [availableCategories, setAvailableCategories] = useState([
    "Flash", "Réaliste", "Old School", "Tribal", "Japonais", "New School", "Tous"
  ]);
  
  // État pour le formulaire de création
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    discount: "",
    startDate: "",
    endDate: "",
    categories: ["Flash", "Réaliste", "Old School"]
  });

  // Fonctions pour gérer les promotions
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCategoryToggle = (category) => {
    setNewPromotion(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  const addNewCategory = (categoryName) => {
    if (categoryName && !availableCategories.includes(categoryName)) {
      setAvailableCategories([...availableCategories, categoryName]);
    }
  };
  
  const updatePromotionField = (field, value) => {
    setNewPromotion({
      ...newPromotion,
      [field]: value
    });
  };
  
  const createPromotion = () => {
    const id = Date.now().toString();
    const promotion = {
      id,
      ...newPromotion,
      status: "active",
      stats: { views: 0, likes: 0, comments: 0 }
    };
    
    setPromotions([promotion, ...promotions]);
    
    // Réinitialiser le formulaire
    setNewPromotion({
      title: "",
      description: "",
      discount: "",
      startDate: "",
      endDate: "",
      categories: ["Flash", "Réaliste", "Old School"]
    });
  };
  
  const updatePromotion = (id, updatedData) => {
    setPromotions(promotions.map(promo => 
      promo.id === id ? { ...promo, ...updatedData } : promo
    ));
  };
  
  const endPromotion = (id) => {
    updatePromotion(id, { status: "completed" });
  };
  
  const restartPromotion = (id) => {
    const promotion = promotions.find(p => p.id === id);
    if (promotion) {
      // Créer une nouvelle promotion basée sur l'ancienne
      const newPromo = {
        ...promotion,
        id: Date.now().toString(),
        startDate: new Date().toISOString().split("T")[0],
        endDate: "", // À définir par l'utilisateur
        status: "active",
        stats: { views: 0, likes: 0, comments: 0 }
      };
      setPromotions([newPromo, ...promotions]);
    }
  };

  // Valeur du contexte à exposer
  const value = {
    promotions,
    activeTab,
    availableCategories,
    newPromotion,
    handleTabChange,
    handleCategoryToggle,
    addNewCategory,
    updatePromotionField,
    createPromotion,
    updatePromotion,
    endPromotion,
    restartPromotion
  };

  return <PromotionContext.Provider value={value}>{children}</PromotionContext.Provider>;
};