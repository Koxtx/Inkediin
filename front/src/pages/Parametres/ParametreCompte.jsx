import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function ParametreCompte() {
  const [toggleStates, setToggleStates] = useState({
    messages: true,
    nouveauxTatoueurs: false,
    reservations: true,
    deuxFacteurs: false
  });

  const handleToggle = (key) => {
    setToggleStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const Toggle = ({ isOn, onToggle }) => (
    <div 
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${isOn ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      onClick={onToggle}
    >
      <div 
        className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 top-0.5 ${isOn ? 'translate-x-6' : 'translate-x-0.5'}`} 
      />
    </div>
  );

  const OptionWithArrow = ({ text }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
      <div className="font-medium text-gray-800 dark:text-gray-200">{text}</div>
      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
    </div>
  );

  const OptionWithToggle = ({ text, stateKey }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
      <div className="font-medium text-gray-800 dark:text-gray-200">{text}</div>
      <Toggle 
        isOn={toggleStates[stateKey]} 
        onToggle={() => handleToggle(stateKey)} 
      />
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-gray-100 dark:bg-gray-700 py-3 px-4 font-bold text-gray-700 dark:text-gray-200">
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Paramètres du compte
      </h1>

      <Section title="Informations personnelles">
        <OptionWithArrow text="Modifier le profil" />
        <OptionWithArrow text="Changer de mot de passe" />
        <OptionWithArrow text="Gérer votre type de compte" />
      </Section>

      <Section title="Notifications">
        <OptionWithToggle text="Messages" stateKey="messages" />
        <OptionWithToggle text="Nouveaux tatoueurs" stateKey="nouveauxTatoueurs" />
        <OptionWithToggle text="Réservations" stateKey="reservations" />
      </Section>

      <Section title="Paramètres de confidentialité">
        <OptionWithArrow text="Visibilité du profil" />
        <OptionWithArrow text="Qui pouvez vous contacter" />
      </Section>

      <Section title="Options de sécurité">
        <OptionWithToggle text="Authentification à deux facteurs" stateKey="deuxFacteurs" />
        <OptionWithArrow text="Appareils connectés" />
      </Section>

      <div className="flex justify-center mt-8 mb-20">
        <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors font-medium">
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}