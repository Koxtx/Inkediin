import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Conversation() {
  const [newMessage, setNewMessage] = useState('');
  
  // Sample data for conversation
  const contactInfo = {
    initials: "JS",
    name: "Julie S.",
    status: "En ligne"
  };
  
  const messages = [
    {
      content: "Bonjour ! J'ai vu votre flash de rose old school et je suis intéressée.",
      time: "09:42",
      sent: false
    },
    {
      content: "Bonjour Julie ! Merci pour votre intérêt. La rose est toujours disponible.",
      time: "09:45",
      sent: true
    },
    {
      content: "Super ! J'aimerais la réserver pour le mois prochain si possible.",
      time: "09:48",
      sent: false
    },
    {
      content: "Bien sûr, voici le design dont nous parlons :",
      time: "09:50",
      sent: true
    },
    {
      isProduct: true,
      title: "Rose Old School",
      price: "150 €",
      sent: true
    },
    {
      content: "J'ai des disponibilités les 15, 16 et 20 mai. Est-ce qu'une de ces dates vous conviendrait ?",
      time: "09:51",
      sent: true
    },
    {
      content: "Le 16 mai serait parfait pour moi. Comment procède-t-on pour la réservation ?",
      time: "10:15",
      sent: false
    },
    {
      content: "Et est-ce qu'il y a un acompte à verser ?",
      time: "10:15",
      sent: false
    },
    {
      content: "Parfait ! Je vais bloquer le 16 mai pour vous. Oui, il y a un acompte de 50€ pour confirmer la réservation. Vous pouvez le régler directement via l'application en cliquant sur le bouton de réservation du flash.",
      time: "10:20",
      sent: true
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      // Here you would add the message to your messages array
      // and clear the input field
      setNewMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-prim">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md px-4 py-3 flex items-center">
        <Link to="/messagerie" className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 mr-4 text-xl">
          ←
        </Link>
        <div className="w-10 h-10 rounded-full bg-red-400 text-white flex items-center justify-center font-medium">
          {contactInfo.initials}
        </div>
        <div className="ml-3 flex-grow">
          <div className="font-semibold text-gray-900 dark:text-white">{contactInfo.name}</div>
          <div className="text-xs text-green-500">{contactInfo.status}</div>
        </div>
        <div className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 cursor-pointer">
          <span className="text-2xl">⋯</span>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-grow overflow-y-auto px-4 py-6">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            Aujourd'hui
          </span>
        </div>

        {messages.map((message, index) => (
          <div key={index}>
            {message.isProduct ? (
              <div className={`flex justify-${message.sent ? 'end' : 'start'} mb-4`}>
                <div className="max-w-xs sm:max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">Image du flash</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <div className="text-gray-900 dark:text-white font-medium">{message.title}</div>
                    <div className="text-red-500 font-bold">{message.price}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex ${message.sent ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className="relative max-w-xs sm:max-w-md">
                  <div className={`px-4 py-2 rounded-lg ${
                    message.sent 
                      ? 'bg-red-400 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}>
                    {message.content}
                  </div>
                  <span className={`text-xs text-gray-500 ${message.sent ? 'text-right' : 'text-left'} block mt-1`}>
                    {message.time}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 shadow-inner flex items-center">
        <button className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 mr-3 text-xl">
          +
        </button>
        <div className="flex-grow relative">
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors resize-none dark:bg-gray-700 dark:text-white"
            placeholder="Écrivez un message..."
            rows="1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500">
            😊
          </button>
        </div>
        <button 
          className="ml-3 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-xl"
          onClick={handleSendMessage}
        >
          →
        </button>
      </div>
    </div>
  );
}