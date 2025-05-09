import React, { useState, useEffect } from "react";

// Composant Toast individuel
const Toast = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Définition des styles en fonction du type de toast
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-700";
    }
  };

  // Définition des icônes en fonction du type de toast
  const getToastIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "!";
      case "info":
        return "i";
      default:
        return "";
    }
  };

  return (
    <div className={`${getToastStyles()} text-white rounded-lg shadow-lg flex items-center justify-between p-4 mb-3 transform transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 font-bold">
          {getToastIcon()}
        </div>
        <div className="pr-4">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-white opacity-70 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};

// Conteneur principal des toasts
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

// Composant de démonstration
export default function NotifToast() {
  const [toasts, setToasts] = useState([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  // Suppression d'un toast
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Ajout d'un nouveau toast
  const addToast = (type, message, duration = 5000) => {
    const newId = toastIdCounter;
    setToastIdCounter(toastIdCounter + 1);
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: newId, type, message, duration },
    ]);
  };

  // Exemples de notifications
  const exampleToasts = [
    {
      type: "success",
      message: "Votre réservation a été confirmée avec succès!",
    },
    {
      type: "error",
      message: "Une erreur s'est produite. Veuillez réessayer.",
    },
    {
      type: "warning",
      message: "Votre session expirera dans 5 minutes.",
    },
    {
      type: "info",
      message: "Vous avez 3 nouveaux messages.",
    },
    {
      type: "success",
      message: "Le tatouage a été ajouté à vos favoris.",
    },
    {
      type: "info",
      message: "TattooArtist1 est maintenant en ligne.",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Notifications Toast</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 mb-8">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Les notifications toast apparaissent temporairement pour informer l'utilisateur d'un événement
          sans interrompre son flux de travail. Cliquez sur les boutons ci-dessous pour voir des exemples.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exampleToasts.map((toast, index) => (
            <button
              key={index}
              className={`p-4 rounded-lg text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 
              ${toast.type === 'success' ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' : 
                toast.type === 'error' ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 
                toast.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' : 
                'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'}`}
              onClick={() => addToast(toast.type, toast.message)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 font-bold">
                  {toast.type === 'success' ? '✓' : 
                   toast.type === 'error' ? '✕' : 
                   toast.type === 'warning' ? '!' : 'i'}
                </div>
                <div className="text-left">
                  <div className="font-medium">{toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}</div>
                  <div className="text-sm text-white text-opacity-80">Afficher notification</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notification usage examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Utilisation dans l'application</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Réservation confirmée</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Affichée après qu'un utilisateur confirme une réservation.
            </p>
            <button 
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              onClick={() => addToast("success", "Votre réservation a été confirmée avec succès!")}
            >
              Tester cette notification
            </button>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Message de l'artiste</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Affichée quand un tatoueur envoie un message à l'utilisateur.
            </p>
            <button 
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              onClick={() => addToast("info", "Nouveau message de TattooArtist2: 'Bonjour, je suis disponible pour discuter de votre projet.'")}
            >
              Tester cette notification
            </button>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Erreur de paiement</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Affichée si le paiement n'a pas pu être traité.
            </p>
            <button 
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              onClick={() => addToast("error", "Échec du paiement. Veuillez vérifier vos informations bancaires.")}
            >
              Tester cette notification
            </button>
          </div>
        </div>
      </div>

      {/* Toast Container - sera rendu en position fixed */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}