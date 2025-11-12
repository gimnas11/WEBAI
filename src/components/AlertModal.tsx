import { useEffect } from 'react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type: AlertType;
  onClose: () => void;
  title?: string;
}

export function AlertModal({ isOpen, message, type, onClose, title }: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Close on ESC key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/30 mb-4">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    error: (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/30 mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    info: (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-900/30 mb-4">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    warning: (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-900/30 mb-4">
        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
  };

  const buttonColors = {
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    error: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  };

  const defaultTitles = {
    success: 'Berhasil',
    error: 'Terjadi Kesalahan',
    info: 'Informasi',
    warning: 'Peringatan',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-message"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-chat-dark rounded-xl shadow-2xl max-w-md w-full border border-chat-border transform transition-all animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            {/* Icon */}
            {icons[type]}

            {/* Title */}
            <h3
              id="alert-title"
              className="text-xl font-bold text-white mb-2"
            >
              {title || defaultTitles[type]}
            </h3>

            {/* Message */}
            <p
              id="alert-message"
              className="text-gray-300 text-sm mb-6 leading-relaxed"
            >
              {message}
            </p>

            {/* Button */}
            <button
              onClick={onClose}
              className={`w-full py-2.5 px-4 ${buttonColors[type]} text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-chat-dark transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

