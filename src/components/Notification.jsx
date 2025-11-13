// ============================================================================
// COMPONENT: Notification.jsx – Premium toast notifications
// ============================================================================
import React, { useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const Notification = ({ notification, onClose, setNotification }) => {
  // Safe defaults (hooks må kalles uansett)
  const message  = notification?.message ?? "An error occurred";
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

  // Icon mapping with enhanced styling
  const iconConfig = {
    success: { icon: CheckCircle2, color: "text-green-400" },
    error:   { icon: XCircle, color: "text-red-400" },
    info:    { icon: Info, color: "text-blue-400" },
    warning: { icon: AlertTriangle, color: "text-yellow-400" },
  };

  const { icon: IconComponent, color } = iconConfig[type] || iconConfig.info;

  return (
    <div className="fixed top-20 right-6 z-[9999] animate-slideIn">
      <div className={`toast ${type} flex items-center gap-3`}>
        <div className={`flex-shrink-0 ${color}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <p className="flex-1 text-sm font-medium text-white">
          {message || 'An error occurred'}
        </p>
        <button
          onClick={handleClose}
          className="ripple-effect flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          title="Close notification"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
