import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPassword } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const schema = yup.object({
    email: yup
      .string()
      .email("Format de votre email non valide")
      .required("Le champ email est obligatoire")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g,
        "Format de votre email non valide"
      ),
  });

  const defaultValues = {
    email: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const submit = async (values) => {
    setIsSubmitting(true);
    
    try {
      console.log("📧 Demande de réinitialisation pour:", values.email);
      
      const result = await forgotPassword(values);
      
      // Le serveur renvoie toujours un message de succès pour des raisons de sécurité
      if (result && (result.success || result.message)) {
        setEmailSent(true);
        toast.success(result.message || "Email de réinitialisation envoyé !");
      } else {
        toast.error(result?.message || "Erreur lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("💥 Erreur lors de la demande:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Email envoyé !
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nous avons envoyé un lien de réinitialisation à{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {getValues("email")}
            </span>
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/signin"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center"
            >
              <ArrowLeft size={18} className="mr-2" />
              Retour à la connexion
            </Link>
            
            <button
              onClick={() => {
                setEmailSent(false);
                setIsSubmitting(false);
              }}
              className="w-full text-red-500 hover:text-red-600 py-2 px-4 font-medium transition-colors"
            >
              Renvoyer l'email
            </button>
          </div>
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
        Mot de passe oublié ?
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      <form
        onSubmit={handleSubmit(submit)}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
      >
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
          >
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="votre@email.com"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center"
        >
          <Mail size={18} className="mr-2" />
          {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
        </button>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link to="/signin" className="text-red-500 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}