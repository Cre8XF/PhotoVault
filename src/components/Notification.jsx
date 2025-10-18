// ============================================================================
// COMPONENT: Notification.jsx – moderne toast-varsler (stabil)
// ============================================================================
import React, { useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const iconMap = {
  success: <CheckCircle2 className="text-green-400 w-5 h-5" />,
  error:   <XCircle     className="text-red-400 w-5 h-5" />,
  info:    <Info        className="text-blue-400 w-5 h-5" />,
  warning: <AlertTriangle className="text-yellow-400 w-5 h-5" />,
};

const Notification = ({ notification, onClose, setNotification }) => {
  // Safe defaults (hooks må kalles uansett)
  const message  = notification?.message ?? "";
  const type     = notification?.type ?? "info";
  const duration = notification?.duration ?? 3000;

  // Robust lukker
  const handleClose = useCallback(() => {
    if (typeof onClose === "function") onClose();
    else if (typeof setNotification === "function") setNotification(null);
  }, [onClose, setNotification]);

  // Auto-close kun når det faktisk finnes et varsel
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(handleClose, duration);
    return () => clearTimeout(t);
  }, [notification, duration, handleClose]);

  if (!notification) return null;

  const colors = {
    success: "from-green-500/70 to-green-600/50 border-green-400/40",
    error:   "from-red-500/70 to-red-600/50 border-red-400/40",
    info:    "from-blue-500/70 to-blue-600/50 border-blue-400/40",
    warning: "from-yellow-500/70 to-yellow-600/50 border-yellow-400/40",
  }[type];

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideIn">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg 
        bg-gradient-to-r ${colors} border backdrop-blur-md text-white font-medium`}
      >
        {iconMap[type]}
        <span>{message}</span>
        <button
          onClick={handleClose}
          className="ml-2 hover:opacity-70 transition-opacity"
          title="Lukk varsel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
