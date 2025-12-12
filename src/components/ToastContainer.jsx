import { createPortal } from 'react-dom'
import Toast from './Toast'

const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="toast-container fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>,
    document.body
  )
}

export default ToastContainer
