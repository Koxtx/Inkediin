import React from 'react'

export default function SignUp() {
    const [userType, setUserType] = useState("client");

    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 mb-2">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M100,30 L120,60 L80,60 Z" fill="currentColor" />
              <path d="M70,70 C60,80 60,120 70,130" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M130,70 C140,80 140,120 130,130" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M90,80 Q100,70 110,80" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M85,100 L115,100 L115,110 L85,110 Z" fill="currentColor" />
              <path d="M100,110 L100,140" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-red-500">Inkediin</div>
        </div>
        
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center">Créer votre compte Inkediin</h1>
        
        <form className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Vous êtes :</label>
            <div className="flex rounded-lg overflow-hidden">
              <button 
                type="button"
                className={`flex-1 py-3 px-4 text-center ${
                  userType === "client" 
                  ? "bg-red-500 text-white" 
                  : "bg-red-400 hover:bg-red-500 text-white"
                } transition-colors`}
                onClick={() => setUserType("client")}
              >
                <span>👤 Client</span>
              </button>
              <button 
                type="button"
                className={`flex-1 py-3 px-4 text-center ${
                  userType === "artist" 
                  ? "bg-red-500 text-white" 
                  : "bg-red-400 hover:bg-red-500 text-white"
                } transition-colors`}
                onClick={() => setUserType("artist")}
              >
                <span>🎨 Tatoueur</span>
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Nom d'utilisateur
            </label>
            <input 
              type="text" 
              id="username" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              placeholder="Choisissez un pseudo"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Adresse email
            </label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              placeholder="votre@email.com"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Mot de passe
            </label>
            <input 
              type="password" 
              id="password" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              placeholder="•••••••• (8 caractères min.)"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Confirmer le mot de passe
            </label>
            <input 
              type="password" 
              id="confirm-password" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-start mb-6">
            <div className="flex items-center h-5">
              <input 
                type="checkbox"
                id="terms"
                className="w-4 h-4 accent-red-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                J'accepte les <Link to="#" className="text-red-500 hover:underline">Conditions d'utilisation</Link> et la <Link to="#" className="text-red-500 hover:underline">Politique de confidentialité</Link>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            S'inscrire
          </button>
          
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400">
              Déjà un compte ? <Link to="/login" className="text-red-500 hover:underline">Se connecter</Link>
            </p>
          </div>
        </form>
      </div>
    );
  }

