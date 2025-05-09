import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function SignUp() {
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const schema = yup.object({
    username: yup.string().required("Le champ est obligatoire"),
    email: yup
      .string()
      .email()
      .required("Le champ est obligatoire")
      .matches(
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
        "Format de votre email non valide"
      ),
    password: yup
      .string()
      .required("Le champ est obligatoire")
      .min(5, "trop court")
      .max(10, "trop long"),
    confirmPassword: yup
      .string()
      .required("Le champ est obligatoire")
      .oneOf(
        [yup.ref("password"), ""],
        "Les mots de passes ne correspondent pas"
      ),
    rgpd: yup
      .boolean()
      .oneOf([true], "Vous devez accepter les termes et conditions"),
  });

  const defaultValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rgpd: false,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const submit = (values) => {
    registerUser(values);
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
    

      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center">
        Créer votre compte Inkediin
      </h1>

      <form
        onSubmit={handleSubmit(submit)}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
      >
        <div className="mb-4">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
            >
              Adresse email
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="votre@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
          >
            Mot de passe
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="•••••••• (8 caractères min.)"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-white"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
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
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-white"
            >
              {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <input
              {...register("rgpd")}
              type="checkbox"
              id="rgpd"
              className="w-4 h-4 accent-red-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="rgpd" className="text-gray-600 dark:text-gray-400">
              J'accepte les{" "}
              <Link to="#" className="text-red-500 hover:underline">
                Conditions d'utilisation
              </Link>{" "}
              et la{" "}
              <Link to="#" className="text-red-500 hover:underline">
                Politique de confidentialité
              </Link>
            </label>
          </div>
          {errors.rgpd && <p className="text-red-500">{errors.rgpd.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          S'inscrire
        </button>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Déjà un compte ?{" "}
            <Link to="/signin" className="text-red-500 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
