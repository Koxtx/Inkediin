import React from "react";

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
