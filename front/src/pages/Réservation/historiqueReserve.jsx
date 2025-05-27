import React, { useState } from "react";

export default function HistoriqueReservations() {
  const [activeTab, setActiveTab] = useState("current");

  // Données des réservations en cours
  const currentReservations = [
    {
      id: 1,
      artistName: "TattooArtist1",
      status: "confirmed",
      statusText: "Confirmé",
      tattooName: "Tattoo personnalisé",
      tattooStyle: "Réaliste",
      date: "23 avril 2025 à 14h30",
      location: "Studio InkMaster, 15 rue des Arts, Paris",
      payment: "Acompte payé: 75€ / 250€",
      actions: [
        { type: "secondary", text: "Modifier" },
        { type: "primary", text: "Contacter" }
      ]
    },
    {
      id: 2,
      artistName: "TattooArtist3",
      status: "pending",
      statusText: "En attente",
      tattooName: "Flash #42",
      tattooStyle: "Old School",
      date: "30 avril 2025 à 10h00",
      location: "InkVibes Tattoo, 7 avenue Victor Hugo, Lyon",
      payment: "Devis: 180€ (acompte à payer: 50€)",
      actions: [
        { type: "secondary", text: "Annuler" },
        { type: "primary", text: "Payer l'acompte" }
      ]
    }
  ];

  // Données des réservations archivées
  const archivedReservations = [
    {
      id: 3,
      artistName: "TattooArtist2",
      status: "completed",
      statusText: "Terminé",
      tattooName: "Mandala",
      tattooStyle: "Géométrique",
      date: "12 mars 2025 à 11h00",
      location: "Geometrix Studio, 23 rue Saint-Martin, Paris",
      payment: "Montant payé: 220€",
      actions: [
        { type: "secondary", text: "Voir détails" },
        { type: "primary", text: "Laisser un avis" }
      ]
    },
    {
      id: 4,
      artistName: "TattooArtist4",
      status: "cancelled",
      statusText: "Annulé",
      tattooName: "Tribal sleeve",
      tattooStyle: "Tribal",
      date: "28 février 2025 à 15h00",
      location: "Tribal Ink, 5 boulevard Gambetta, Marseille",
      payment: "Acompte remboursé: 100€",
      actions: [
        { type: "secondary", text: "Voir détails" },
        { type: "primary", text: "Réserver à nouveau" }
      ]
    },
    {
      id: 5,
      artistName: "TattooArtist1",
      status: "completed",
      statusText: "Terminé",
      tattooName: "Mini tattoo",
      tattooStyle: "Flash",
      date: "15 janvier 2025 à 16h30",
      location: "Studio InkMaster, 15 rue des Arts, Paris",
      payment: "Montant payé: 80€",
      actions: [
        { type: "secondary", text: "Voir détails" },
        { type: "primary", text: "Laisser un avis" }
      ]
    }
  ];

  // Fonction pour rendre un statut avec la couleur appropriée
  const renderStatus = (status, text) => {
    const statusClasses = {
      confirmed: "bg-green-500",
      pending: "bg-yellow-500",
      completed: "bg-blue-500",
      cancelled: "bg-red-500"
    };

    return (
      <div className={`${statusClasses[status]} text-white text-xs md:text-sm px-2 py-1 rounded-full`}>
        {text}
      </div>
    );
  };

  // Fonction pour rendre un bouton d'action
  const renderActionButton = (type, text) => {
    const buttonClasses = {
      primary: "bg-red-500 hover:bg-red-600 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
    };

    return (
      <button className={`${buttonClasses[type]} px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-300`}>
        {text}
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Historique des réservations</h2>

      {/* Onglets */}
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm md:text-base rounded-tl-lg rounded-bl-lg ${
            activeTab === "current"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("current")}
        >
          En cours
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm md:text-base rounded-tr-lg rounded-br-lg ${
            activeTab === "archived"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("archived")}
        >
          Archives
        </button>
      </div>

      {/* Liste des réservations en cours */}
      {activeTab === "current" && (
        <div className="space-y-4">
          {currentReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg"
            >
              {/* En-tête de la réservation */}
              <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="font-medium">{reservation.artistName}</div>
                </div>
                {renderStatus(reservation.status, reservation.statusText)}
              </div>

              {/* Détails de la réservation */}
              <div className="p-4">
                {/* Informations sur le tatouage */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                  <div>
                    <h3 className="font-bold">{reservation.tattooName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Style: {reservation.tattooStyle}</p>
                  </div>
                </div>

                {/* Lignes de détails */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500">📅</div>
                    <div className="text-sm">{reservation.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500">📍</div>
                    <div className="text-sm">{reservation.location}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500">💰</div>
                    <div className="text-sm">{reservation.payment}</div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-2 mt-4">
                  {reservation.actions.map((action, idx) => (
                    <div key={idx}>
                      {renderActionButton(action.type, action.text)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste des réservations archivées */}
      {activeTab === "archived" && (
        <div className="space-y-4">
          {archivedReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg"
            >
              {/* En-tête de la réservation */}
              <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="font-medium">{reservation.artistName}</div>
                </div>
                {renderStatus(reservation.status, reservation.statusText)}
              </div>

              {/* Détails de la réservation */}
              <div className="p-4">
                {/* Informations sur le tatouage */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                  <div>
                    <h3 className="font-bold">{reservation.tattooName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Style: {reservation.tattooStyle}</p>
                  </div>
                </div>

                {/* Lignes de détails */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500">📅</div>
                    <div className="text-sm">{reservation.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500">📍</div>
                    <div className="text-sm">{reservation.location}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500">💰</div>
                    <div className="text-sm">{reservation.payment}</div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-2 mt-4">
                  {reservation.actions.map((action, idx) => (
                    <div key={idx}>
                      {renderActionButton(action.type, action.text)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Espace pour le menu inférieur sur mobile */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
}