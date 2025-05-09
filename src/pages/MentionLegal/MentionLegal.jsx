import React, { useState } from "react";

export default function MentionLegal() {
  const [activeTab, setActiveTab] = useState("cgu");

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8">Mentions Légales et Politiques</h1>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 mb-6 pb-1">
        <button 
          className={`px-4 py-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 whitespace-nowrap
            ${activeTab === "cgu" ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
          onClick={() => setActiveTab("cgu")}
        >
          CGU
        </button>
        <button 
          className={`px-4 py-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 whitespace-nowrap
            ${activeTab === "confidentialite" ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
          onClick={() => setActiveTab("confidentialite")}
        >
          Confidentialité
        </button>
        <button 
          className={`px-4 py-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 whitespace-nowrap
            ${activeTab === "reservation" ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
          onClick={() => setActiveTab("reservation")}
        >
          Réservation
        </button>
      </div>
      
      {/* Content Sections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* CGU Section */}
        {activeTab === "cgu" && (
          <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-500">Conditions générales d'utilisation</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Les présentes conditions générales d'utilisation (les « CGU ») ont pour objet de définir les modalités et conditions d'utilisation des services proposés sur l'application Inkediin (ci-après le « Service »), ainsi que de définir les droits et obligations des parties dans ce cadre.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300">
              Elles sont accessibles et imprimables à tout moment par un lien direct en bas de page de l'application.
            </p>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">1. Exploitation de l'application</h3>
              <p className="text-gray-700 dark:text-gray-300">
                L'application Inkediin est exploitée par la société Inkediin SAS, société par actions simplifiée au capital social de 10 000 euros, immatriculée au RCS de Paris sous le n° 123 456 789, dont le siège social est situé 123 rue de l'Encre, 75001 Paris (ci-après : « Inkediin »).
              </p>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">2. Accès à l'application</h3>
              <p className="text-gray-700 dark:text-gray-300">
                L'application est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Tous les coûts afférents à l'accès à l'application, que ce soient les frais matériels, logiciels ou d'accès à internet sont exclusivement à la charge de l'utilisateur.
              </p>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">3. Inscription sur l'application</h3>
              <p className="text-gray-700 dark:text-gray-300">
                L'utilisation des fonctionnalités de l'application nécessite que l'utilisateur s'inscrive en remplissant le formulaire d'inscription disponible sur l'application, en fournissant l'ensemble des informations marquées comme obligatoires.
              </p>
              
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Toute inscription incomplète ne sera pas validée.
              </p>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">4. Services</h3>
              <p className="text-gray-700 dark:text-gray-300">
                L'application Inkediin propose une plateforme en ligne qui permet la mise en relation entre des tatoueurs professionnels et des clients potentiels.
              </p>
              
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Les tatoueurs peuvent présenter leur travail, définir leurs disponibilités et gérer leurs réservations. Les clients peuvent rechercher des tatoueurs selon divers critères (style, localisation, disponibilité), consulter leurs portfolios et prendre rendez-vous.
              </p>
            </div>
          </div>
        )}
        
        {/* Confidentialité Section */}
        {activeTab === "confidentialite" && (
          <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-500">Politique de confidentialité</h2>
            <p className="text-gray-700 dark:text-gray-300">
              La présente politique de confidentialité définit et vous informe de la manière dont Inkediin utilise et protège les informations que vous nous transmettez, le cas échéant, lorsque vous utilisez notre application.
            </p>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">1. Données collectées</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Nous pouvons collecter les informations suivantes :
              </p>
              <ul className="list-none pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                <li>- Nom et prénom</li>
                <li>- Adresse e-mail</li>
                <li>- Numéro de téléphone</li>
                <li>- Informations professionnelles (pour les tatoueurs)</li>
                <li>- Préférences de tatouage (pour les clients)</li>
                <li>- Données de localisation (avec votre consentement)</li>
                <li>- Informations de paiement</li>
              </ul>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">2. Utilisation des données</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ces informations sont recueillies pour vous fournir les services proposés par notre application, notamment :
              </p>
              <ul className="list-none pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                <li>- La création et la gestion de votre compte utilisateur</li>
                <li>- La mise en relation entre clients et tatoueurs</li>
                <li>- La gestion des réservations et des paiements</li>
                <li>- L'amélioration de nos services et de l'expérience utilisateur</li>
                <li>- L'envoi de communications concernant nos services</li>
              </ul>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">3. Protection des données</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons un cryptage à la pointe de la technologie pour protéger les informations sensibles transmises en ligne.
              </p>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">4. Partage des données</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Nous ne vendons, n'échangeons ni ne transférons vos informations personnelles identifiables à des tiers, sauf lorsque cela est nécessaire pour fournir nos services (par exemple, faciliter les réservations entre clients et tatoueurs).
              </p>
            </div>
          </div>
        )}
        
        {/* Réservation Section */}
        {activeTab === "reservation" && (
          <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-500">Politique de réservation et annulation</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Cette politique définit les conditions de réservation et d'annulation de rendez-vous sur la plateforme Inkediin.
            </p>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">1. Réservation</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Pour réserver un rendez-vous avec un tatoueur sur Inkediin, vous devez :
              </p>
              <ul className="list-none pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                <li>- Être inscrit en tant que client sur l'application</li>
                <li>- Sélectionner un tatoueur disponible</li>
                <li>- Choisir une date et un créneau horaire disponible</li>
                <li>- Détailler votre projet de tatouage</li>
                <li>- Verser un acompte selon les conditions du tatoueur</li>
              </ul>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">2. Confirmation</h3>
              <p className="text-gray-700 dark:text-gray-300">
                La réservation n'est confirmée qu'après acceptation par le tatoueur et réception de l'acompte. Un email de confirmation vous sera envoyé, contenant les détails de votre rendez-vous.
              </p>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">3. Annulation par le client</h3>
              <p className="text-gray-700 dark:text-gray-300">
                En cas d'annulation par le client :
              </p>
              <ul className="list-none pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                <li>- Plus de 72h avant le rendez-vous : remboursement complet de l'acompte</li>
                <li>- Entre 72h et 24h avant le rendez-vous : remboursement de 50% de l'acompte</li>
                <li>- Moins de 24h avant le rendez-vous : aucun remboursement</li>
              </ul>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">4. Annulation par le tatoueur</h3>
              <p className="text-gray-700 dark:text-gray-300">
                En cas d'annulation par le tatoueur :
              </p>
              <ul className="list-none pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                <li>- Remboursement intégral de l'acompte versé</li>
                <li>- Possibilité de report du rendez-vous sans frais supplémentaires</li>
                <li>- Compensation possible selon les circonstances</li>
              </ul>
            </div>
            
            <div className="pt-2">
              <h3 className="text-md sm:text-lg font-bold mb-2">5. Retard</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Tout retard supérieur à 30 minutes sans prévenir pourra être considéré comme une absence et entraîner l'annulation du rendez-vous sans remboursement de l'acompte.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}