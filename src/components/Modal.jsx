// src/components/Modal.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Modal Component - Universal reusable modal untuk semua kebutuhan
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Control visibility modal
 * @param {Function} props.onClose - Handler ketika modal ditutup
 * @param {React.ReactNode} props.children - Konten modal
 * @param {string} props.title - Judul modal (optional)
 * @param {React.ReactNode} props.footer - Footer content (optional)
 * @param {string} props.size - Ukuran modal: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
 * @param {boolean} props.closeOnOverlay - Klik overlay untuk tutup (default: true)
 * @param {boolean} props.closeOnEscape - Tekan ESC untuk tutup (default: true)
 * @param {boolean} props.showCloseButton - Tampilkan tombol close (default: true)
 * @param {boolean} props.isLoading - Tampilkan loading state (default: false)
 * @param {string} props.className - Custom className untuk modal content
 * @param {string} props.overlayClassName - Custom className untuk overlay
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title = null,
  footer = null,
  size = "md",
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  isLoading = false,
  className = "",
  overlayClassName = "",
}) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose, isLoading]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Size mapping
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full mx-4",
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-2xl w-full 
          transform transition-all duration-300 
          ${sizeClasses[size] || sizeClasses.md}
          ${className}
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;