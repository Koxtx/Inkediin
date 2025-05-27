import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const schema = yup.object({
    email: yup
      .string()
      .email()
      .required("Le champ est obligatoire")
      .matches(
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
        "Format de votre email non valide"
      ),
  });

  const defaultValues = {
    email: "",
    password: "",
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
    login(values);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center">
        Connexion à Inkediin
      </h1>

      <form
        onSubmit={handleSubmit(submit)}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
      >
        <div className="mb-4">
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
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
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
            <label
              htmlFor="remember"
              className="ml-2 text-sm text-gray-600 dark:text-gray-400"
            >
              Se souvenir de moi
            </label>
          </div>
          <Link
            to="/forgotpassword"
            className="text-sm text-red-500 hover:underline"
          >
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
            Pas encore de compte ?{" "}
            <Link to="/signup" className="text-red-500 hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
