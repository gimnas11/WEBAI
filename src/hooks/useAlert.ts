import { useState, useCallback } from 'react';
import { AlertType } from '../components/AlertModal';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: AlertType;
  title?: string;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((message: string, type: AlertType = 'info', title?: string) => {
    setAlert({
      isOpen: true,
      message,
      type,
      title,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, 'error', title);
  }, [showAlert]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, 'success', title);
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, 'warning', title);
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert(message, 'info', title);
  }, [showAlert]);

  return {
    alert,
    showAlert,
    closeAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

