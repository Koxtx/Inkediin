// src/components/promotion/PromotionHistory.js
import React, { useContext } from "react";
import { EyeIcon, HeartIcon, MessageSquareIcon } from "lucide-react";
import { PromotionContext } from "../../../context/PromotionContext";

export default function PromotionHistory() {
  const { promotions, updatePromotion, endPromotion, restartPromotion } = useContext(PromotionContext);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const handleViewStats = (id) => {
    // Implémentation future de la visualisation des statistiques
 
  };

  return (
    <div className="space-y-6">
      {promotions.map((promotion) => (
        <div key={promotion.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold dark:text-white">{promotion.title}</h3>
              <span className={`${
                promotion.status === "active" 
                  ? "bg-red-500" 
                  : "bg-gray-500"
              } text-white px-3 py-1 rounded-full text-xs`}>
                {promotion.status === "active" ? "Active" : "Terminée"}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Du {formatDate(promotion.startDate)} au {formatDate(promotion.endDate)}
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {promotion.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                <span>{promotion.stats.views}</span>
              </div>
              <div className="flex items-center">
                <HeartIcon className="h-4 w-4 mr-1" />
                <span>{promotion.stats.likes}</span>
              </div>
              <div className="flex items-center">
                <MessageSquareIcon className="h-4 w-4 mr-1" />
                <span>{promotion.stats.comments}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
            {promotion.status === "active" ? (
              <>
                <button 
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  onClick={() => handleViewStats(promotion.id)}
                >
                  Modifier
                </button>
                <button 
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  onClick={() => endPromotion(promotion.id)}
                >
                  Terminer
                </button>
              </>
            ) : (
              <>
                <button 
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  onClick={() => handleViewStats(promotion.id)}
                >
                  Statistiques
                </button>
                <button 
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  onClick={() => restartPromotion(promotion.id)}
                >
                  Relancer
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      
      {promotions.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Vous n'avez pas encore créé de promotions.
          </p>
        </div>
      )}
    </div>
  );
}