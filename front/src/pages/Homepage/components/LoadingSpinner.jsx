import React from "react";
import { Loader } from "lucide-react";

const LoadingSpinner = ({ message = "Chargement..." }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;