import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { update } from "../../../api/auth.api";
import toast from "react-hot-toast";
import { ArrowLeft, User, Palette, AlertTriangle, Check } from "lucide-react";

export default function GererTypeCompte({ onBack }) {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(user?.userType || null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleTypeChange = (newType) => {
    if (newType === user?.userType) {
      return; 
    }
    
    setSelectedType(newType);
    setShowConfirm(true);
  };

  const confirmTypeChange = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        _id: user._id,
        userType: selectedType,
        // Réinitialiser certains champs si on passe de tatoueur à client
        ...(selectedType === 'client' && user.userType === 'tatoueur' && {
          bio: null,
          styles: null,
          portfolio: null,
          followers: "0"
        })
      };

      const response = await update(updateData);
      
      if (response) {
        // Mettre à jour le contexte utilisateur
        const updatedUser = { ...user, ...updateData };
        setUser(updatedUser);
        
        toast.success(
          selectedType === 'tatoueur' 
            ? "Votre compte a été converti en compte tatoueur !" 
            : "Votre compte a été converti en compte client !"
        );
        
        setShowConfirm(false);
        if (onBack) onBack();
      } else {
        toast.error("Erreur lors de la modification du type de compte");
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("Erreur lors de la modification du type de compte");
    } finally {
      setLoading(false);
    }
  };

  const AccountTypeCard = ({ type, title, description, features, icon: Icon, isSelected, onSelect }) => (
    <div 
      className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
          : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-400'
      }`}
      onClick={() => onSelect(type)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Icon className={`w-6 h-6 mr-3 ${isSelected ? 'text-red-500' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-semibold ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {title}
          </h3>
        </div>
        {isSelected && (
          <Check className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        {description}
      </p>
      
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );

  const ConfirmationModal = () => (
    <div className="fixed inset-0bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Confirmer le changement
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {selectedType === 'tatoueur' ? (
            "Vous allez convertir votre compte en compte tatoueur. Vous aurez accès à des fonctionnalités supplémentaires comme la gestion de portfolio et les statistiques."
          ) : (
            "Vous allez convertir votre compte en compte client. Certaines données spécifiques aux tatoueurs (bio, styles, portfolio) seront supprimées."
          )}
        </p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={confirmTypeChange}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Modification..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Gérer votre type de compte
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Informations actuelles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Type de compte actuel
            </h2>
            <div className="flex items-center">
              {user?.userType === 'tatoueur' ? (
                <Palette className="w-5 h-5 text-red-500 mr-2" />
              ) : (
                <User className="w-5 h-5 text-blue-500 mr-2" />
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {user?.userType === 'tatoueur' ? 'Compte Tatoueur' : 'Compte Client'}
              </span>
            </div>
          </div>

          {/* Options de type de compte */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <AccountTypeCard
              type="client"
              title="Compte Client"
              description="Parfait pour rechercher et réserver des tatoueurs, gérer vos projets et suivre vos tatouages."
              features={[
                "Rechercher des tatoueurs",
                "Réserver des rendez-vous", 
                "Gérer vos projets de tatouage",
                "Créer une wishlist",
                "Suivre vos tatoueurs favoris",
                "Messagerie avec les tatoueurs"
              ]}
              icon={User}
              isSelected={selectedType === 'client'}
              onSelect={handleTypeChange}
            />

            <AccountTypeCard
              type="tatoueur"
              title="Compte Tatoueur"
              description="Idéal pour les professionnels qui souhaitent promouvoir leur travail et gérer leur clientèle."
              features={[
                "Créer et gérer votre portfolio",
                "Recevoir des demandes de clients",
                "Gérer vos rendez-vous",
                "Publier des flash tattoos",
                "Statistiques de performance",
                "Promotion de votre travail",
                "Messagerie avec les clients"
              ]}
              icon={Palette}
              isSelected={selectedType === 'tatoueur'}
              onSelect={handleTypeChange}
            />
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Important à savoir
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Changer de type de compte peut affecter certaines de vos données. Si vous passez d'un compte tatoueur à un compte client, 
                  vos informations spécifiques au tatouage (bio, styles, portfolio) seront supprimées.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirm && <ConfirmationModal />}
    </div>
  );
}