// src/components/Breadcrumb.jsx
import React from "react";
import { FaChevronRight } from "react-icons/fa";

/**
 * Breadcrumb Component - Navigasi hierarki folder
 *
 * @param {Object} props
 * @param {Array<{label: string, onClick?: Function}>} props.items - Array objek breadcrumb.
 *        Item terakhir akan otomatis dianggap sebagai halaman aktif (tidak bisa di-klik).
 *        Contoh: [{ label: 'My Drive', onClick: () => {} }, { label: 'Documents', onClick: () => {} }, { label: 'Work' }]
 * @param {string} props.className - Custom className tambahan
 */
const Breadcrumb = ({ items = [], className = "" }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex items-center ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 overflow-x-auto">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center flex-shrink-0">
              {/* Item Breadcrumb */}
              {isLast ? (
                // Item Terakhir (Current Page)
                <span
                  className="text-gray-500 font-medium truncate max-w-[200px]"
                  title={item.label}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                // Item yang bisa di-klik
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1.5 py-0.5"
                >
                  {item.label}
                </button>
              )}

              {/* Separator (Chevron) */}
              {!isLast && (
                <FaChevronRight
                  className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
