import React, { useState } from 'react';
import GuideCard from './components/GuideCard';
import FaqItem from './components/FaqItem';

export default function Support() {
  const [activeTab, setActiveTab] = useState('faq');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Support</h2>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 md:gap-3 mb-5 pb-2">
        <button
          className={`${
            activeTab === 'faq' ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
          } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
          onClick={() => handleTabChange('faq')}
        >
          FAQ
        </button>
        <button
          className={`${
            activeTab === 'contact' ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
          } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
          onClick={() => handleTabChange('contact')}
        >
          Contact
        </button>
        <button
          className={`${
            activeTab === 'guides' ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
          } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
          onClick={() => handleTabChange('guides')}
        >
          Guides
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
        {/* FAQ Content */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <FaqItem 
              question="Comment réserver un tatoueur ?"
              answer="Pour réserver un tatoueur, naviguez vers son profil, sélectionnez le design souhaité ou consultation personnalisée, puis cliquez sur Prendre rendez-vous. Vous pourrez choisir une date et une heure disponibles et effectuer un acompte pour confirmer votre réservation."
            />
            <FaqItem 
              question="Comment devenir tatoueur sur Inkediin ?"
              answer="Pour devenir tatoueur sur notre plateforme, vous devez créer un compte Tatoueur, soumettre votre portfolio, vos diplômes sanitaires et les documents légaux requis. Notre équipe vérifiera vos informations sous 48h avant d'approuver votre compte professionnel."
            />
            <FaqItem 
              question="Comment annuler un rendez-vous ?"
              answer="Pour annuler un rendez-vous, allez dans Mes réservations depuis votre profil, sélectionnez le rendez-vous concerné et cliquez sur Annuler. Notez que les conditions d'annulation et de remboursement varient selon la politique de chaque tatoueur."
            />
            <FaqItem 
              question="Comment acheter un flash de tatouage ?"
              answer="Les flashes de tatouage peuvent être achetés directement sur la plateforme. Naviguez vers le flash qui vous intéresse, cliquez sur Acheter et suivez les instructions de paiement. Une fois acheté, le tatoueur est informé et le flash vous est réservé."
            />
            <FaqItem 
              question="Comment modifier mon profil ?"
              answer="Pour modifier votre profil, cliquez sur l'icône de profil en bas à droite, puis sur l'icône de paramètres en haut. Vous pourrez y modifier vos informations personnelles, vos préférences et gérer vos paramètres de confidentialité."
            />
          </div>
        )}
        
        {/* Contact Content */}
        {activeTab === 'contact' && (
          <div className="max-w-lg mx-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium dark:text-gray-200">Nom</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Votre nom" 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:focus:ring-red-600 dark:focus:border-red-600"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium dark:text-gray-200">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="votre@email.com" 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:focus:ring-red-600 dark:focus:border-red-600"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium dark:text-gray-200">Sujet</label>
                <select 
                  id="subject" 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:focus:ring-red-600 dark:focus:border-red-600"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="account">Problème de compte</option>
                  <option value="booking">Problème de réservation</option>
                  <option value="payment">Problème de paiement</option>
                  <option value="artist">Devenir tatoueur</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium dark:text-gray-200">Message</label>
                <textarea 
                  id="message" 
                  rows="4" 
                  placeholder="Décrivez votre problème en détail..." 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:focus:ring-red-600 dark:focus:border-red-600"
                ></textarea>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="attachment" className="block text-sm font-medium dark:text-gray-200">Pièce jointe (optionnel)</label>
                <input 
                  type="file" 
                  id="attachment" 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-red-300 focus:border-red-300 dark:focus:ring-red-600 dark:focus:border-red-600"
                />
              </div>
              
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600">
                Envoyer
              </button>
            </div>
          </div>
        )}
        
        {/* Guides Content */}
        {activeTab === 'guides' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuideCard 
              icon="📖"
              title="Guide du débutant"
              description="Tout ce que vous devez savoir pour votre premier tatouage."
            />
            <GuideCard 
              icon="🔍"
              title="Comment trouver le bon tatoueur"
              description="Conseils pour choisir le tatoueur qui correspond à votre style."
            />
            <GuideCard 
              icon="🧼"
              title="Soins après tatouage"
              description="Conseils pour prendre soin de votre nouveau tatouage."
            />
            <GuideCard 
              icon="💼"
              title="Guide pour les tatoueurs"
              description="Comment optimiser votre profil et attirer plus de clients."
            />
            <GuideCard 
              icon="📱"
              title="Utilisation de l'application"
              description="Tutoriel complet des fonctionnalités de l'application."
            />
          </div>
        )}
      </div>
    </div>
  );
}

