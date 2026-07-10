// src/components/SearchBar.jsx
import React, { useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({
  value = "",
  onChange,
  onClear,
  placeholder = "Cari file atau folder...",
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  const inputRef = useRef(null);

  // PENTING: Jaga fokus tetap di input saat value berubah
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      // Hanya fokus jika user sedang mengetik (bukan saat pertama kali render)
      if (value.length > 0) {
        inputRef.current.focus();
      }
    }
  }, [value]);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const syntheticEvent = { target: { value: "" } };
      onChange(syntheticEvent);
    }
    // Fokus kembali ke input setelah clear
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search Icon */}
      <FaSearch
        className="absolute left-3.5 text-gray-400 w-4 h-4 pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        // Mobile optimization
        inputMode="search"
        enterKeyHint="search"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        autoComplete="off"
        className="
          w-full pl-10 pr-10 py-2.5 
          bg-white border border-gray-300 rounded-lg 
          text-sm text-gray-900 placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          disabled:bg-gray-100 disabled:cursor-not-allowed 
          transition-all duration-200
          /* PENTING: Cegah layout shift di mobile */
          min-height: 40px;
        "
      />

      {/* Right Side: Loading Spinner or Clear Button */}
      <div className="absolute right-3 flex items-center pointer-events-none z-10">
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-blue-500"
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
        ) : value && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="
              pointer-events-auto
              text-gray-400 hover:text-gray-600 
              focus:outline-none p-1 rounded-full 
              hover:bg-gray-100 transition-colors duration-200
            "
            aria-label="Clear search"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;