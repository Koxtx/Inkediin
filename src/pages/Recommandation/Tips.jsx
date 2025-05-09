import React, { useState } from "react";
import { ChevronRight, X, Info, HelpCircle } from "lucide-react";

export default function Tips() {
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const [showPriceTooltip, setShowPriceTooltip] = useState(false);
  const [showCustomizableTooltip, setShowCustomizableTooltip] = useState(false);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [showContactTooltip, setShowContactTooltip] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8">Guide d'utilisation</h1>
      
      {/* Section 1: Explications des fonctionnalités */}
      <section className="mb-12">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-5 text-red-500">1. Explications des fonctionnalités</h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
          {/* Chat privé tooltip */}
          <div className="mb-8 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="font-bold">Chat privé</h3>
            </div>
            <div className="ml-14 text-gray-600 dark:text-gray-300">
              Accédez à vos conversations privées avec les tatoueurs. Discutez des détails de votre projet et posez vos questions avant de réserver.
            </div>
          </div>
          
          {/* Recherche de tatoueur */}
          <div className="flex justify-center mb-8">
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 font-medium">
              Trouver un tatoueur
            </button>
          </div>
          
          {/* Welcome tooltip */}
          {showWelcomeTooltip && (
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-600 relative mb-2">
              <button 
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setShowWelcomeTooltip(false)}
              >
                <X size={18} />
              </button>
              <div className="flex gap-3">
                <div className="text-2xl">👋</div>
                <div>
                  <div className="font-bold text-lg mb-1">Bienvenue sur Inkediin !</div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    Découvrez comment trouver le tatoueur parfait pour votre prochain projet. Nous vous guiderons à travers les fonctionnalités principales.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowWelcomeTooltip(false)}
                >
                  Plus tard
                </button>
                <button 
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                  onClick={() => setShowWelcomeTooltip(false)}
                >
                  Commencer
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Section 2: Informations sur les prix */}
      <section className="mb-12">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-5 text-red-500">2. Informations supplémentaires sur les prix</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Flash card 1 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg relative overflow-visible">
            <h3 className="font-bold mb-2">Dragon Tribal</h3>
            <div className="flex items-center">
              <span className="text-xl font-bold">120 €</span>
              <button 
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowPriceTooltip(!showPriceTooltip)}
              >
                <Info size={16} />
              </button>
            </div>
            
            {/* Prix tooltip */}
            {showPriceTooltip && (
              <div className="absolute z-10 top-full left-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-600 w-64">
                <div className="font-bold mb-2">Détail du prix</div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-300">Design du tatouage:</span>
                    <span>80 €</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Séance de tatouage:</span>
                    <span>40 €</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>120 €</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    * Les retouches dans les 3 mois sont incluses
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Flash card 2 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg relative overflow-visible">
            <h3 className="font-bold mb-2">Serpent & Roses</h3>
            <div className="flex items-center">
              <span className="text-xl font-bold">200 €</span>
              <span className="ml-2 bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                Personnalisable
              </span>
              <button 
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowCustomizableTooltip(!showCustomizableTooltip)}
              >
                <Info size={16} />
              </button>
            </div>
            
            {/* Personnalisable tooltip */}
            {showCustomizableTooltip && (
              <div className="absolute z-10 top-full left-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-600 w-64">
                <button 
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={() => setShowCustomizableTooltip(false)}
                >
                  <X size={16} />
                </button>
                <div className="font-bold mb-2">Prix personnalisable</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  Ce tatouage peut être modifié selon vos préférences. Le prix final peut varier en fonction de la complexité et de la taille des modifications demandées.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Section 3: Conseils d'utilisation */}
      <section>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-5 text-red-500">3. Conseils d'utilisation</h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Recherche */}
          <div className="mb-10 relative">
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-300" 
                placeholder="Rechercher..." 
                onFocus={() => setShowSearchTooltip(true)}
                onBlur={() => setShowSearchTooltip(false)}
              />
            </div>
            
            {/* Recherche tooltip */}
            {showSearchTooltip && (
              <div className="absolute z-10 top-0 left-1/4 transform -translate-y-full mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-600 w-64">
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  Utilisez des mots clés comme "dragon", "fleurs", ou "géométrique" pour trouver des designs qui correspondent à vos envies.
                </div>
              </div>
            )}
          </div>
          
          {/* Contact artist */}
          <div className="mb-12 relative">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white"></div>
                <div className="font-bold">TattooArtist1</div>
              </div>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                onMouseEnter={() => setShowContactTooltip(true)}
                onMouseLeave={() => setShowContactTooltip(false)}
              >
                Contacter
              </button>
            </div>
            
            {/* Contact tooltip */}
            {showContactTooltip && (
              <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="font-bold mb-1">Conseil de pro</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  Avant de contacter un tatoueur, consultez son portfolio complet et vérifiez ses disponibilités. Préparez des références visuelles pour mieux expliquer votre projet.
                </div>
              </div>
            )}
          </div>
          
          {/* Help button */}
          <div className="flex justify-end relative">
            <button 
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              onMouseEnter={() => setShowHelpTooltip(true)}
              onMouseLeave={() => setShowHelpTooltip(false)}
            >
              <HelpCircle size={24} />
            </button>
            
            {/* Help tooltip */}
            {showHelpTooltip && (
              <div className="absolute z-10 bottom-full right-0 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-600 w-64">
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  Besoin d'aide ? Cliquez ici pour accéder à notre guide d'utilisation et nos conseils pour obtenir le meilleur tatouage.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}