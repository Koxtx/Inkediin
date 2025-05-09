import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

export default function SignIn() {
    const [rememberMe, setRememberMe] = useState(false);

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
        
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center">Connexion à Inkediin</h1>
        
        <form className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input 
                type="email" 
                id="email" 
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="votre@email.com"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password" 
                id="password" 
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input 
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 accent-red-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Se souvenir de moi
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-red-500 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center"
          >
            <User size={18} className="mr-2" />
            Se connecter
          </button>
          
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400">
              Pas encore de compte ? <Link to="/signup" className="text-red-500 hover:underline">S'inscrire</Link>
            </p>
          </div>
        </form>
      </div>
  )
}
