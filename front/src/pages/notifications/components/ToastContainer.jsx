import React, { useContext } from "react";
import { Toast } from "./Toast";
import { NotifContext } from "../../../context/NotifContext";

export const ToastContainer = () => {
  const { toasts, removeToast } = useContext(NotifContext);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};


