import React, { useState } from 'react';

export default function StatTatoueur() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">Statistiques de votre profil</h2>

      {/* Onglets */}
      <div className="flex overflow-x-auto gap-2 md:gap-3 mb-5 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`${
            activeTab === 'overview' ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
          } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('flashes')}
          className={`${
            activeTab === 'flashes' ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
          } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
        >
          Flashs
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`${
            activeTab === 'followers' ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
          } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
        >
          Followers
        </button>
      </div>

      {/* Contenu principal */}
      <div className="w-full">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Vues du profil</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">30 derniers jours</span>
              </div>
              <div className="text-3xl font-bold mb-2">1,248</div>
              <div className="text-green-500 text-sm mb-6">+15% par rapport au mois précédent</div>
              
              <div className="h-32 w-full flex items-end justify-between mb-6">
                {[40, 60, 45, 30, 50, 65, 55, 70, 80, 90].map((height, index) => (
                  <div 
                    key={index}
                    className="w-1/12 bg-red-400 dark:bg-red-600 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Taux de clics</div>
                  <div className="font-semibold">32%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Temps moyen</div>
                  <div className="font-semibold">2m 45s</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Nouvelles visites</div>
                  <div className="font-semibold">854</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Retours</div>
                  <div className="font-semibold">394</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Demandes de réservation</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">30 derniers jours</span>
              </div>
              <div className="text-3xl font-bold mb-2">73</div>
              <div className="text-green-500 text-sm mb-6">+23% par rapport au mois précédent</div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Acceptées</div>
                  <div className="font-semibold">52</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">En attente</div>
                  <div className="font-semibold">14</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Refusées</div>
                  <div className="font-semibold">7</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Taux conversion</div>
                  <div className="font-semibold">71%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flashs */}
        {activeTab === 'flashes' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Performance des flashs</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">Tous les temps</span>
              </div>
              <div className="text-3xl font-bold mb-2">42 flashs</div>
              <div className="text-green-500 text-sm mb-6">4 nouveaux ce mois-ci</div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total vues</div>
                  <div className="font-semibold">8,724</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total likes</div>
                  <div className="font-semibold">1,356</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Réservations</div>
                  <div className="font-semibold">96</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Taux conversion</div>
                  <div className="font-semibold">1.1%</div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Top 3 des flashs les plus populaires</h3>
            
            {[
              { title: "Dragon Tribal", views: 1248, likes: 389, reservations: 27, convRate: "2.2%" },
              { title: "Rose Géométrique", views: 1052, likes: 294, reservations: 22, convRate: "2.1%" },
              { title: "Serpent Minimaliste", views: 986, likes: 231, reservations: 19, convRate: "1.9%" }
            ].map((flash, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <h4 className="font-semibold mb-4">Flash #{index + 1} - {flash.title}</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Vues</div>
                    <div className="font-semibold">{flash.views}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
                    <div className="font-semibold">{flash.likes}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Réservations</div>
                    <div className="font-semibold">{flash.reservations}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Taux conversion</div>
                    <div className="font-semibold">{flash.convRate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Followers */}
        {activeTab === 'followers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Followers</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total : 867</span>
              </div>
              <div className="text-3xl font-bold mb-2">+124</div>
              <div className="text-green-500 text-sm mb-6">Nouveaux followers ce mois-ci</div>
              
              <div className="h-32 w-full flex items-end justify-between mb-6">
                {[30, 35, 40, 45, 50, 60, 65, 75, 85, 95].map((height, index) => (
                  <div 
                    key={index}
                    className="w-1/12 bg-red-400 dark:bg-red-600 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4">Répartition par âge</h3>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute w-full h-full bg-red-300" style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)" }}></div>
                  </div>
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute w-full h-full bg-red-400" style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)", transform: "rotate(220deg)" }}></div>
                  </div>
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute w-full h-full bg-red-500" style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%, 50% 50%)", transform: "rotate(310deg)" }}></div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  {[
                    { label: "18-24 ans", value: "42%" },
                    { label: "25-34 ans", value: "35%" },
                    { label: "35-44 ans", value: "18%" },
                    { label: "45+ ans", value: "5%" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4">Répartition par genre</h3>
              
              <div className="space-y-2">
                {[
                  { label: "Femmes", value: "52%" },
                  { label: "Hommes", value: "45%" },
                  { label: "Non précisé", value: "3%" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4">Top localités</h3>
              
              <div className="space-y-2">
                {[
                  { label: "Paris", value: "32%" },
                  { label: "Lyon", value: "16%" },
                  { label: "Marseille", value: "9%" },
                  { label: "Bordeaux", value: "8%" },
                  { label: "Toulouse", value: "7%" },
                  { label: "Autres", value: "28%" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4">Styles préférés</h3>
              
              <div className="space-y-2">
                {[
                  { label: "Traditionnel", value: "26%" },
                  { label: "Réaliste", value: "23%" },
                  { label: "Géométrique", value: "21%" },
                  { label: "Old School", value: "18%" },
                  { label: "Minimaliste", value: "12%" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}