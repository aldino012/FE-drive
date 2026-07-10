// src/components/Button.jsx
import React from "react";

/**
 * Button Component - Universal reusable button
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Label atau konten button
 * @param {Function} props.onClick - Handler ketika button di-klik
 * @param {string} props.variant - Style variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'ghost' (default: 'primary')
 * @param {string} props.size - Ukuran button: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {boolean} props.isLoading - Tampilkan loading spinner (default: false)
 * @param {boolean} props.disabled - Disable button (default: false)
 * @param {boolean} props.fullWidth - Button full width (default: false)
 * @param {string} props.type - Type HTML button: 'button' | 'submit' | 'reset' (default: 'button')
 * @param {React.ReactNode} props.leftIcon - Icon di sebelah kiri label
 * @param {React.ReactNode} props.rightIcon - Icon di sebelah kanan label
 * @param {string} props.className - Custom className tambahan
 * @param {string} props.loadingText - Text saat loading (default: kosong, tetap pakai children)
 */
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  leftIcon = null,
  rightIcon = null,
  className = "",
  loadingText = "",
  ...rest
}) => {
  // Variant styles
  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
    warning:
      "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 shadow-sm",
    outline:
      "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
  };

  // Size styles
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xl: "px-6 py-3 text-lg",
  };

  // Icon size based on button size
  const iconSizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const combinedClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg
            className={`animate-spin -ml-1 mr-2 ${iconSizeClasses[size] || "w-4 h-4"}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span
              className={`${iconSizeClasses[size] || "w-4 h-4"} mr-2 flex items-center`}
            >
              {leftIcon}
            </span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span
              className={`${iconSizeClasses[size] || "w-4 h-4"} ml-2 flex items-center`}
            >
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;