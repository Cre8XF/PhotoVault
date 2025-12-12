import { useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X
} from 'lucide-react'

const Toast = ({ type = 'info', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-900 dark:text-green-100'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      borderColor: 'border-red-500',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-900 dark:text-red-100'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-900 dark:text-yellow-100'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-900 dark:text-blue-100'
    }
  }

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type]

  return (
    <div className={`toast-item flex items-start gap-3 p-4 rounded-xl border-l-4 ${bgColor} ${borderColor} shadow-lg animate-slide-in`}>
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      <p className={`flex-1 text-sm font-medium ${textColor}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${iconColor}`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export default Toast
