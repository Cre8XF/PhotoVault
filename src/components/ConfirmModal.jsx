// ============================================================================
// COMPONENT: ConfirmModal.jsx – bekreftelsesdialog for sletting og advarsler
// ============================================================================
import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-gradient-to-b from-gray-800/90 to-gray-900/90
                   rounded-2xl p-6 shadow-2xl border border-gray-700/50 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-yellow-400 w-6 h-6" />
          <h2 className="text-xl font-semibold text-white">{title || "Bekreft handling"}</h2>
        </div>

        {/* Body */}
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          {message || "Er du sikker på at du vil fortsette?"}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl bg-gray-700/60 hover:bg-gray-600/70 
                       text-gray-200 text-sm font-semibold transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600/80 hover:bg-red-700 
                       text-white text-sm font-semibold transition-colors"
          >
            Ja, slett
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
