// src/components/Card.jsx
import React from "react";

/**
 * Card Component - Reusable card untuk menampilkan file/folder
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Konten di dalam card
 * @param {string} props.className - Custom className untuk override styling
 * @param {boolean} props.hover - Enable/disable hover effect (default: true)
 * @param {Function} props.onClick - Handler ketika card di-klik
 * @param {string} props.padding - Custom padding (default: 'p-4')
 * @param {boolean} props.selected - Status apakah card sedang selected
 */
const Card = ({
  children,
  className = "",
  hover = true,
  onClick = null,
  padding = "p-4",
  selected = false,
}) => {
  const baseClasses = `
    bg-white 
    rounded-lg 
    shadow-sm 
    border 
    transition-all 
    duration-200
    ${padding}
  `;

  const hoverClasses =
    hover && onClick
      ? "hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5"
      : "";
  const clickClasses = onClick ? "cursor-pointer" : "";
  const selectedClasses = selected
    ? "border-blue-500 bg-blue-50 shadow-md"
    : "border-gray-200";

  const combinedClasses =
    `${baseClasses} ${hoverClasses} ${clickClasses} ${selectedClasses} ${className}`.trim();

  return (
    <div
      className={combinedClasses}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
