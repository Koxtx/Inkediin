import React, { useState } from "react";
import { ChevronRight, Paperclip, Send } from "lucide-react";

export default function CustomProjet() {
  const [activeTab, setActiveTab] = useState("tracking");
  const [activeProjectTimeline, setActiveProjectTimeline] = useState("Phénix Japonais");

  const projects = [
    {
      id: 1,
      title: "Phénix Japonais",
      artist: "TattooArtist1",
      status: "in-progress",
      statusText: "En cours",
      description: "Tatouage personnalisé d'un phénix dans le style japonais traditionnel, à placer sur l'épaule droite.",
      startDate: "12/04/2025",
      endDate: null,
      budget: "450€",
      primaryAction: "Contacter",
      secondaryAction: "Détails"
    },
    {
      id: 2,
      title: "Mandala Floral",
      artist: "TattooArtist3",
      status: "pending",
      statusText: "En attente",
      description: "Mandala personnalisé avec motifs floraux pour un tatouage sur l'avant-bras. Style géométrique et fin.",
      startDate: "18/04/2025",
      endDate: null,
      budget: "300€",
      primaryAction: "Suivi",
      secondaryAction: "Annuler"
    },
    {
      id: 3,
      title: "Portrait Réaliste",
      artist: "TattooArtist2",
      status: "completed",
      statusText: "Terminé",
      description: "Portrait réaliste noir et gris basé sur la photo fournie. Tatouage réalisé sur l'avant-bras gauche.",
      startDate: null,
      endDate: "05/04/2025",
      budget: "550€",
      primaryAction: "Avis",
      secondaryAction: "Voir"
    }
  ];

  const timelineEvents = [
    {
      title: "Demande envoyée",
      date: "12 Avril 2025, 14:30",
      description: "Votre demande de tatouage personnalisé a été envoyée au tatoueur.",
      status: "completed"
    },
    {
      title: "Demande acceptée",
      date: "13 Avril 2025, 09:15",
      description: "TattooArtist1 a accepté votre projet et commence à travailler sur l'esquisse.",
      status: "completed"
    },
    {
      title: "Première esquisse",
      date: "15 Avril 2025, 16:42",
      description: "La première esquisse a été partagée. Vous pouvez demander des modifications.",
      status: "completed"
    },
    {
      title: "Révisions en cours",
      date: "17 Avril 2025, 11:20",
      description: "Le tatoueur travaille sur les modifications demandées.",
      status: "in-progress"
    }
  ];

  const messages = {
    "Phénix Japonais": [
      {
        date: "15 Avril 2025",
        exchanges: [
          {
            type: "received",
            content: "Bonjour ! Voici la première esquisse pour votre tatouage de phénix. J'ai essayé de capturer l'essence du style japonais traditionnel.",
            time: "14:30",
            hasImage: true
          },
          {
            type: "sent",
            content: "Merci pour l'esquisse ! J'aime beaucoup le design global, mais est-ce qu'on pourrait accentuer un peu plus les flammes autour du phénix ?",
            time: "15:45",
            hasImage: false
          }
        ]
      },
      {
        date: "17 Avril 2025",
        exchanges: [
          {
            type: "received",
            content: "J'ai retravaillé les flammes comme demandé. Qu'en pensez-vous de cette version ?",
            time: "11:20",
            hasImage: true
          },
          {
            type: "sent",
            content: "C'est parfait ! Les flammes sont exactement comme je les imaginais. Je valide cette version.",
            time: "11:35",
            hasImage: false
          },
          {
            type: "received",
            content: "Super ! Je vais finaliser le design pour notre rendez-vous du 25 avril. Avez-vous d'autres questions ou ajustements ?",
            time: "11:42",
            hasImage: false
          }
        ]
      }
    ],
    "Mandala Floral": [
      {
        date: "18 Avril 2025",
        exchanges: [
          {
            type: "sent",
            content: "Bonjour, je suis intéressé par un tatouage mandala avec des éléments floraux pour mon avant-bras. Je cherche un style géométrique assez fin.",
            time: "09:15",
            hasImage: false
          },
          {
            type: "received",
            content: "Bonjour ! Merci pour votre demande. Je serais ravi de créer ce design pour vous. Pourriez-vous me donner plus de détails sur les fleurs que vous aimeriez intégrer ?",
            time: "10:30",
            hasImage: false
          }
        ]
      }
    ]
  };

  // État pour le projet actuellement sélectionné dans les messages
  const [activeMessageProject, setActiveMessageProject] = useState("Phénix Japonais");
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    // Gérer l'envoi du message ici
    if (messageInput.trim()) {
      console.log("Message envoyé:", messageInput);
      setMessageInput("");
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "in-progress":
        return "bg-yellow-500";
      case "pending":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Mes projets personnalisés
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm sm:text-base ${
            activeTab === "tracking"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("tracking")}
        >
          Suivi des demandes
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm sm:text-base ${
            activeTab === "exchange"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("exchange")}
        >
          Échanges & Révisions
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-20">
        {/* Tracking Tab */}
        {activeTab === "tracking" && (
          <div className="space-y-8">
            {/* Project Cards */}
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      <div className="ml-3">
                        <h3 className="font-bold text-gray-800 dark:text-white">{project.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{project.artist}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColorClass(project.status)}`}>
                      {project.statusText}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {project.startDate && (
                        <span className="mr-4">Commencé le: {project.startDate}</span>
                      )}
                      {project.endDate && (
                        <span className="mr-4">Terminé le: {project.endDate}</span>
                      )}
                      <span>Budget: {project.budget}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end bg-gray-50 dark:bg-gray-750 px-4 py-3 gap-3">
                    <button className="px-4 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                      {project.secondaryAction}
                    </button>
                    <button className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm">
                      {project.primaryAction}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-white">
                Projet: {activeProjectTimeline}
              </h3>

              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        event.status === "completed" ? "bg-green-500" : "bg-yellow-500"
                      } text-white`}>
                        {event.status === "completed" ? "✓" : "..."}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 my-2"></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">{event.title}</h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{event.date}</div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exchange Tab */}
        {activeTab === "exchange" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Project Selection for Mobile */}
            <div className="sm:hidden p-4 border-b border-gray-200 dark:border-gray-700">
              <select 
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                value={activeMessageProject}
                onChange={(e) => setActiveMessageProject(e.target.value)}
              >
                {Object.keys(messages).map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Selection for Desktop */}
            <div className="hidden sm:flex border-b border-gray-200 dark:border-gray-700">
              {Object.keys(messages).map((project) => (
                <button
                  key={project}
                  className={`py-3 px-4 font-medium text-sm ${
                    activeMessageProject === project
                      ? "border-b-2 border-red-500 text-red-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveMessageProject(project)}
                >
                  {project}
                </button>
              ))}
            </div>
            
            {/* Project Header */}
            <div className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-800 dark:text-white">{activeMessageProject}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {projects.find(p => p.title === activeMessageProject)?.artist || ""}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "600px" }}>
              {messages[activeMessageProject].map((messageGroup, groupIndex) => (
                <div key={groupIndex}>
                  <div className="flex justify-center my-4">
                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">
                      {messageGroup.date}
                    </span>
                  </div>

                  {messageGroup.exchanges.map((message, messageIndex) => (
                    <div 
                      key={messageIndex}
                      className={`flex mb-4 ${message.type === "sent" ? "justify-end" : ""}`}
                    >
                      {message.type === "received" && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 flex-shrink-0 self-end"></div>
                      )}
                      
                      <div className={`max-w-xs sm:max-w-md ${message.type === "sent" ? "order-first" : "order-last"}`}>
                        <div 
                          className={`px-4 py-2 rounded-lg ${
                            message.type === "sent" 
                              ? "bg-red-500 text-white ml-auto" 
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                          }`}
                        >
                          <p>{message.content}</p>
                          {message.hasImage && (
                            <div className="mt-2 bg-gray-300 dark:bg-gray-600 rounded h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
                              [Image d'esquisse]
                            </div>
                          )}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${message.type === "sent" ? "text-right" : "text-left"}`}>
                          {message.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center">
              <input
                type="text"
                placeholder="Écrire un message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-white"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2">
                <Paperclip size={20} />
              </button>
              <button 
                className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                onClick={handleSendMessage}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}