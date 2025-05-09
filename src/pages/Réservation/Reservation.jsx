import React, { useState } from "react";

export default function Reservation() {
  const [activeTab, setActiveTab] = useState("en-attente");
  const [userType, setUserType] = useState("client"); // 'client' ou 'artist'

  // Données des réservations côté client
  const clientReservations = {
    enAttente: [
      {
        id: 1,
        artistName: "TattooArtist1",
        date: "Demande envoyée le 12/04/2025",
        status: "pending",
        statusText: "En attente",
        type: "Flash",
        description: "Tatouage fleur de lotus sur l'avant-bras, taille environ 10cm. Première session demandée pour le 25/04/2025."
      }
    ],
    confirmees: [
      {
        id: 2,
        artistName: "TattooArtist3",
        date: "Confirmé pour le 30/04/2025",
        status: "accepted",
        statusText: "Confirmé",
        type: "Old School",
        description: "Tatouage hirondelle traditionnel, épaule droite. Rendez-vous le 30/04/2025 à 14h00."
      }
    ],
    passees: [
      {
        id: 3,
        artistName: "TattooArtist2",
        date: "Demande du 05/04/2025",
        status: "declined",
        statusText: "Refusé",
        type: "Réaliste",
        description: "Portrait réaliste, avant-bras. Motif du refus: Agenda complet jusqu'en juin."
      }
    ]
  };

  // Données des réservations côté artiste
  const artistReservations = {
    enAttente: [
      {
        id: 4,
        clientName: "Client123",
        date: "Demande reçue le 15/04/2025",
        status: "pending",
        statusText: "En attente",
        type: "Flash",
        description: "Je souhaiterais me faire tatouer votre flash de rose. Disponible en semaine à partir de 17h.",
        actions: true
      },
      {
        id: 5,
        clientName: "TattooLover22",
        date: "Demande reçue le 16/04/2025",
        status: "pending",
        statusText: "En attente",
        type: "Custom",
        description: "Bonjour, j'aimerais un tatouage personnalisé d'un phénix sur l'omoplate. Taille environ 20cm. Disponible les weekends.",
        actions: true
      }
    ],
    confirmees: [
      {
        id: 6,
        clientName: "InkAddict78",
        date: "Confirmé pour le 28/04/2025",
        status: "accepted",
        statusText: "Confirmé",
        type: "Géométrique",
        description: "Motif géométrique sur l'avant-bras. Rendez-vous fixé pour le 28/04/2025 à 11h00.",
        actions: false
      }
    ],
    passees: []
  };

  // Fonction pour rendre un tag de statut avec la couleur appropriée
  const renderStatusTag = (status, text) => {
    const statusClasses = {
      pending: "bg-yellow-500",
      accepted: "bg-green-500",
      declined: "bg-red-500",
      completed: "bg-blue-500"
    };

    return (
      <div className={`${statusClasses[status]} text-white text-xs md:text-sm px-3 py-1 rounded-full inline-block`}>
        {text}
      </div>
    );
  };

  // Fonction pour obtenir les réservations actuellement visibles
  const getVisibleReservations = () => {
    const reservationData = userType === "client" ? clientReservations : artistReservations;
    
    switch (activeTab) {
      case "en-attente":
        return reservationData.enAttente;
      case "confirmees":
        return reservationData.confirmees;
      case "passees":
        return reservationData.passees;
      default:
        return [];
    }
  };

  // Bascule entre vue client et artiste (pour démonstration)
  const toggleUserType = () => {
    setUserType(userType === "client" ? "artist" : "client");
  };

  const visibleReservations = getVisibleReservations();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Gestion des réservations
        </h2>
        
        {/* Toggle pour changer de vue (client/artiste) - pour démonstration */}
        <button 
          onClick={toggleUserType}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
        >
          Voir en tant que {userType === "client" ? "artiste" : "client"}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm md:text-base whitespace-nowrap ${
            activeTab === "en-attente"
              ? "bg-red-500 text-white border-b-2 border-red-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("en-attente")}
        >
          En attente
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm md:text-base whitespace-nowrap ${
            activeTab === "confirmees"
              ? "bg-red-500 text-white border-b-2 border-red-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("confirmees")}
        >
          Confirmées
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm md:text-base whitespace-nowrap ${
            activeTab === "passees"
              ? "bg-red-500 text-white border-b-2 border-red-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("passees")}
        >
          Passées
        </button>
      </div>

      {/* Liste des réservations */}
      <div className="space-y-4">
        {visibleReservations.length > 0 ? (
          visibleReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg"
            >
              {/* En-tête de la réservation */}
              <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                <div className="flex-grow">
                  <div className="font-medium">
                    {userType === "client" ? reservation.artistName : reservation.clientName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {reservation.date}
                  </div>
                </div>
              </div>

              {/* Détails de la réservation */}
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {renderStatusTag(reservation.status, reservation.statusText)}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Type: {reservation.type}
                  </div>
                </div>
                
                <div className="text-sm mb-4">
                  {reservation.description}
                </div>

                {/* Boutons d'action (uniquement pour les artistes et les réservations en attente) */}
                {userType === "artist" && reservation.actions && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-300">
                      Accepter
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucune réservation trouvée dans cette catégorie
          </div>
        )}
      </div>

      {/* Espace pour le menu inférieur sur mobile */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
}