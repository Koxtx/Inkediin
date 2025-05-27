import React, { useState } from "react";

// Composant de Modal réutilisable
const ModalContainer = ({ title, children, isFullscreen = false }) => {
  return isFullscreen ? (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {children}
    </div>
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-red-500 text-white font-medium py-3 px-4">
          {title}
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// Modal de démonstration
export default function Modal() {
  const [activeDemo, setActiveDemo] = useState(null);

  const openDemo = (demoNumber) => {
    setActiveDemo(demoNumber);
  };

  const closeDemo = () => {
    setActiveDemo(null);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Modales et Overlays</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Demo Buttons */}
        <DemoButton 
          title="Confirmation de réservation" 
          onClick={() => openDemo(1)} 
        />
        <DemoButton 
          title="Aperçu rapide d'un flash" 
          onClick={() => openDemo(2)} 
        />
        <DemoButton 
          title="Ajout aux favoris" 
          onClick={() => openDemo(3)} 
        />
        <DemoButton 
          title="Confirmation de suppression" 
          onClick={() => openDemo(4)} 
        />
        <DemoButton 
          title="Détails d'une notification" 
          onClick={() => openDemo(5)} 
        />
        <DemoButton 
          title="Visualisation plein écran" 
          onClick={() => openDemo(6)} 
        />
      </div>

      {/* Modal 1: Confirmation de réservation */}
      {activeDemo === 1 && (
        <ModalContainer title="Confirmation de réservation">
          <div className="space-y-4">
            <p className="text-gray-800 dark:text-gray-200">
              Voulez-vous confirmer votre réservation avec TattooArtist1 pour le 25 avril à 14h30?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Une fois confirmée, l'artiste recevra une notification et pourra accepter ou refuser votre demande.
            </p>
            <div className="flex justify-end space-x-3 mt-4">
              <button 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={closeDemo}
              >
                Annuler
              </button>
              <button 
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                onClick={closeDemo}
              >
                Confirmer
              </button>
            </div>
          </div>
        </ModalContainer>
      )}

      {/* Modal 2: Aperçu rapide d'un flash */}
      {activeDemo === 2 && (
        <ModalContainer title="Aperçu du flash">
          <div className="flex flex-col items-center">
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-3"></div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Tribal Dragon</h3>
            <div className="text-red-500 font-bold text-xl mb-3">120 €</div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-500"></div>
              <span className="text-gray-800 dark:text-gray-200">TattooArtist2</span>
            </div>
            <button 
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              onClick={closeDemo}
            >
              Réserver ce flash
            </button>
          </div>
        </ModalContainer>
      )}

      {/* Modal 3: Formulaire court (ajout aux favoris) */}
      {activeDemo === 3 && (
        <ModalContainer title="Ajouter aux favoris">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Collection
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600 focus:border-red-300 dark:focus:border-red-600">
                <option>Mes favoris</option>
                <option>À faire plus tard</option>
                <option>Inspirations</option>
                <option>Nouvelle collection...</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Note (optionnel)
              </label>
              <textarea 
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600 focus:border-red-300 dark:focus:border-red-600"
                placeholder="Ajouter une note..."
                rows="3"
              ></textarea>
            </div>
            <button 
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              onClick={closeDemo}
            >
              Ajouter
            </button>
          </div>
        </ModalContainer>
      )}

      {/* Modal 4: Confirmation de suppression */}
      {activeDemo === 4 && (
        <ModalContainer title="Confirmation">
          <div className="space-y-4">
            <p className="text-gray-800 dark:text-gray-200">
              Êtes-vous sûr de vouloir supprimer ce tatouage de votre portfolio ?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cette action est irréversible et le tatouage ne sera plus visible pour les clients.
            </p>
            <div className="flex justify-end space-x-3 mt-4">
              <button 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={closeDemo}
              >
                Annuler
              </button>
              <button 
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                onClick={closeDemo}
              >
                Supprimer
              </button>
            </div>
          </div>
        </ModalContainer>
      )}

      {/* Modal 5: Détails d'une notification */}
      {activeDemo === 5 && (
        <ModalContainer title="Notification">
          <div className="space-y-4">
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-500 mr-3 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  TattooArtist3 a accepté votre demande de rendez-vous
                </div>
                <div className="text-gray-700 dark:text-gray-300 my-1">
                  Votre rendez-vous pour un tatouage "Phoenix" est confirmé pour le 30 avril à 15h00.
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Aujourd'hui, 11:23
                </div>
              </div>
            </div>
            <button 
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              onClick={closeDemo}
            >
              Voir les détails du rendez-vous
            </button>
          </div>
        </ModalContainer>
      )}

      {/* Modal 6: Visualisation d'image en plein écran */}
      {activeDemo === 6 && (
        <ModalContainer title="" isFullscreen={true}>
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-50">
            <div className="w-6"></div>
            <div className="text-white">2/5</div>
            <button 
              className="text-white text-2xl font-bold w-6 h-6 flex items-center justify-center"
              onClick={closeDemo}
            >
              ×
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-xl h-auto max-h-screen p-4">
              <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-500 dark:bg-gray-600 rounded-lg"></div>
            </div>
          </div>
        </ModalContainer>
      )}
    </div>
  );
}

// Composant de bouton pour les démos
function DemoButton({ title, onClick }) {
  return (
    <button
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
      onClick={onClick}
    >
      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Cliquez pour voir l'exemple
      </p>
    </button>
  );
}