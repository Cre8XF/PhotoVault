// ============================================================================
// COMPONENT: ConfirmModal.jsx – elegant bekreftelsesdialog uten inline-style
// ============================================================================
import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  title = "Bekreft handling",
  message = "Er du sikker på at du vil fortsette?",
  confirmLabel = "Bekreft",
  cancelLabel = "Avbryt",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-white/10
                   bg-gradient-to-b from-gray-800/90 to-gray-900/90 text-gray-100 animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* Body */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="ripple-effect px-5 py-2 rounded-xl bg-gray-700/70 hover:bg-gray-600/80
                       text-gray-200 text-sm font-semibold transition-all duration-150"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="ripple-effect px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 
                       text-white text-sm font-semibold shadow-sm transition-all duration-150"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
