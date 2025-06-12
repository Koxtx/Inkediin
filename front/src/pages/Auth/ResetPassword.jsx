import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPassword } from "../../api/auth.api";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = en cours de vérification
  const [token, setToken] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token: paramToken } = useParams(); // Pour /reset-password/:token
  const location = useLocation();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Extraire le token de différentes sources possibles
  useEffect(() => {
    console.log("🔍 Recherche du token...");
    console.log("URL actuelle:", location.pathname + location.search);
    console.log("Search params:", Object.fromEntries(searchParams));
    console.log("Param token:", paramToken);

    let extractedToken = null;

    // 1. D'abord essayer depuis les paramètres d'URL (/resetpassword/:token)
    if (paramToken) {
      extractedToken = paramToken;
      console.log("Token depuis params URL:", extractedToken);
    }

    // 2. Ensuite essayer depuis les query parameters (?token=...)
    if (!extractedToken) {
      extractedToken = searchParams.get("token");
      console.log("Token depuis query params:", extractedToken);
    }

    // 3. Essayer depuis l'URL complète (au cas où le token serait dans le path)
    if (!extractedToken) {
      const pathParts = location.pathname.split('/');
      const resetIndex = pathParts.findIndex(part => part === 'reset-password' || part === 'resetpassword');
      if (resetIndex !== -1 && pathParts[resetIndex + 1]) {
        extractedToken = pathParts[resetIndex + 1];
        console.log("Token depuis path:", extractedToken);
      }
    }

    // 4. Essayer depuis le hash (au cas où #token=...)
    if (!extractedToken && location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      extractedToken = hashParams.get("token");
      console.log("Token depuis hash:", extractedToken);
    }

    console.log("Token final extrait:", extractedToken);

    if (extractedToken && extractedToken.trim() !== "") {
      setToken(extractedToken);
      setTokenValid(true);
      console.log("✅ Token trouvé:", extractedToken);
    } else {
      setTokenValid(false);
      console.log("❌ Aucun token trouvé");
      toast.error("Lien de réinitialisation invalide ou expiré");
    }
  }, [searchParams, paramToken, location]);

  const schema = yup.object({
    password: yup
      .string()
      .required("Le mot de passe est obligatoire")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
      ),
    confirmPassword: yup
      .string()
      .required("La confirmation du mot de passe est obligatoire")
      .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas"),
  });

  const defaultValues = {
    password: "",
    confirmPassword: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const submit = async (values) => {
    setIsSubmitting(true);
    
    try {
      console.log("🔐 Réinitialisation du mot de passe avec token:", token);
      
      const result = await resetPassword({
        token: token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      
      console.log("📨 Résultat resetPassword:", result);
      
      // Vérifier si result existe et a une propriété success
      if (result && (result.success || result.messageOk)) {
        setResetSuccess(true);
        toast.success(result.message || result.messageOk || "Mot de passe réinitialisé avec succès !");
      } else {
        const errorMessage = result?.message || "Erreur lors de la réinitialisation";
        toast.error(errorMessage);
        
        // Vérifier si le token est expiré/invalide
        if (errorMessage.includes("invalide") || errorMessage.includes("expiré") || errorMessage.includes("Jeton")) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error("💥 Erreur lors de la réinitialisation:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage pendant la vérification du token
  if (tokenValid === null) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  // Affichage si le token est invalide
  if (tokenValid === false) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Lien invalide ou expiré
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ce lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/forgotpassword"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center"
            >
              Demander un nouveau lien
            </Link>
            
            <Link
              to="/signin"
              className="w-full text-red-500 hover:text-red-600 py-2 px-4 font-medium transition-colors flex items-center justify-center"
            >
              <ArrowLeft size={18} className="mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si la réinitialisation a réussi
  if (resetSuccess) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Mot de passe réinitialisé !
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          
          <Link
            to="/signin"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
      <div className="mb-6">
        <Link
          to="/signin"
          className="inline-flex items-center text-red-500 hover:text-red-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour à la connexion
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-center">
        Nouveau mot de passe
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Entrez votre nouveau mot de passe ci-dessous.
      </p>

      <form
        onSubmit={handleSubmit(submit)}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
      >
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
          >
            Nouveau mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full pl-10 pr-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300"
              disabled={isSubmitting}
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
          >
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="w-full pl-10 pr-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Critères du mot de passe :
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Au moins 8 caractères</li>
            <li>• Au moins une lettre minuscule</li>
            <li>• Au moins une lettre majuscule</li>
            <li>• Au moins un chiffre</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center"
        >
          <Lock size={18} className="mr-2" />
          {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </div>
  );
}