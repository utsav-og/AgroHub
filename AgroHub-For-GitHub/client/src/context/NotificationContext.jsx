import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Show auto-dismissing toast
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Async confirmation dialog replacing native confirm()
  const confirmAction = useCallback(
    ({
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      isDestructive = false,
    }) => {
      return new Promise((resolve) => {
        setConfirmDialog({
          title,
          message,
          confirmText,
          cancelText,
          isDestructive,
          resolve,
        });
      });
    },
    []
  );

  const handleConfirmClose = (result) => {
    if (confirmDialog && confirmDialog.resolve) {
      confirmDialog.resolve(result);
    }
    setConfirmDialog(null);
  };

  return (
    <NotificationContext.Provider value={{ showToast, confirmAction }}>
      {children}

      {/* Floating Toast Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 size={18} color="#16a34a" />}
              {toast.type === 'error' && <AlertCircle size={18} color="#dc2626" />}
              {toast.type === 'info' && <Info size={18} color="#0284c7" />}
              {toast.type === 'warning' && <AlertTriangle size={18} color="#d97706" />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div className="confirm-modal-overlay" onClick={() => handleConfirmClose(false)}>
          <div
            className="confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <div className="confirm-modal-header">
              <div
                className={`confirm-icon-box ${
                  confirmDialog.isDestructive ? 'bg-red-light' : 'bg-green-light'
                }`}
              >
                {confirmDialog.isDestructive ? (
                  <AlertTriangle size={22} color="#dc2626" />
                ) : (
                  <CheckCircle2 size={22} color="#16a34a" />
                )}
              </div>
              <h3 id="confirm-modal-title">{confirmDialog.title}</h3>
            </div>
            <div className="confirm-modal-body">
              <p>{confirmDialog.message}</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => handleConfirmClose(false)}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                className={confirmDialog.isDestructive ? 'btn-modal-danger' : 'btn-modal-primary'}
                onClick={() => handleConfirmClose(true)}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
