import { create } from 'zustand'

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, {
      ...toast,
      id: Date.now() + Math.random()
    }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}))

export const useToast = () => {
  const { toasts, addToast, removeToast } = useToastStore()

  const showToast = ({ type = 'info', message, duration = 5000 }) => {
    addToast({ type, message, duration })
  }

  return {
    toasts,
    removeToast,
    success: (message, duration) => showToast({ type: 'success', message, duration }),
    error: (message, duration) => showToast({ type: 'error', message, duration }),
    warning: (message, duration) => showToast({ type: 'warning', message, duration }),
    info: (message, duration) => showToast({ type: 'info', message, duration })
  }
}
