import React, { useEffect } from "react";

export const Toast = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Définition des styles en fonction du type de toast
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-700";
    }
  };

  // Définition des icônes en fonction du type de toast
  const getToastIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "!";
      case "info":
        return "i";
      default:
        return "";
    }
  };

  return (
    <div className={`${getToastStyles()} text-white rounded-lg shadow-lg flex items-center justify-between p-4 mb-3 transform transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 font-bold">
          {getToastIcon()}
        </div>
        <div className="pr-4">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-white opacity-70 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};