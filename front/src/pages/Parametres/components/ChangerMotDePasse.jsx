import React, { useState, useCallback } from "react";
import { changePassword } from "../../../api/auth.api";
import toast from "react-hot-toast";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";

export default function ChangerMotDePasse({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Effacer l'erreur correspondante quand l'utilisateur tape
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Le mot de passe actuel est requis";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est requis";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer le nouveau mot de passe";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit être différent de l'ancien";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);

        const response = await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });

        if (response && response.success !== false) {
          toast.success("Mot de passe modifié avec succès !");
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          if (onBack) onBack();
        } else {
          const errorMessage =
            response?.message ||
            "Erreur lors de la modification du mot de passe";
          toast.error(errorMessage);

          if (
            errorMessage.toLowerCase().includes("incorrect") ||
            errorMessage.toLowerCase().includes("actuel")
          ) {
            setErrors({ currentPassword: "Mot de passe actuel incorrect" });
          }
        }
      } catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        toast.error("Erreur lors de la modification du mot de passe");
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, onBack]
  );

  const getPasswordStrength = useCallback((password) => {
    if (!password) return { strength: 0, label: "" };

    let strength = 0;
    const checks = [
      password.length >= 6,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    const labels = ["", "Très faible", "Faible", "Moyen", "Bon", "Excellent"];
    const colors = [
      "",
      "text-red-500",
      "text-orange-500",
      "text-yellow-500",
      "text-blue-500",
      "text-green-500",
    ];

    return {
      strength,
      label: labels[strength],
      color: colors[strength],
      percentage: (strength / 5) * 100,
    };
  }, []);

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Changer de mot de passe
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mot de passe actuel */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Votre mot de passe actuel"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                    errors.currentPassword
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Votre nouveau mot de passe"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                    errors.newPassword
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Indicateur de force du mot de passe */}
            {formData.newPassword && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Force du mot de passe
                  </span>
                  <span className={passwordStrength.color}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.strength <= 1
                        ? "bg-red-500"
                        : passwordStrength.strength <= 2
                        ? "bg-orange-500"
                        : passwordStrength.strength <= 3
                        ? "bg-yellow-500"
                        : passwordStrength.strength <= 4
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${passwordStrength.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Confirmer le nouveau mot de passe */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                    errors.confirmPassword
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Conseils de sécurité */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conseils pour un mot de passe sécurisé :
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Au moins 6 caractères</li>
                <li>• Mélange de lettres majuscules et minuscules</li>
                <li>• Inclure des chiffres</li>
                <li>• Utiliser des caractères spéciaux (!@#$%)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Modification..." : "Modifier"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
